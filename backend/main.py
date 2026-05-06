from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, files, chat
from motor.motor_asyncio import AsyncIOMotorClient
from utils import Settings
from contextlib import asynccontextmanager
import redis.asyncio as redis
from fastapi_limiter import FastAPILimiter
import os
settings = Settings()

@asynccontextmanager
async def lifespan(app: FastAPI):

    app.mongodb_client = AsyncIOMotorClient(settings.MONGO_URI)
    app.database = app.mongodb_client[settings.MONGO_DB]
    print(f" Connected to MongoDB at {settings.MONGO_URI}")

    try:
        redis_url = settings.REDIS_URL 
        r = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        # We won't ping or init limiter here to avoid startup hangs
        print(f"Redis Client Created")
    except Exception as e:
        print(f"Redis Setup Failed: {e}")
        r = None
    
    yield
   
    app.mongodb_client.close()
    try:
        await r.close()
    except:
        pass

app = FastAPI(
    title="Document & Multimedia Q&A API",
    description="A FastAPI backend for AI-powered document/audio question answering (OAuth2 + JWT auth)",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to KnowFlow API"}