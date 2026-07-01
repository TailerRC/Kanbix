"""Lógica de negocio del Módulo 3: Tableros, Columnas, Tareas y Comentarios."""
from datetime import datetime, timezone

from bson import ObjectId

from app.modules.boards import model
from app.modules.boards.schemas import (
    BoardCreate,
    BoardUpdate,
    ColumnCreate,
    ColumnUpdate,
    CommentCreate,
    TaskCreate,
    TaskMove,
    TaskUpdate,
)
from app.shared.authz import PROJECT_ROLE_RANK, ensure_project_access, get_project_role
from app.shared.errors import APIError
from app.shared.events import TAREA_ASIGNADA, TAREA_MOVIDA, MENCION, notify
from app.shared.utils.objectid import to_object_id


def _now():
    return datetime.now(timezone.utc)


# ----------------------------------------------------------------------------
# Resolución de recursos + autorización
# ----------------------------------------------------------------------------
async def _get_board(db, board_id: str) -> dict:
    board = await db.boards.find_one({"_id": to_object_id(board_id, "board_id", "Tablero")})
    if board is None:
        raise APIError(404, "Tablero no encontrado", "board_id")
    return board


async def _get_task(db, task_id: str) -> dict:
    task = await db.tasks.find_one({"_id": to_object_id(task_id, "task_id", "Tarea")})
    if task is None:
        raise APIError(404, "Tarea no encontrada", "task_id")
    return task


async def _ensure_task_write_access(db, task: dict, current_user: dict, action: str) -> dict:
    """RN-21: solo el asignado o un Manager+ pueden modificar/mover la tarea."""
    project = await ensure_project_access(db, task["project_id"], current_user, "Developer")
    if current_user.get("role") == "Admin":
        return project
    role = get_project_role(project, str(current_user.get("sub")))
    if role and PROJECT_ROLE_RANK.get(role, 0) >= PROJECT_ROLE_RANK["Manager"]:
        return project
    # Developer: solo si es el asignado.
    if str(task.get("assignee_id")) == str(current_user.get("sub")):
        return project
    raise APIError(403, f"Sin permisos para {action} esta tarea")


# ----------------------------------------------------------------------------
# Boards
# ----------------------------------------------------------------------------
async def create_board(db, project_id: str, payload: BoardCreate, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Manager")

    doc = model.new_board_document(oid, payload.name, payload.description)
    result = await db.boards.insert_one(doc)
    await db.columns.insert_many(model.default_column_documents(result.inserted_id))
    return {
        "id": str(result.inserted_id),
        "project_id": project_id,
        "name": doc["name"],
        "description": doc["description"],
        "created_at": doc["created_at"],
    }


async def list_boards(db, project_id: str, current_user: dict) -> list[dict]:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    boards = []
    async for b in db.boards.find({"project_id": oid}).sort("created_at", 1):
        column_count = await db.columns.count_documents({"board_id": b["_id"]})
        boards.append({
            "id": str(b["_id"]),
            "name": b["name"],
            "description": b.get("description"),
            "column_count": column_count,
            "created_at": b["created_at"],
        })
    return boards


async def get_board_detail(db, project_id: str, board_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")
    board = await _get_board(db, board_id)
    if str(board["project_id"]) != project_id:
        raise APIError(404, "Tablero no encontrado", "board_id")

    # Nombres de asignados para enriquecer las tarjetas.
    assignee_names: dict[str, str] = {}
    async for u in db.users.find({}, {"nombre_completo": 1}):
        assignee_names[str(u["_id"])] = u.get("nombre_completo", "")

    columns = []
    async for col in db.columns.find({"board_id": board["_id"]}).sort("position", 1):
        tasks = []
        cursor = db.tasks.find({"column_id": col["_id"]}).sort("position", 1)
        async for t in cursor:
            tasks.append({
                "id": str(t["_id"]),
                "title": t["title"],
                "description": t.get("description"),
                "assignee": assignee_names.get(str(t.get("assignee_id"))) if t.get("assignee_id") else None,
                "assignee_id": str(t.get("assignee_id")) if t.get("assignee_id") else None,
                "priority": t.get("priority"),
                "due_date": t.get("due_date"),
                "start_date": t.get("start_date"),
                "story_points": t.get("story_points"),
                "tags": t.get("tags", []),
                "task_type": t.get("task_type", "Tarea"),
                "creator_name": assignee_names.get(str(t.get("creator_id"))) if t.get("creator_id") else None,
                "status": t.get("status"),
                "sprint_id": str(t["sprint_id"]) if t.get("sprint_id") else None,
            })
        columns.append({
            "id": str(col["_id"]),
            "name": col["name"],
            "position": col["position"],
            "tasks": tasks,
        })

    return {"id": str(board["_id"]), "name": board["name"], "columns": columns}


async def update_board(db, project_id: str, board_id: str, payload: BoardUpdate, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Manager")
    board = await _get_board(db, board_id)

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    updates["updated_at"] = _now()
    await db.boards.update_one({"_id": board["_id"]}, {"$set": updates})
    board = await db.boards.find_one({"_id": board["_id"]})
    return {"id": str(board["_id"]), "name": board["name"], "updated_at": board["updated_at"]}


async def delete_board(db, project_id: str, board_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Manager")
    board = await _get_board(db, board_id)

    task_ids = [t["_id"] async for t in db.tasks.find({"board_id": board["_id"]}, {"_id": 1})]
    if task_ids:
        await db.comments.delete_many({"task_id": {"$in": task_ids}})
    await db.tasks.delete_many({"board_id": board["_id"]})
    await db.columns.delete_many({"board_id": board["_id"]})
    await db.boards.delete_one({"_id": board["_id"]})
    return {"message": "Tablero eliminado exitosamente"}


# ----------------------------------------------------------------------------
# Columns
# ----------------------------------------------------------------------------
async def create_column(db, board_id: str, payload: ColumnCreate, current_user: dict) -> dict:
    board = await _get_board(db, board_id)
    await ensure_project_access(db, board["project_id"], current_user, "Manager")

    clash = await db.columns.find_one({"board_id": board["_id"], "position": payload.position})
    if clash:
        raise APIError(409, "Ya existe una columna en esa posición", "position")

    doc = {"board_id": board["_id"], "name": payload.name, "position": payload.position, "created_at": _now()}
    result = await db.columns.insert_one(doc)
    return {"id": str(result.inserted_id), "board_id": board_id, "name": payload.name, "position": payload.position}


async def update_column(db, board_id: str, column_id: str, payload: ColumnUpdate, current_user: dict) -> dict:
    board = await _get_board(db, board_id)
    await ensure_project_access(db, board["project_id"], current_user, "Manager")

    col_oid = to_object_id(column_id, "column_id", "Columna")
    column = await db.columns.find_one({"_id": col_oid, "board_id": board["_id"]})
    if column is None:
        raise APIError(404, "Columna no encontrada", "column_id")

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "position" in updates and updates["position"] != column["position"]:
        clash = await db.columns.find_one(
            {"board_id": board["_id"], "position": updates["position"], "_id": {"$ne": col_oid}}
        )
        if clash:
            raise APIError(409, "Ya existe una columna en esa posición", "position")
    if updates:
        await db.columns.update_one({"_id": col_oid}, {"$set": updates})
    column = await db.columns.find_one({"_id": col_oid})
    return {"id": str(column["_id"]), "name": column["name"], "position": column["position"]}


# ----------------------------------------------------------------------------
# Tasks
# ----------------------------------------------------------------------------
async def list_project_tasks(db, project_id: str, current_user: dict) -> list[dict]:
    """Lista plana de todas las tareas del proyecto (Calendario y Cronograma)."""
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    names: dict[str, str] = {}
    async for u in db.users.find({}, {"nombre_completo": 1}):
        names[str(u["_id"])] = u.get("nombre_completo", "")

    tasks = []
    async for t in db.tasks.find({"project_id": oid}).sort("created_at", 1):
        assignee_id = t.get("assignee_id")
        tasks.append({
            "id": str(t["_id"]),
            "title": t.get("title"),
            "description": t.get("description"),
            "status": t.get("status"),
            "priority": t.get("priority"),
            "assignee": names.get(str(assignee_id)) if assignee_id else None,
            "assignee_id": str(assignee_id) if assignee_id else None,
            "due_date": t.get("due_date"),
            "start_date": t.get("start_date"),
            "story_points": t.get("story_points"),
            "sprint_id": str(t["sprint_id"]) if t.get("sprint_id") else None,
            "column_id": str(t["column_id"]) if t.get("column_id") else None,
            "board_id": str(t["board_id"]) if t.get("board_id") else None,
            "task_type": t.get("task_type", "Tarea"),
            "tags": t.get("tags", []),
        })
    return tasks


async def _resolve_target_column(db, board_id: ObjectId, column_id: str | None) -> dict:
    if column_id:
        col = await db.columns.find_one({"_id": to_object_id(column_id, "column_id", "Columna"), "board_id": board_id})
        if col is None:
            raise APIError(404, "Columna no encontrada", "column_id")
        return col
    col = await db.columns.find_one({"board_id": board_id}, sort=[("position", 1)])
    if col is None:
        raise APIError(404, "El tablero no tiene columnas", "board_id")
    return col


async def create_task(db, board_id: str, payload: TaskCreate, current_user: dict) -> dict:
    board = await _get_board(db, board_id)
    project = await ensure_project_access(db, board["project_id"], current_user, "Developer")

    column = await _resolve_target_column(db, board["_id"], payload.column_id)

    assignee_oid = None
    if payload.assignee_id:
        assignee_oid = to_object_id(payload.assignee_id, "assignee_id", "Usuario")
        if get_project_role(project, payload.assignee_id) is None:  # RN-25
            raise APIError(400, "La tarea solo puede asignarse a un miembro del proyecto", "assignee_id")

    sprint_oid = None
    if payload.sprint_id:
        sprint_oid = to_object_id(payload.sprint_id, "sprint_id", "Sprint")

    position = await db.tasks.count_documents({"column_id": column["_id"]})
    doc = model.new_task_document(
        project_id=board["project_id"],
        board_id=board["_id"],
        column_id=column["_id"],
        status=column["name"],
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        assignee_id=assignee_oid,
        creator_id=to_object_id(current_user["sub"], "creator_id", "Usuario"),
        due_date=payload.due_date,
        tags=payload.tags,
        position=position,
        start_date=payload.start_date,
        sprint_id=sprint_oid,
    )
    result = await db.tasks.insert_one(doc)

    if assignee_oid:
        await notify(db, payload.assignee_id, TAREA_ASIGNADA,
                     f"Se te ha asignado la tarea: {payload.title}",
                     {"tarea_id": str(result.inserted_id), "titulo": payload.title})

    return {
        "id": str(result.inserted_id),
        "board_id": board_id,
        "column_id": str(column["_id"]),
        "title": payload.title,
        "priority": payload.priority,
        "status": column["name"],
        "created_at": doc["created_at"],
    }


async def update_task(db, task_id: str, payload: TaskUpdate, current_user: dict) -> dict:
    task = await _get_task(db, task_id)
    project = await _ensure_task_write_access(db, task, current_user, "editar")

    updates = payload.model_dump(exclude_unset=True)
    new_assignee = None
    if "assignee_id" in updates:
        if updates["assignee_id"]:
            new_assignee = updates["assignee_id"]
            if get_project_role(project, new_assignee) is None:  # RN-25
                raise APIError(400, "La tarea solo puede asignarse a un miembro del proyecto", "assignee_id")
            updates["assignee_id"] = to_object_id(new_assignee, "assignee_id", "Usuario")
        else:
            updates["assignee_id"] = None

    if "sprint_id" in updates:
        if updates["sprint_id"]:
            updates["sprint_id"] = to_object_id(updates["sprint_id"], "sprint_id", "Sprint")
        else:
            updates["sprint_id"] = None

    updates["updated_at"] = _now()
    await db.tasks.update_one({"_id": task["_id"]}, {"$set": updates})

    if new_assignee and str(task.get("assignee_id")) != new_assignee:
        await notify(db, new_assignee, TAREA_ASIGNADA,
                     f"Se te ha asignado la tarea: {task['title']}",
                     {"tarea_id": task_id, "titulo": task["title"]})

    return {"id": task_id, "title": updates.get("title", task["title"]), "updated_at": updates["updated_at"]}


async def move_task(db, task_id: str, payload: TaskMove, current_user: dict) -> dict:
    task = await _get_task(db, task_id)
    await _ensure_task_write_access(db, task, current_user, "mover")

    dest = await db.columns.find_one(
        {"_id": to_object_id(payload.column_id, "column_id", "Columna"), "board_id": task["board_id"]}
    )
    if dest is None:
        raise APIError(404, "Columna no encontrada", "column_id")

    origen = task.get("status", "")
    destino = dest["name"]

    # RN-22: de Done no se puede volver a Backlog directamente.
    if origen == "Done" and destino == "Backlog":
        raise APIError(409, "Una tarea en Done no puede volver a Backlog directamente; requiere reapertura")

    # RN-23: no completar (Done) si hay subtareas pendientes.
    if destino == "Done":
        if any(not s.get("completed") for s in task.get("subtasks", [])):
            raise APIError(409, "No se puede completar la tarea: tiene subtareas pendientes")

    # RN-26: no pasar a In Progress si una dependencia no está en Done.
    if destino == "In Progress" and task.get("dependencies"):
        pendientes = await db.tasks.count_documents(
            {"_id": {"$in": task["dependencies"]}, "status": {"$ne": "Done"}}
        )
        if pendientes:
            raise APIError(409, "No se puede iniciar: una tarea de la que depende no está en Done")

    position = payload.position
    if position is None:
        position = await db.tasks.count_documents({"column_id": dest["_id"]})

    await db.tasks.update_one(
        {"_id": task["_id"]},
        {"$set": {"column_id": dest["_id"], "status": destino, "position": position, "updated_at": _now()}},
    )

    # Notifica al asignado del movimiento (si no es quien lo movió).
    assignee = task.get("assignee_id")
    if assignee and str(assignee) != str(current_user.get("sub")):
        await notify(db, str(assignee), TAREA_MOVIDA,
                     f"La tarea '{task['title']}' se movió a {destino}",
                     {"tarea_id": task_id, "titulo": task["title"],
                      "columna_anterior": origen, "columna_nueva": destino})

    return {"id": task_id, "column_id": str(dest["_id"]), "position": position, "status": destino}


async def delete_task(db, task_id: str, current_user: dict) -> dict:
    task = await _get_task(db, task_id)
    await ensure_project_access(db, task["project_id"], current_user, "Manager")  # RN: solo Manager+ elimina
    await db.comments.delete_many({"task_id": task["_id"]})
    await db.tasks.delete_one({"_id": task["_id"]})
    return {"message": "Tarea eliminada exitosamente"}


# ----------------------------------------------------------------------------
# Comments
# ----------------------------------------------------------------------------
async def add_comment(db, task_id: str, payload: CommentCreate, current_user: dict) -> dict:
    task = await _get_task(db, task_id)
    project = await ensure_project_access(db, task["project_id"], current_user, "Developer")

    author_id = current_user["sub"]
    doc = {
        "task_id": task["_id"],
        "author_id": to_object_id(author_id, "author_id", "Usuario"),
        "content": payload.content,
        "created_at": _now(),
    }
    result = await db.comments.insert_one(doc)

    await _notify_mentions(db, project, task, payload.content, author_id)

    return {
        "id": str(result.inserted_id),
        "task_id": task_id,
        "author_id": author_id,
        "content": payload.content,
        "created_at": doc["created_at"],
    }


async def list_comments(db, task_id: str, current_user: dict) -> list[dict]:
    task = await _get_task(db, task_id)
    await ensure_project_access(db, task["project_id"], current_user, "Viewer")

    names: dict[str, str] = {}
    async for u in db.users.find({}, {"nombre_completo": 1}):
        names[str(u["_id"])] = u.get("nombre_completo", "")

    comments = []
    async for c in db.comments.find({"task_id": task["_id"]}).sort("created_at", 1):
        comments.append({
            "id": str(c["_id"]),
            "author": names.get(str(c.get("author_id")), ""),
            "content": c["content"],
            "created_at": c["created_at"],
        })
    return comments


async def _notify_mentions(db, project: dict, task: dict, content: str, author_id: str) -> None:
    """Detecta menciones @Nombre y notifica a los miembros mencionados (RF, Módulo 5)."""
    if "@" not in content:
        return
    member_ids = [m["user_id"] for m in project.get("members", [])]
    async for u in db.users.find({"_id": {"$in": member_ids}}, {"nombre_completo": 1}):
        nombre = u.get("nombre_completo", "")
        primer_nombre = nombre.split(" ")[0] if nombre else ""
        if primer_nombre and f"@{primer_nombre}".lower() in content.lower():
            if str(u["_id"]) == author_id:
                continue
            await notify(db, str(u["_id"]), MENCION,
                         f"Te mencionaron en la tarea: {task['title']}",
                         {"tarea_id": str(task["_id"]), "titulo": task["title"], "comentario": content})
