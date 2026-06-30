"""Orquestación HTTP del módulo Reportes."""
from app.modules.reports import service


async def summary(db, project_id, current):
    return await service.dashboard_summary(db, project_id, current)


async def burndown(db, project_id, sprint_id, current):
    return await service.burndown(db, project_id, sprint_id, current)


async def workload(db, project_id, current):
    return await service.workload_report(db, project_id, current)
