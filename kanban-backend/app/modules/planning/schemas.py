"""Pydantic models del módulo de Planificación y Asignaciones (Módulo 4)."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

# ADR-006: escala Fibonacci para estimación.
FIBONACCI = {1, 2, 3, 5, 8, 13}


class PlanningUpdate(BaseModel):
    due_date: Optional[datetime] = None
    story_points: Optional[int] = None

    @field_validator("story_points")
    @classmethod
    def check_fibonacci(cls, v):
        if v is not None and v not in FIBONACCI:
            raise ValueError("story_points fuera de la escala Fibonacci (1, 2, 3, 5, 8, 13)")
        return v


class SubtaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class DependencyCreate(BaseModel):
    depends_on_task_id: str
