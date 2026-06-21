from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="Kanbix API",
    description="Sistema Kanban desarrollado bajo el enfoque Spec-Driven Development (SDD)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Kanbix API está corriendo 🚀"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# --- Aquí se incluirán los routers de cada módulo ---
# from app.routers import auth_router, projects_router, tasks_router, sprints_router, alerts_router, metrics_router
# app.include_router(auth_router.router, prefix="/auth", tags=["Autenticación"])
# app.include_router(projects_router.router, prefix="/projects", tags=["Proyectos"])
# app.include_router(tasks_router.router, prefix="/tasks", tags=["Tareas"])
# app.include_router(sprints_router.router, prefix="/sprints", tags=["Sprints"])
# app.include_router(alerts_router.router, prefix="/alerts", tags=["Alertas"])
# app.include_router(metrics_router.router, prefix="/metrics", tags=["Métricas"])
