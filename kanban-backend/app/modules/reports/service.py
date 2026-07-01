"""Lógica de negocio del Módulo 6: Reportes y Dashboard (solo lectura)."""
from datetime import datetime, timedelta, timezone

from app.modules.reports import model
from app.shared.authz import ensure_project_access
from app.shared.errors import APIError
from app.shared.utils.objectid import to_object_id


def _aware(dt: datetime | None) -> datetime | None:
    """Normaliza un datetime de Mongo a UTC-aware (algunos se guardan naive)."""
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def _active_sprint_query(oid) -> dict:
    """Sprint activo del proyecto. El módulo planning guarda `state: 'active'`."""
    return {"project_id": oid, "state": "active"}


async def dashboard_summary(db, project_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    total = await db.tasks.count_documents({"project_id": oid})
    completed = await db.tasks.count_documents({"project_id": oid, "status": "Done"})

    active_sprint = None
    # Compat: aceptamos tanto el esquema nuevo (state/name/start_date) como
    # documentos antiguos que pudieran tener estado/nombre/fecha_inicio.
    sprint = await db.sprints.find_one(_active_sprint_query(oid)) or await db.sprints.find_one(
        {"project_id": oid, "estado": "Activo"}
    )
    if sprint:
        active_sprint = {
            "id": str(sprint["_id"]),
            "name": sprint.get("name") or sprint.get("nombre", ""),
            "start_date": sprint.get("start_date") or sprint.get("fecha_inicio"),
            "end_date": sprint.get("end_date") or sprint.get("fecha_fin"),
        }

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": total - completed,
        "active_sprint": active_sprint,
    }


async def dashboard_overview(db, project_id: str, current_user: dict) -> dict:
    """Métricas de la pestaña Resumen: tarjetas de 7 días, distribuciones y
    actividad reciente. Solo lectura; agrega sobre la colección `tasks`."""
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    week_ahead = now + timedelta(days=7)

    created = await db.tasks.count_documents({"project_id": oid, "created_at": {"$gte": week_ago}})
    updated = await db.tasks.count_documents({"project_id": oid, "updated_at": {"$gte": week_ago}})
    completed = await db.tasks.count_documents(
        {"project_id": oid, "status": "Done", "updated_at": {"$gte": week_ago}}
    )
    due_soon = await db.tasks.count_documents(
        {
            "project_id": oid,
            "status": {"$ne": "Done"},
            "due_date": {"$gte": now, "$lte": week_ahead},
        }
    )

    # Distribución por estado.
    by_status = []
    async for row in db.tasks.aggregate(
        [{"$match": {"project_id": oid}}, {"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ):
        by_status.append({"status": row["_id"] or "Sin estado", "count": row["count"]})

    # Distribución por tipo de actividad.
    by_type = []
    async for row in db.tasks.aggregate(
        [
            {"$match": {"project_id": oid}},
            {"$group": {"_id": {"$ifNull": ["$task_type", "Tarea"]}, "count": {"$sum": 1}}},
        ]
    ):
        by_type.append({"type": row["_id"], "count": row["count"]})

    # Nombres para enriquecer las distribuciones/actividad por responsable.
    names: dict[str, str] = {}
    async for u in db.users.find({}, {"nombre_completo": 1}):
        names[str(u["_id"])] = u.get("nombre_completo", "")

    # Distribución por responsable.
    by_assignee = []
    async for row in db.tasks.aggregate(
        [{"$match": {"project_id": oid}}, {"$group": {"_id": "$assignee_id", "count": {"$sum": 1}}}]
    ):
        aid = row["_id"]
        by_assignee.append(
            {
                "assignee_id": str(aid) if aid else None,
                "name": names.get(str(aid), "Sin asignar") if aid else "Sin asignar",
                "count": row["count"],
            }
        )

    # Actividad reciente: tareas del proyecto por última actualización (dato real).
    recent_activity = []
    cursor = db.tasks.find({"project_id": oid}).sort("updated_at", -1).limit(10)
    async for t in cursor:
        recent_activity.append(
            {
                "task_id": str(t["_id"]),
                "title": t.get("title"),
                "status": t.get("status"),
                "assignee": names.get(str(t.get("assignee_id"))) if t.get("assignee_id") else None,
                "updated_at": t.get("updated_at"),
            }
        )

    return {
        "metrics_7d": {
            "created": created,
            "updated": updated,
            "completed": completed,
            "due_soon": due_soon,
        },
        "by_status": by_status,
        "by_type": by_type,
        "by_assignee": by_assignee,
        "recent_activity": recent_activity,
    }


async def _get_sprint(db, oid, sprint_id: str) -> dict:
    sprint = await db.sprints.find_one(
        {"_id": to_object_id(sprint_id, "sprint_id", "Sprint"), "project_id": oid}
    )
    if sprint is None:
        raise APIError(404, "Sprint no encontrado", "sprint_id")
    return sprint


def _points(task: dict) -> float:
    return float(task.get("story_points") or 1)


async def burndown(db, project_id: str, sprint_id: str, current_user: dict) -> list[dict]:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    sprint = await _get_sprint(db, oid, sprint_id)

    start = _aware(sprint.get("start_date") or sprint.get("fecha_inicio"))
    end = _aware(sprint.get("end_date") or sprint.get("fecha_fin"))
    if not start or not end:
        return []

    tasks = [t async for t in db.tasks.find({"sprint_id": sprint["_id"]})]

    total = sum(_points(t) for t in tasks)
    days = max(1, (end.date() - start.date()).days)

    result = []
    for i in range(days + 1):
        day = start.date() + timedelta(days=i)
        ideal = round(total - (total / days) * i, 2)
        day_end = datetime(day.year, day.month, day.day, 23, 59, 59, tzinfo=timezone.utc)
        completados = 0.0
        for t in tasks:
            if t.get("status") == "Done":
                done_at = _aware(t.get("updated_at"))
                if done_at is None or done_at <= day_end:
                    completados += _points(t)
        result.append(
            {
                "date": day.isoformat(),
                "ideal_remaining": max(ideal, 0.0),
                "actual_remaining": max(total - completados, 0.0),
            }
        )
    return result


async def burnup(db, project_id: str, sprint_id: str, current_user: dict) -> list[dict]:
    """Gráfico Burnup: alcance total vs trabajo completado acumulado por día."""
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    sprint = await _get_sprint(db, oid, sprint_id)

    start = _aware(sprint.get("start_date") or sprint.get("fecha_inicio"))
    end = _aware(sprint.get("end_date") or sprint.get("fecha_fin"))
    if not start or not end:
        return []

    tasks = [t async for t in db.tasks.find({"sprint_id": sprint["_id"]})]
    scope = sum(_points(t) for t in tasks)
    days = max(1, (end.date() - start.date()).days)

    result = []
    for i in range(days + 1):
        day = start.date() + timedelta(days=i)
        day_end = datetime(day.year, day.month, day.day, 23, 59, 59, tzinfo=timezone.utc)
        completados = 0.0
        for t in tasks:
            if t.get("status") == "Done":
                done_at = _aware(t.get("updated_at"))
                if done_at is None or done_at <= day_end:
                    completados += _points(t)
        result.append({"date": day.isoformat(), "scope": scope, "completed": completados})
    return result


async def velocity(db, project_id: str, current_user: dict) -> list[dict]:
    """Velocidad del equipo: puntos comprometidos vs completados por sprint cerrado."""
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Manager")

    result = []
    cursor = db.sprints.find({"project_id": oid, "state": "completed"}).sort("end_date", 1)
    async for sprint in cursor:
        # Preferimos el snapshot guardado al completar el sprint (comprometido real
        # antes de mover las tareas incompletas). Si no existe (sprints antiguos),
        # recalculamos con lo que quede asignado al sprint.
        if sprint.get("committed_points") is not None:
            committed = sprint["committed_points"]
            completed = sprint.get("completed_points", 0)
        else:
            tasks = [t async for t in db.tasks.find({"sprint_id": sprint["_id"]})]
            committed = sum(_points(t) for t in tasks)
            completed = sum(_points(t) for t in tasks if t.get("status") == "Done")
        result.append(
            {
                "sprint_id": str(sprint["_id"]),
                "sprint_name": sprint.get("name") or sprint.get("nombre", ""),
                "committed_points": committed,
                "completed_points": completed,
            }
        )
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
        result.append(
            {
                "member_id": str(uid),
                "member_name": names.get(str(uid), ""),
                "tasks_todo": todo,
                "tasks_in_progress": in_progress,
                "tasks_done": done,
            }
        )
    return result
