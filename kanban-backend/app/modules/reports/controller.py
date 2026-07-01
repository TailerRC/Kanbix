"""Orquestación HTTP del módulo Reportes."""
from app.modules.reports import service


async def summary(db, project_id, current):
    return await service.dashboard_summary(db, project_id, current)


async def overview(db, project_id, current):
    return await service.dashboard_overview(db, project_id, current)


async def burndown(db, project_id, sprint_id, current):
    return await service.burndown(db, project_id, sprint_id, current)


async def burnup(db, project_id, sprint_id, current):
    return await service.burnup(db, project_id, sprint_id, current)


async def velocity(db, project_id, current):
    return await service.velocity(db, project_id, current)


async def workload(db, project_id, current):
    return await service.workload_report(db, project_id, current)


async def list_completed_sprints(db, project_id, current):
    return await service.list_completed_sprints_reports(db, project_id, current)


async def get_completed_sprint_detail(db, project_id, sprint_id, current):
    return await service.get_completed_sprint_report_detail(db, project_id, sprint_id, current)
