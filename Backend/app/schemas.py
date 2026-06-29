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
    bio: Optional[str] = None
    store_picture: Optional[str] = None
    location: Optional[str] = None
    contact_info: Optional[str] = None

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
    title_hi: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    description_hi: Optional[str] = None
    story: Optional[str] = None
    story_hi: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None


class ProductResponse(BaseModel):
    id: UUID
    artisan_id: UUID
    title: str
    title_hi: Optional[str] = None
    category: str
    description: Optional[str]
    description_hi: Optional[str] = None
    story: Optional[str]
    story_hi: Optional[str] = None
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


# ==========================================
# EXTENDED SYSTEM SCHEMAS
# ==========================================

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    store_picture: Optional[str] = None
    location: Optional[str] = None
    contact_info: Optional[str] = None

class CartItemAdd(BaseModel):
    product_id: UUID
    quantity: Optional[int] = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product: ProductResponse
    quantity: int

    class Config:
        from_attributes = True

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_title: str
    product_title_hi: Optional[str] = None
    quantity: int
    price_at_purchase: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: UUID
    buyer_id: UUID
    status: str
    total_price: float
    created_at: datetime
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str


class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: UUID
    product_id: UUID
    user_id: UUID
    user_username: str
    rating: int
    comment: Optional[str] = None
    comment_hi: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True