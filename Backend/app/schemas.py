from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class RegisterInputSchema(BaseModel):
    email: str
    username: str
    password: str
    role: str

class RegisterOutputSchema(BaseModel):
    id: UUID
    email: str
    username: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email_or_username: str
    password: str

class TokenSchema(BaseModel):
    token: str  
    token_type: str = "bearer"
    
class ProfileResponse(BaseModel):
    
    email: str
    username: str
    role: str
    class Config:
        from_attributes = True




class ProductCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    story: Optional[str] = None
    image_url: str
    price: float


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    story: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None


class ProductResponse(BaseModel):
    id: UUID
    artisan_id: UUID
    title: str
    category: str
    description: Optional[str]
    story: Optional[str]
    image_url: str
    price: float
    created_at: datetime

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    message: str


class OneDescription(BaseModel):
    title:str
    text:str

class ReturnDescriptionSchema(BaseModel):
    status:bool
    aiDescription:list[str]

class Product(BaseModel):
    title: str
    image_url: str | None = None

class ReturnSessionSchema(BaseModel):
    sessionId:str
    question:str

class QuizDoneSchema(BaseModel):
    done:bool
    question:str

class Answer(BaseModel):
    session_id: str
    answer: str

class TranslateRequest(BaseModel):
    text: str
    target_language: str

class TranslateResponse(BaseModel):
    success:bool
    translated_text:str