from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from src.routers.health import router as health_router
from src.db import test_connection

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

    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting PetVerse API")
        db_ok = test_connection()
        if db_ok:
            logger.info("Database connection OK")
        else:
            logger.warning("Database connection FAILED")

    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down PetVerse API")

    return app


app = create_app()
