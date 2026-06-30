"""Orquestación HTTP del módulo Planificación."""
from app.modules.planning import service
from app.modules.planning.schemas import (
    DependencyCreate,
    PlanningUpdate,
    SubtaskCreate,
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
