"""Endpoints del Módulo 6. Se monta en /api/v1 con rutas explícitas."""
from fastapi import APIRouter, Depends

from app.core.database import get_database
from app.dependencies.permissions import get_current_user
from app.modules.reports import controller
from app.modules.reports.schemas import (
    BurndownPoint,
    BurnupPoint,
    DashboardOverview,
    DashboardSummary,
    VelocityItem,
    WorkloadItem,
    SprintReportSummary,
    SprintReportDetail,
)
from typing import List

router = APIRouter(tags=["Reportes y Dashboard"])


@router.get("/projects/{project_id}/dashboard/summary", response_model=DashboardSummary)
async def dashboard_summary(project_id: str, current=Depends(get_current_user)):
    return await controller.summary(get_database(), project_id, current)


@router.get("/projects/{project_id}/dashboard/overview", response_model=DashboardOverview)
async def dashboard_overview(project_id: str, current=Depends(get_current_user)):
    return await controller.overview(get_database(), project_id, current)


@router.get("/projects/{project_id}/sprints/{sprint_id}/burndown", response_model=List[BurndownPoint])
async def burndown(project_id: str, sprint_id: str, current=Depends(get_current_user)):
    return await controller.burndown(get_database(), project_id, sprint_id, current)


@router.get("/projects/{project_id}/sprints/{sprint_id}/burnup", response_model=List[BurnupPoint])
async def burnup(project_id: str, sprint_id: str, current=Depends(get_current_user)):
    return await controller.burnup(get_database(), project_id, sprint_id, current)


@router.get("/projects/{project_id}/reports/velocity", response_model=List[VelocityItem])
async def velocity(project_id: str, current=Depends(get_current_user)):
    return await controller.velocity(get_database(), project_id, current)


@router.get("/projects/{project_id}/reports/workload", response_model=List[WorkloadItem])
async def workload(project_id: str, current=Depends(get_current_user)):
    return await controller.workload(get_database(), project_id, current)


@router.get("/projects/{project_id}/reports/sprints-completed", response_model=List[SprintReportSummary])
async def list_completed_sprints(project_id: str, current=Depends(get_current_user)):
    return await controller.list_completed_sprints(get_database(), project_id, current)


@router.get("/projects/{project_id}/reports/sprints-completed/{sprint_id}", response_model=SprintReportDetail)
async def get_completed_sprint_detail(project_id: str, sprint_id: str, current=Depends(get_current_user)):
    return await controller.get_completed_sprint_detail(get_database(), project_id, sprint_id, current)
