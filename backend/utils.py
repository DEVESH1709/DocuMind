from pydantic_settings import BaseSettings
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta

class Settings(BaseSettings):

    MONGO_URI: str
    MONGO_DB: str 
    JWT_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int 
    GROQ_API_KEY: str 

    class Config:
        env_file = ".env"

settings = Settings()

pwd_context = CryptContext(schemes=["argon2"], deprecated ="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/auth/token")

def get_password_hash(password:str) ->str:
    return pwd_context.hash(password)

def verify_password(plain_pwd:str, hashed_pwd:str)->bool:
    return pwd_context.verify(plain_pwd,hashed_pwd)

async def get_current_user(token:str = Depends(oauth2_scheme)):
    """
      Dependency to extract and verify JWT, returning user info.
    """

    credentials_exception = HTTPException(
        status_code = 401,
        detail = "Could not validate credentials",
    )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms = ["HS256"])
        email:str = payload.get("sub")
        if email is None:
            raise JWTError()
    except JWTError:
            raise credentials_exception
    return {"email":email}

def create_access_token(data: dict, expires_delta: int = None):
    """
    Create JWT token for given data payload (sub, exp).
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
    return token