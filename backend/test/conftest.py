import pytest
import asyncio
import sys
from unittest.mock import MagicMock

# Ensure any import-time usage of `whisper` in app modules is mocked
mock_whisper = MagicMock()
mock_whisper.load_model.return_value = MagicMock()
sys.modules["whisper"] = mock_whisper

from httpx import AsyncClient, ASGITransport
from main import app
from mongomock_motor import AsyncMongoMockClient
from utils import Settings

def get_test_settings():
    return Settings(
        MONGO_URI="mongodb://mock_test",
        MONGO_DB="test_db",
        JWT_SECRET="test_secret",
        ACCESS_TOKEN_EXPIRE_MINUTES=30,
        ACCESS_TOKEN_EXPIRE_MINUTES=30,
        GROQ_API_KEY="mock_groq_key",
        REDIS_URL="redis://localhost:6379"
    )



@pytest.fixture
async def mock_db():
    client = AsyncMongoMockClient()
    db = client.get_database("test_db")
    return db

@pytest.fixture
async def client(mock_db):
    app.database = mock_db
    app.mongodb_client = None  

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def override_auth():
    from utils import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {"sub": "test@example.com"}
    yield
    app.dependency_overrides = {}
