"""Lógica de negocio del módulo de Proyectos y Sprints (Módulo 2)."""
from datetime import datetime, timezone
from bson import ObjectId

from app.modules.projects import model
from app.modules.projects.schemas import (
    ProjectCreate,
    ProjectUpdate,
    InvitationCreate,
    InvitationRespond,
    RoleUpdateRequest,
    SprintCreate,
    SprintUpdate,
    DB_TO_API_ROLE,
    API_TO_DB_ROLE,
)
from app.shared.audit import log_action
from app.shared.authz import ensure_project_access, get_project_role
from app.shared.errors import APIError
from app.shared.utils.objectid import to_object_id

# =====================================================================
# SECCIÓN: PROYECTOS
# =====================================================================

async def create_project(db, payload: ProjectCreate, creador_id: str) -> dict:
    # RN-12: validación de nombre único de proyecto no archivado
    clash = await db.projects.find_one({
        "nombre": payload.nombre,
        "estado": {"$ne": "Archivado"}
    })
    if clash:
        raise APIError(400, "Ya existe un proyecto activo con ese nombre", "nombre")

    creador_oid = to_object_id(creador_id, "id_creador", "Usuario")
    doc = model.new_project_document(
        nombre=payload.nombre,
        descripcion=payload.descripcion,
        creador_id=creador_oid,
        fecha_inicio=payload.fecha_inicio,
        fecha_fin=payload.fecha_fin,
        color=payload.color,
    )
    result = await db.projects.insert_one(doc)
    proj_id = str(result.inserted_id)

    # Crear columnas por defecto automáticamente (RF42)
    # Por hacer, En progreso, En Revisión, Hecho
    default_columns = [
        {"board_id": None, "name": "Por hacer", "position": 0, "color": "#3B82F6"},
        {"board_id": None, "name": "En progreso", "position": 1, "color": "#F59E0B"},
        {"board_id": None, "name": "En Revisión", "position": 2, "color": "#8B5CF6"},
        {"board_id": None, "name": "Hecho", "position": 3, "color": "#10B981"},
    ]
    
    # Crear tablero por defecto
    board_doc = {
        "project_id": result.inserted_id,
        "name": "Tablero Principal",
        "created_at": datetime.now(timezone.utc)
    }
    board_res = await db.boards.insert_one(board_doc)
    
    # Asociar columnas al tablero creado
    for col in default_columns:
        col["board_id"] = board_res.inserted_id
        await db.columns.insert_one(col)

    await log_action(db, creador_id, "crear_proyecto", f"Creó el proyecto {payload.nombre}", proj_id)

    return {
        "id": proj_id,
        "nombre": doc["nombre"],
        "descripcion": doc["descripcion"],
        "color": doc["color"],
        "iniciales": doc["iniciales"],
        "estado": doc["estado"],
        "fecha_inicio": doc["fecha_inicio"],
        "fecha_fin": doc["fecha_fin"],
        "id_creador": creador_id,
        "fecha_creacion": doc["created_at"].isoformat()
    }


async def list_projects(db, user_id: str, page: int, limit: int) -> dict:
    limit = max(1, min(limit, 100))
    page = max(1, page)
    skip = (page - 1) * limit
    user_oid = to_object_id(user_id, "id", "Usuario")
    
    # Filtra proyectos donde es miembro y no están archivados (soft delete)
    query = {
        "members.user_id": user_oid,
        "estado": {"$ne": "Archivado"}
    }

    total = await db.projects.count_documents(query)
    cursor = db.projects.find(query).sort("created_at", -1).skip(skip).limit(limit)
    
    proyectos = []
    async for p in cursor:
        db_rol = get_project_role(p, user_id) or "Viewer"
        api_rol = DB_TO_API_ROLE.get(db_rol, "developer")
        
        proyectos.append({
            "id": str(p["_id"]),
            "nombre": p.get("nombre", p.get("name", "Proyecto sin nombre")),
            "iniciales": p.get("iniciales", "PR"),
            "color": p.get("color", "#1E3A5F"),
            "estado": p.get("estado", "Activo"),
            "mi_rol": api_rol,
            "fecha_inicio": p.get("fecha_inicio", p.get("created_at", datetime.now(timezone.utc)).isoformat().split('T')[0]),
        })
    return {"proyectos": proyectos, "total": total}


async def get_project_detail(db, project_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, oid, current_user, "Viewer")
    
    user_id = str(current_user.get("sub"))
    db_rol = get_project_role(project, user_id) or "Viewer"
    api_rol = DB_TO_API_ROLE.get(db_rol, "developer")

    return {
        "id": str(project["_id"]),
        "nombre": project.get("nombre", project.get("name", "Proyecto sin nombre")),
        "descripcion": project.get("descripcion", project.get("description")),
        "iniciales": project.get("iniciales", "PR"),
        "color": project.get("color", "#1E3A5F"),
        "estado": project.get("estado", "Activo"),
        "fecha_inicio": project.get("fecha_inicio", project.get("created_at", datetime.now(timezone.utc)).isoformat().split('T')[0]),
        "fecha_fin": project.get("fecha_fin"),
        "id_creador": str(project.get("id_creador", project.get("id_creador", ""))),
        "mi_rol": api_rol,
        "total_miembros": len(project.get("members", [])),
        "fecha_creacion": project["created_at"].isoformat() if isinstance(project.get("created_at"), datetime) else str(project.get("created_at", ""))
    }


async def update_project(db, project_id: str, payload: ProjectUpdate, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Manager")

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "nombre" in updates:
        clash = await db.projects.find_one({
            "nombre": updates["nombre"], 
            "_id": {"$ne": oid},
            "estado": {"$ne": "Archivado"}
        })
        if clash:
            raise APIError(400, "Ya existe un proyecto con ese nombre", "nombre")
        
        # Actualizar iniciales si cambia el nombre
        words = [w for w in updates["nombre"].strip().split() if w]
        if len(words) >= 2:
            updates["iniciales"] = (words[0][0] + words[1][0]).upper()
        elif len(words) == 1:
            updates["iniciales"] = words[0][:2].upper()
        else:
            updates["iniciales"] = "PR"

    updates["updated_at"] = datetime.now(timezone.utc)
    await db.projects.update_one({"_id": oid}, {"$set": updates})
    project = await db.projects.find_one({"_id": oid})
    
    return {
        "id": str(project["_id"]),
        "nombre": project["nombre"],
        "descripcion": project.get("descripcion"),
        "color": project["color"],
        "iniciales": project["iniciales"],
        "estado": project["estado"]
    }


async def delete_project(db, project_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, oid, current_user, "Manager")

    # RF14 / RF15: soft delete de proyecto
    await db.projects.update_one({"_id": oid}, {"$set": {"estado": "Archivado", "updated_at": datetime.now(timezone.utc)}})

    await log_action(db, current_user.get("sub"), "archivar_proyecto",
                     f"Archivó el proyecto {project.get('nombre', project_id)}", project_id)
    return {"mensaje": "Proyecto archivado exitosamente", "id": project_id}


async def search_projects(db, query_str: str, user_id: str) -> dict:
    if not query_str.strip():
        raise APIError(400, "El parámetro de búsqueda q no puede estar vacío", "q")

    user_oid = to_object_id(user_id, "id", "Usuario")
    
    # Filtra por coincidencia case-insensitive, que no esté archivado y donde participe el usuario
    query = {
        "members.user_id": user_oid,
        "estado": {"$ne": "Archivado"},
        "$or": [
            {"nombre": {"$regex": query_str, "$options": "i"}},
            {"name": {"$regex": query_str, "$options": "i"}}
        ]
    }

    cursor = db.projects.find(query).sort("created_at", -1)
    proyectos = []
    async for p in cursor:
        db_rol = get_project_role(p, user_id) or "Viewer"
        api_rol = DB_TO_API_ROLE.get(db_rol, "developer")
        
        proyectos.append({
            "id": str(p["_id"]),
            "nombre": p.get("nombre", p.get("name", "Proyecto sin nombre")),
            "iniciales": p.get("iniciales", "PR"),
            "color": p.get("color", "#1E3A5F"),
            "estado": p.get("estado", "Activo"),
            "mi_rol": api_rol
        })
    return {"proyectos": proyectos, "total": len(proyectos)}


# =====================================================================
# SECCIÓN: MIEMBROS & INVITACIONES
# =====================================================================

async def create_invitation(db, project_id: str, payload: InvitationCreate, current_user: dict) -> dict:
    project_oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, project_oid, current_user, "Manager")

    # Validar si el usuario a invitar existe en el sistema
    invited_user = await db.users.find_one({"email": payload.email.strip().lower()})
    if not invited_user:
        raise APIError(404, "El usuario con ese email no se encuentra registrado en el sistema", "email")

    invited_oid = invited_user["_id"]

    # Validar si ya es miembro del proyecto
    if any(m["user_id"] == invited_oid for m in project.get("members", [])):
        raise APIError(409, "El usuario ya integra el equipo de este proyecto", "email")

    # Validar si ya cuenta con una invitación pendiente activa (que no haya expirado)
    now = datetime.now(timezone.utc)
    active_inv = await db.invitations.find_one({
        "email": payload.email.strip().lower(),
        "id_proyecto": project_oid,
        "estado": "pendiente",
        "expira_en": {"$gt": now}
    })
    if active_inv:
        raise APIError(409, "Ya existe una invitación pendiente activa para este usuario", "email")

    db_role = API_TO_DB_ROLE.get(payload.rol, "Developer")
    
    doc = model.new_invitation_document(payload.email, db_role, project_oid)
    result = await db.invitations.insert_one(doc)

    return {
        "id": str(result.inserted_id),
        "email": doc["email"],
        "rol": payload.rol,
        "estado": doc["estado"],
        "id_proyecto": project_id,
        "expira_en": doc["expira_en"].isoformat()
    }


async def list_user_invitations(db, user_id: str) -> list:
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return []
    email = user["email"].strip().lower()
    now = datetime.now(timezone.utc)

    cursor = db.invitations.find({
        "email": email,
        "estado": "pendiente",
        "expira_en": {"$gt": now}
    })

    invitations = []
    async for inv in cursor:
        api_rol = DB_TO_API_ROLE.get(inv["rol"], "developer")
        invitations.append({
            "id": str(inv["_id"]),
            "email": inv["email"],
            "rol": api_rol,
            "estado": inv["estado"],
            "id_proyecto": str(inv["id_proyecto"]),
            "expira_en": inv["expira_en"].isoformat()
        })
    return invitations


async def respond_invitation(db, invitation_id: str, payload: InvitationRespond, current_user_id: str) -> dict:
    inv_oid = to_object_id(invitation_id, "invitation_id", "Invitación")
    inv = await db.invitations.find_one({"_id": inv_oid})
    if not inv:
        raise APIError(404, "Invitación no encontrada", "invitation_id")

    if inv["estado"] != "pendiente":
        raise APIError(410, "La invitación ya fue respondida o cancelada", "invitation_id")

    # Validar expiración
    now = datetime.now(timezone.utc)
    if inv["expira_en"].replace(tzinfo=timezone.utc) < now:
        await db.invitations.update_one({"_id": inv_oid}, {"$set": {"estado": "expirada"}})
        raise APIError(410, "La invitación ha expirado", "invitation_id")

    # Validar que pertenezca al email del usuario logueado
    user = await db.users.find_one({"_id": ObjectId(current_user_id)})
    if not user or user["email"].strip().lower() != inv["email"].strip().lower():
        raise APIError(403, "Esta invitación no pertenece al usuario autenticado")

    if payload.accion == "rechazar":
        await db.invitations.update_one({"_id": inv_oid}, {"$set": {"estado": "rechazada"}})
        return {"mensaje": "Invitación rechazada correctamente", "miembro": None}

    # Aceptar invitación: agregar miembro al proyecto
    project = await db.projects.find_one({"_id": inv["id_proyecto"]})
    if not project:
        raise APIError(404, "El proyecto al que fuiste invitado ya no existe")

    # Prevenir doble inserción por concurrencia
    if any(m["user_id"] == user["_id"] for m in project.get("members", [])):
        await db.invitations.update_one({"_id": inv_oid}, {"$set": {"estado": "aceptada"}})
        db_rol = next(m["rol"] for m in project["members"] if m["user_id"] == user["_id"])
        api_rol = DB_TO_API_ROLE.get(db_rol, "developer")
        return {
            "mensaje": "Ya eres miembro del proyecto",
            "miembro": {
                "id": str(user["_id"]),
                "id_proyecto": str(inv["id_proyecto"]),
                "id_usuario": current_user_id,
                "rol": api_rol
            }
        }

    # Agregar miembro
    await db.projects.update_one(
        {"_id": inv["id_proyecto"]},
        {"$push": {"members": {"user_id": user["_id"], "rol": inv["rol"]}}}
    )

    # Actualizar estado de la invitación
    await db.invitations.update_one({"_id": inv_oid}, {"$set": {"estado": "aceptada"}})
    
    api_rol = DB_TO_API_ROLE.get(inv["rol"], "developer")
    return {
        "mensaje": "Invitación aceptada. Ahora eres miembro del proyecto.",
        "miembro": {
            "id": str(user["_id"]),
            "id_proyecto": str(inv["id_proyecto"]),
            "id_usuario": current_user_id,
            "rol": api_rol
        }
    }


async def list_members(db, project_id: str, current_user: dict) -> dict:
    project_oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, project_oid, current_user, "Viewer")

    member_ids = [m["user_id"] for m in project.get("members", [])]
    users_dict = {}
    async for u in db.users.find({"_id": {"$in": member_ids}}):
        users_dict[str(u["_id"])] = u

    miembros = []
    for m in project.get("members", []):
        uid = str(m["user_id"])
        u_info = users_dict.get(uid, {})
        api_rol = DB_TO_API_ROLE.get(m["rol"], "developer")
        
        miembros.append({
            "id_miembro": uid, # Mapeado de user_id
            "id_usuario": uid,
            "nombre": u_info.get("nombre_completo", "Usuario deshabilitado"),
            "email": u_info.get("email", ""),
            "rol": api_rol,
            "fecha_union": project.get("created_at", datetime.now(timezone.utc)).isoformat()
        })

    return {"miembros": miembros, "total": len(miembros)}


async def remove_member(db, project_id: str, member_id: str, current_user: dict) -> dict:
    project_oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, project_oid, current_user, "Manager")

    # RF25: El creador del proyecto no puede ser eliminado
    if member_id == str(project["id_creador"]):
        raise APIError(409, "No se puede eliminar al Scrum Master creador del proyecto")

    target_oid = to_object_id(member_id, "member_id", "Usuario")
    members = project.get("members", [])
    if not any(m["user_id"] == target_oid for m in members):
        raise APIError(404, "El miembro no integra el equipo de este proyecto")

    # Remover miembro
    await db.projects.update_one(
        {"_id": project_oid},
        {"$pull": {"members": {"user_id": target_oid}}}
    )

    # Desasignar tareas de ese miembro en el proyecto
    await db.tasks.update_many(
        {"project_id": project_oid, "assignee_id": member_id},
        {"$set": {"assignee_id": None}}
    )

    await log_action(db, current_user.get("sub"), "remover_miembro",
                     f"Removió al miembro {member_id} del proyecto", project_id)
                     
    return {"mensaje": "Miembro eliminado del proyecto", "id_miembro": member_id}


async def change_member_role(db, project_id: str, member_id: str, payload: RoleUpdateRequest, current_user: dict) -> dict:
    project_oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, project_oid, current_user, "Manager")

    target_oid = to_object_id(member_id, "member_id", "Usuario")
    members = project.get("members", [])
    
    # Validar que exista el miembro
    target = next((m for m in members if m["user_id"] == target_oid), None)
    if not target:
        raise APIError(404, "El miembro no se encuentra en este proyecto")

    db_rol_nuevo = API_TO_DB_ROLE.get(payload.rol, "Developer")

    # Validar restricción de Scrum Master único
    if db_rol_nuevo == "Manager" and target["rol"] != "Manager":
        managers = [m for m in members if m["rol"] == "Manager"]
        if len(managers) >= 1:
            raise APIError(409, "Ya existe un Scrum Master en el proyecto")

    # No permitir quitarse el rol de manager al único manager
    if target["rol"] == "Manager" and db_rol_nuevo != "Manager":
        managers = [m for m in members if m["rol"] == "Manager"]
        if len(managers) <= 1:
            raise APIError(400, "El proyecto debe conservar al menos un Scrum Master activo")

    # Actualizar rol del miembro
    await db.projects.update_one(
        {"_id": project_oid, "members.user_id": target_oid},
        {"$set": {"members.$.rol": db_rol_nuevo}}
    )

    await log_action(db, current_user.get("sub"), "cambiar_rol_proyecto",
                     f"Cambió rol del miembro {member_id} a {db_rol_nuevo}", project_id)

    return {
        "mensaje": "Rol actualizado exitosamente",
        "id_miembro": member_id,
        "rol_nuevo": payload.rol
    }


# =====================================================================
# SECCIÓN: SPRINTS
# =====================================================================

async def create_sprint(db, project_id: str, payload: SprintCreate, current_user: dict) -> dict:
    project_oid = to_object_id(project_id, "project_id", "Proyecto")
    # Validar que sea Scrum Master (Manager) del proyecto
    await ensure_project_access(db, project_oid, current_user, "Manager")

    # Validar que la fecha de fin sea posterior a la de inicio
    if payload.fecha_fin < payload.fecha_inicio:
        raise APIError(400, "La fecha de fin no puede ser anterior a la fecha de inicio", "fecha_fin")

    # Validar exclusividad de sprint activo (RF40 / RF41)
    active_sprint = await db.sprints.find_one({
        "id_proyecto": project_oid,
        "estado": "Activo"
    })
    if active_sprint:
        raise APIError(409, "Ya existe un sprint activo en el proyecto. Debes cerrarlo antes de iniciar otro.")

    doc = model.new_sprint_document(payload.nombre, payload.fecha_inicio, payload.fecha_fin, project_oid)
    result = await db.sprints.insert_one(doc)

    return {
        "id": str(result.inserted_id),
        "nombre": doc["nombre"],
        "fecha_inicio": doc["fecha_inicio"],
        "fecha_fin": doc["fecha_fin"],
        "estado": doc["estado"],
        "id_proyecto": project_id
    }


async def list_sprints(db, project_id: str, current_user: dict) -> dict:
    project_oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, project_oid, current_user, "Viewer")

    cursor = db.sprints.find({"id_proyecto": project_oid}).sort("fecha_inicio", 1)
    sprints = []
    async for s in cursor:
        sprints.append({
            "id": str(s["_id"]),
            "nombre": s["nombre"],
            "fecha_inicio": s["fecha_inicio"],
            "fecha_fin": s["fecha_fin"],
            "estado": s["estado"],
            "id_proyecto": project_id
        })
    return {"sprints": sprints, "total": len(sprints)}


async def update_sprint(db, project_id: str, sprint_id: str, payload: SprintUpdate, current_user: dict) -> dict:
    project_oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, project_oid, current_user, "Manager")

    sprint_oid = to_object_id(sprint_id, "sprint_id", "Sprint")
    sprint = await db.sprints.find_one({"_id": sprint_oid, "id_proyecto": project_oid})
    if not sprint:
        raise APIError(404, "Sprint no encontrado en el proyecto", "sprint_id")

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise APIError(400, "No se enviaron campos para actualizar")

    # Validar fechas si ambas o una cambia
    f_ini = updates.get("fecha_inicio", sprint["fecha_inicio"])
    f_fin = updates.get("fecha_fin", sprint["fecha_fin"])
    if f_fin < f_ini:
        raise APIError(400, "La fecha de fin no puede ser anterior a la fecha de inicio", "fecha_fin")

    updates["updated_at"] = datetime.now(timezone.utc)
    await db.sprints.update_one({"_id": sprint_oid}, {"$set": updates})
    s = await db.sprints.find_one({"_id": sprint_oid})

    return {
        "id": str(s["_id"]),
        "nombre": s["nombre"],
        "fecha_inicio": s["fecha_inicio"],
        "fecha_fin": s["fecha_fin"],
        "estado": s["estado"],
        "id_proyecto": project_id
    }


async def close_sprint(db, project_id: str, sprint_id: str, current_user: dict) -> dict:
    project_oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, project_oid, current_user, "Manager")

    sprint_oid = to_object_id(sprint_id, "sprint_id", "Sprint")
    sprint = await db.sprints.find_one({"_id": sprint_oid, "id_proyecto": project_oid})
    if not sprint:
        raise APIError(404, "Sprint no encontrado", "sprint_id")

    if sprint["estado"] == "Cerrado":
        raise APIError(409, "El sprint ya está cerrado")

    # Buscar columna "Done" o "Hecho" asociada al tablero de este proyecto
    # Si no la encuentra, asumimos por defecto la que tiene la posición máxima o el nombre Hecho
    board = await db.boards.find_one({"project_id": project_oid})
    done_column = None
    if board:
        done_column = await db.columns.find_one({
            "board_id": board["_id"],
            "name": {"$in": ["Hecho", "Done", "Completado"]}
        })

    # Contar tareas completadas e incompletas
    task_query = {"project_id": project_oid, "sprint_id": sprint_oid}
    total_tasks = await db.tasks.count_documents(task_query)
    
    if done_column:
        done_query = {"project_id": project_oid, "sprint_id": sprint_oid, "column_id": done_column["_id"]}
        completed_count = await db.tasks.count_documents(done_query)
    else:
        completed_count = 0

    # Las tareas que NO están completadas vuelven al backlog (sprint_id = null)
    # Si no hay columna done, todas vuelven al backlog
    if done_column:
        rollover_query = {
            "project_id": project_oid,
            "sprint_id": sprint_oid,
            "column_id": {"$ne": done_column["_id"]}
        }
    else:
        rollover_query = {"project_id": project_oid, "sprint_id": sprint_oid}

    rollover_count = await db.tasks.count_documents(rollover_query)
    
    # Ejecutar la migración al backlog
    if rollover_count > 0:
        await db.tasks.update_many(
            rollover_query,
            {"$set": {"sprint_id": None, "column_id": None}} # null desvincula del sprint y la columna (vuelve al backlog)
        )

    # Actualizar estado del sprint
    await db.sprints.update_one(
        {"_id": sprint_oid},
        {"$set": {"estado": "Cerrado", "updated_at": datetime.now(timezone.utc)}}
    )

    await log_action(db, current_user.get("sub"), "cerrar_sprint",
                     f"Cerró el sprint {sprint.get('nombre', sprint_id)}", project_id)

    return {
        "mensaje": "Sprint cerrado exitosamente",
        "sprint_id": sprint_id,
        "tareas_al_backlog": rollover_count,
        "tareas_completadas": completed_count
    }
