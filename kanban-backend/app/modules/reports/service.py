"""Lógica de negocio del Módulo 6: Reportes y Dashboard (solo lectura)."""
from datetime import datetime, timedelta, timezone

from app.modules.reports import model
from app.shared.authz import ensure_project_access
from app.shared.errors import APIError
from app.shared.utils.objectid import to_object_id


async def dashboard_summary(db, project_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    total = await db.tasks.count_documents({"project_id": oid})
    completed = await db.tasks.count_documents({"project_id": oid, "status": "Done"})

    active_sprint = None
    sprint = await db.sprints.find_one({"project_id": oid, "estado": "Activo"})
    if sprint:
        active_sprint = {
            "id": str(sprint["_id"]),
            "name": sprint.get("nombre") or sprint.get("name", ""),
            "start_date": sprint.get("fecha_inicio") or sprint.get("start_date"),
            "end_date": sprint.get("fecha_fin") or sprint.get("end_date"),
        }

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": total - completed,
        "active_sprint": active_sprint,
    }


async def burndown(db, project_id: str, sprint_id: str, current_user: dict) -> list[dict]:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    sprint = await db.sprints.find_one(
        {"_id": to_object_id(sprint_id, "sprint_id", "Sprint"), "project_id": oid}
    )
    if sprint is None:
        raise APIError(404, "Sprint no encontrado", "sprint_id")

    start = sprint.get("fecha_inicio") or sprint.get("start_date")
    end = sprint.get("fecha_fin") or sprint.get("end_date")
    if not start or not end:
        return []
    start = start.replace(tzinfo=timezone.utc) if start.tzinfo is None else start
    end = end.replace(tzinfo=timezone.utc) if end.tzinfo is None else end

    tasks = [t async for t in db.tasks.find({"sprint_id": sprint["_id"]})]

    def points(task: dict) -> float:
        return float(task.get("story_points") or 1)

    total = sum(points(t) for t in tasks)
    days = max(1, (end.date() - start.date()).days)

    result = []
    for i in range(days + 1):
        day = start.date() + timedelta(days=i)
        ideal = round(total - (total / days) * i, 2)
        day_end = datetime(day.year, day.month, day.day, 23, 59, 59, tzinfo=timezone.utc)
        completados = 0.0
        for t in tasks:
            if t.get("status") == "Done":
                done_at = t.get("updated_at")
                if done_at is None or (
                    done_at.replace(tzinfo=timezone.utc) if done_at.tzinfo is None else done_at
                ) <= day_end:
                    completados += points(t)
        result.append({
            "date": day.isoformat(),
            "ideal_remaining": max(ideal, 0.0),
            "actual_remaining": max(total - completados, 0.0),
        })
    return result


async def workload_report(db, project_id: str, current_user: dict) -> list[dict]:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, oid, current_user, "Manager")

    member_ids = [m["user_id"] for m in project.get("members", [])]
    names: dict[str, str] = {}
    async for u in db.users.find({"_id": {"$in": member_ids}}, {"nombre_completo": 1}):
        names[str(u["_id"])] = u.get("nombre_completo", "")

    result = []
    for member in project.get("members", []):
        uid = member["user_id"]
        todo = await db.tasks.count_documents(
            {"project_id": oid, "assignee_id": uid, "status": {"$in": list(model.TODO_STATUSES)}}
        )
        in_progress = await db.tasks.count_documents(
            {"project_id": oid, "assignee_id": uid, "status": {"$in": list(model.IN_PROGRESS_STATUSES)}}
        )
        done = await db.tasks.count_documents(
            {"project_id": oid, "assignee_id": uid, "status": {"$in": list(model.DONE_STATUSES)}}
        )
        result.append({
            "member_id": str(uid),
            "member_name": names.get(str(uid), ""),
            "tasks_todo": todo,
            "tasks_in_progress": in_progress,
            "tasks_done": done,
        })
    return result
