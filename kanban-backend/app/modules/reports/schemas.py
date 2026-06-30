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


class WorkloadItem(BaseModel):
    member_id: str
    member_name: str
    tasks_todo: int
    tasks_in_progress: int
    tasks_done: int
