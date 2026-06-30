from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.shared.errors import register_error_handlers

# Routers de cada módulo (composición en el root de la app).
from app.modules.auth import routes as auth_routes
from app.modules.auth.service import ensure_seed_admin
from app.modules.projects import routes as projects_routes
from app.modules.boards import routes as boards_routes
from app.modules.planning import routes as planning_routes
from app.modules.notifications import routes as notifications_routes
from app.modules.reports import routes as reports_routes

API_PREFIX = "/api/v1"


async def _ensure_indexes(db) -> None:
    # Tolerante a índices preexistentes en el cluster (no debe romper el arranque).
    index_specs = [
        (db.users, "email", {"unique": True}),
        (db.projects, "name", {"unique": True}),
        (db.tasks, "project_id", {}),
        (db.tasks, "column_id", {}),
        (db.boards, "project_id", {}),
        (db.columns, "board_id", {}),
        (db.notifications, "id_usuario", {}),
        (db.refresh_tokens, "token", {"unique": True}),
    ]
    for collection, field, opts in index_specs:
        try:
            await collection.create_index(field, **opts)
        except Exception as exc:  # índice ya existe con otra especificación
            print(f"[WARN] indice {field}: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    db = get_database()
    await _ensure_indexes(db)
    await ensure_seed_admin(db)  # RN-08
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
    # Permite cualquier puerto de localhost/127.0.0.1 en desarrollo (Vite puede
    # cambiar de puerto si el 5173 está ocupado).
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)


@app.get("/")
async def root():
    return {"message": "Kanbix API está corriendo 🚀"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# --- Routers de los módulos ---
app.include_router(auth_routes.router, prefix=API_PREFIX)          # Módulo 1: /auth
app.include_router(auth_routes.admin_router, prefix=API_PREFIX)    # Módulo 1: /admin
app.include_router(projects_routes.router, prefix=API_PREFIX)      # Módulo 2: /projects
app.include_router(boards_routes.router, prefix=API_PREFIX)        # Módulo 3
app.include_router(planning_routes.router, prefix=API_PREFIX)      # Módulo 4
app.include_router(notifications_routes.router, prefix=API_PREFIX) # Módulo 5: /notifications
app.include_router(reports_routes.router, prefix=API_PREFIX)       # Módulo 6
app.include_router(notifications_routes.ws_router)                 # Módulo 5: /ws/notifications
