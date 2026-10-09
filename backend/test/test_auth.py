import pytest
from httpx import AsyncClient

USER_DATA = {
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
}

@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    data = USER_DATA.copy()
    data["email"] = "signup_test@example.com"
    
    response = await client.post("/auth/register", json=data)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data

@pytest.mark.asyncio
async def test_duplicate_signup(client: AsyncClient):
    data = {
        "email": "duplicate_check@example.com",
        "password": "password123"
    }
    # First registration must succeed
    res1 = await client.post("/auth/register", json=data)
    assert res1.status_code == 201

    # Second registration with identical email must be rejected with 400
    res2 = await client.post("/auth/register", json=data)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()

    # Even with different case it must be rejected
    data_upper = {
        "email": "DUPLICATE_CHECK@example.com",
        "password": "password123"
    }
    res3 = await client.post("/auth/register", json=data_upper)
    assert res3.status_code == 400
    assert "already exists" in res3.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post("/auth/register", json=USER_DATA)

    login_data = {
        "username": USER_DATA["email"],
        "password": USER_DATA["password"]
    }
    response = await client.post("/auth/token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    bad_data = {
        "username": USER_DATA["email"],
        "password": "wrongpassword"
    }
    response = await client.post("/auth/token", data=bad_data)
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_guest_login(client: AsyncClient):
    response = await client.post("/auth/guest")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
