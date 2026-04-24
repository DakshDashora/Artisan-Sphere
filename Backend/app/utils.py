from datetime import timedelta, datetime, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from dotenv import load_dotenv
from os import getenv

load_dotenv()

SECRET_KEY=getenv("JWT_SECRET_KEY")
ALGORITHM="JWT_ALGORITHM"

def create_token(data: dict, expires:timedelta):
    to_encode= data.copy()
    expire= datetime.now(timezone.utc)+(expires)
    to_encode.update({"exp":expire.timestamp()})
    encoded_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_token

def verify_access_token(token:str):
    try:
        payload= jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        print(str(e))
        return None


oauth2scheme=OAuth2PasswordBearer(tokenUrl="auth/login")
def get_current_user(token:str =Depends(oauth2scheme), db :Session= Depends(get_db))->User:
    payload=verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-authenticate":"Bearer"}
        )
    
    user_id= payload.get("id")
    if user_id is None:
        raise HTTPException(status_code=401,detail="User id not found in token")
     
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
  
    return user