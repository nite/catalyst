"""Signal in the Wire — standalone FastAPI application."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from openaxis.sigwire.db import init_db
from openaxis.sigwire.router import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SigWire starting up — initializing database")
    await init_db()
    logger.info("SigWire ready")
    yield
    logger.info("SigWire shutting down")


app = FastAPI(
    title="Signal in the Wire",
    description="AI-ranked news aggregator — an OpenAxis node",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
