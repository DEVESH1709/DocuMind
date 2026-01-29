from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from motor.motor_asyncio import AsyncIOMotorClient
from utils import Settings

settings = Settings()
app = FastAPI(title="Documind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(settings.MONGO_URI)
    app.database = app.mongodb_client[settings.MONGO_DB]

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()