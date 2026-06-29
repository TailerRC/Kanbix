from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.modules.auth.model import ensure_indexes
from app.modules.auth.routes import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await ensure_indexes()
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

app.include_router(auth_router)


@app.get("/")
async def root():
    return {"message": "Kanbix API está corriendo 🚀"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
