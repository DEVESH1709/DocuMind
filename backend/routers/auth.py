from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timedelta
from utils import (
    Settings, get_password_hash, verify_password,
    oauth2_scheme, create_access_token
)

from pydantic import BaseModel, EmailStr

router = APIRouter()
settings = Settings()


class UserIn(BaseModel):
    email :EmailStr
    password:str

class Token(BaseModel):
    access_token:str
    token_type:str="bearer"



@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user: UserIn, request: Request):
    db = request.app.database
    email = user.email.strip().lower()

    # Check if user already exists
    existing = await db["users"].find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )

    hashed_pw = get_password_hash(user.password)
    try:
        await db["users"].insert_one({
            "email": email,
            "password": hashed_pw,
            "created_at": datetime.utcnow()
        })
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )

    access_token = create_access_token(data={"sub": email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    db = request.app.database
    email = form_data.username.strip().lower()
    user = await db["users"].find_one({"email": email})
    if not user:
        # Fallback to exact match for legacy accounts that had uppercase letters
        user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/guest", response_model=Token)
async def login_guest():
    """
    Get a guest token for demo purposes (no DB required).
    """
    access_token = create_access_token(data={"sub": "guest@knowflow.ai"})
    return {"access_token": access_token, "token_type": "bearer"}
