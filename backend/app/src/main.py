from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import asyncio

from src.routers.health import router as health_router
from src.db import test_connection, wait_for_db
from src.routers.auth import router as auth_router
from src.routers.users import router as users_router
from src.routers.pets import router as pets_router

def create_app() -> FastAPI:
    app = FastAPI(title="PetVerse API")

    # Logging setup
    logger.add(lambda msg: print(msg, end=""))

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(health_router)
    # Authentication routes (Google OAuth callback, JWT issuance)
    app.include_router(auth_router, prefix="/auth")
    app.include_router(users_router)
    app.include_router(pets_router)

    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting PetVerse API")
        loop = asyncio.get_running_loop()
        db_ok = await loop.run_in_executor(None, wait_for_db)  # bloqueo en hilo
        if db_ok:
            logger.info("Database connection OK")
        else:
            logger.warning("Database connection FAILED")

    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down PetVerse API")

    return app


app = create_app()
