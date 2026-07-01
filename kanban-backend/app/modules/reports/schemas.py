"""Pydantic models del módulo de Reportes y Dashboard (Módulo 6)."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ActiveSprint(BaseModel):
    id: str
    name: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class DashboardSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    active_sprint: Optional[ActiveSprint] = None


class BurndownPoint(BaseModel):
    date: str
    ideal_remaining: float
    actual_remaining: float


class BurnupPoint(BaseModel):
    date: str
    scope: float
    completed: float


class VelocityItem(BaseModel):
    sprint_id: str
    sprint_name: str
    committed_points: float
    completed_points: float


class WorkloadItem(BaseModel):
    member_id: str
    member_name: str
    tasks_todo: int
    tasks_in_progress: int
    tasks_done: int


# ---------- Resumen (overview) ----------
class Metrics7d(BaseModel):
    created: int
    updated: int
    completed: int
    due_soon: int


class StatusCount(BaseModel):
    status: str
    count: int


class TypeCount(BaseModel):
    type: str
    count: int


class AssigneeCount(BaseModel):
    assignee_id: Optional[str] = None
    name: str
    count: int


class RecentActivityItem(BaseModel):
    task_id: str
    title: Optional[str] = None
    status: Optional[str] = None
    assignee: Optional[str] = None
    updated_at: Optional[datetime] = None


class DashboardOverview(BaseModel):
    metrics_7d: Metrics7d
    by_status: List[StatusCount]
    by_type: List[TypeCount]
    by_assignee: List[AssigneeCount]
    recent_activity: List[RecentActivityItem]


class SprintReportMetrics(BaseModel):
    committed_points: float
    completed_points: float
    total_tasks: int
    completed_tasks: int


class SprintReportTaskSnapshot(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    assignee_name: str
    story_points: float
    due_date: Optional[str] = None
    subtasks_count: int
    completed_subtasks_count: int


class SprintReportSummary(BaseModel):
    sprint_id: str
    sprint_name: str
    goal: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    completed_at: datetime
    metrics: SprintReportMetrics


class SprintReportDetail(SprintReportSummary):
    project_id: str
    completed_by: str
    tasks: List[SprintReportTaskSnapshot]
