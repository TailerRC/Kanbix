"""Pydantic models del módulo de Tableros, Columnas y Tareas (Módulo 3)."""
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Prioridad = Literal["Baja", "Media", "Alta", "Crítica"]


# ---------- Boards ----------
class BoardCreate(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None


class BoardUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None


# ---------- Columns ----------
class ColumnCreate(BaseModel):
    name: str = Field(min_length=1)
    position: int = Field(ge=0)


class ColumnUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    position: Optional[int] = Field(default=None, ge=0)


# ---------- Tasks ----------
class TaskCreate(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = None
    column_id: Optional[str] = None
    priority: Prioridad = "Media"
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list)
    sprint_id: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    priority: Optional[Prioridad] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    story_points: Optional[int] = Field(default=None, ge=0)
    tags: Optional[List[str]] = None
    task_type: Optional[Literal["Tarea", "Recurso", "Contact", "Request"]] = None
    sprint_id: Optional[str] = None


class TaskMove(BaseModel):
    column_id: str
    position: Optional[int] = None


# ---------- Comments ----------
class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
