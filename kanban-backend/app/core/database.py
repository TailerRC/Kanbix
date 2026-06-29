from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class MongoDB:
    client: AsyncIOMotorClient = None
    db = None


mongodb = MongoDB()


async def connect_to_mongo():
    """Se ejecuta al iniciar la aplicación (startup event)."""
    mongodb.client = AsyncIOMotorClient(settings.mongo_uri)
    mongodb.db = mongodb.client[settings.mongo_db_name]
    print(f"[OK] Conectado a MongoDB Atlas - DB: {settings.mongo_db_name}")


async def close_mongo_connection():
    """Se ejecuta al detener la aplicación (shutdown event)."""
    if mongodb.client:
        mongodb.client.close()
        print("[OK] Conexion a MongoDB cerrada")


def get_database():
    """Dependency para inyectar la base de datos en los routers."""
    return mongodb.db
