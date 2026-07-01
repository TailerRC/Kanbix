"""Orquestación HTTP del módulo Planificación."""
from app.modules.planning import service
from app.modules.planning.schemas import (
    DependencyCreate,
    PlanningUpdate,
    SubtaskCreate,
    SprintCreate,
    SprintUpdate,
)


async def set_planning(db, task_id, payload: PlanningUpdate, current):
    return await service.set_planning(db, task_id, payload, current)


async def add_subtask(db, task_id, payload: SubtaskCreate, current):
    return await service.add_subtask(db, task_id, payload, current)


async def toggle_subtask(db, task_id, subtask_id, current):
    return await service.toggle_subtask(db, task_id, subtask_id, current)


async def add_dependency(db, task_id, payload: DependencyCreate, current):
    return await service.add_dependency(db, task_id, payload, current)


async def workload(db, project_id, current):
    return await service.get_workload(db, project_id, current)


# ----------------------------------------------------------------------------
# Sprints
# ----------------------------------------------------------------------------
async def list_sprints(db, project_id, current):
    return await service.list_sprints(db, project_id, current)


async def create_sprint(db, project_id, payload: SprintCreate, current):
    return await service.create_sprint(db, project_id, payload, current)


async def update_sprint(db, sprint_id, payload: SprintUpdate, current):
    return await service.update_sprint(db, sprint_id, payload, current)


async def start_sprint(db, sprint_id, current):
    return await service.start_sprint(db, sprint_id, current)


async def complete_sprint(db, sprint_id, current, move_incomplete_to=None):
    return await service.complete_sprint(db, sprint_id, current, move_incomplete_to)


async def delete_sprint(db, sprint_id, current):
    return await service.delete_sprint(db, sprint_id, current)
