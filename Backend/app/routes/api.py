from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List
import uuid
from uuid import UUID
from sqlalchemy.orm import Session

# Import your custom schemas and utilities
from app.database import get_db
from app.utils import get_current_user
from app.models import User, Product as DBProduct, CartItem, Order, OrderItem, user_product_likes, Review
from app.schemas import (
    Product, ReturnDescriptionSchema, ReturnSessionSchema, QuizDoneSchema, Answer, 
    TranslateRequest, TranslateResponse, CartItemAdd, CartItemUpdate, CartItemResponse,
    OrderResponse, OrderStatusUpdate, ProductResponse, MessageResponse, ReviewCreate, ReviewResponse
)
from app.helpers import toString, split_responses, translate_helper
from app.prompts import imageDescriptionPrompt, nextQuestionPrompt, storyPrompt

# Import your new Groq LLM service
from app.services.llm_services import generate_text, generate_with_image

# Create a single unified router
router = APIRouter(prefix="/api", tags=["artisan_sphere"])

# ==========================================
# 1. GENERATE DESCRIPTION ROUTE
# ==========================================
@router.post("/generate-description", response_model=ReturnDescriptionSchema)
async def generate_description(product: Product):
    try:
        prompt = f"{imageDescriptionPrompt}\n\nProduct name: {product.title}"
        
        if product.image_url:
            # Pass the Cloudinary URL directly to Groq! No parsing needed.
            result_text = await generate_with_image(prompt, product.image_url)
        else:
            result_text = await generate_text(prompt)

        separated = split_responses(result_text)
    
        return ReturnDescriptionSchema(
            status=True,
            aiDescription=separated
        )

    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 2. STORY SESSION ROUTES
# ==========================================
# Simple in-memory session store
sessions: Dict[str, Dict] = {}

@router.post("/start-session", response_model=ReturnSessionSchema)
async def start_session(product: Product):
    session_id = str(uuid.uuid4())
    first_question = "Tell me about yourself as an artisan."

    sessions[session_id] = {
        "history": [{"q": first_question, "a": None}],
        "count": 0,
        "title": product.title,
        "image": product.image_url
    }
    
    print("Session created successfully:", session_id)
    return ReturnSessionSchema(
        sessionId=session_id,
        question=first_question
    )

@router.post("/answer", response_model=QuizDoneSchema)
async def submit_answer(data: Answer):
    session = sessions.get(data.session_id)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid session")

    # Normalize answer
    ans = (data.answer or "").strip()

    # Fill last unanswered question
    if session["history"] and session["history"][-1]["a"] is None:
        session["history"][-1]["a"] = ans
    else:
        raise HTTPException(status_code=400, detail="No pending question to answer")

    session["count"] += 1

    # Stop condition -> Generate final story
    if ans == "__STOP__" or session["count"] >= 10:
        history_text = toString(session["history"])
        story_prompt = storyPrompt(history_text, session["title"], session["image"])
        
        # Using the fast versatile text model for the story compilation
        story_text = await generate_text(story_prompt)
        print(story_text)
        
        return QuizDoneSchema(
            done=True,
            question=story_text
        )

    # Otherwise -> Generate next question
    history_text = toString(session["history"])
    prompt = nextQuestionPrompt(history_text, session["title"], session["image"])
    
    # Using the fast versatile text model for the Q&A loop
    next_q_text = await generate_text(prompt)
    print(next_q_text)
    
    session["history"].append({"q": next_q_text, "a": None})

    return QuizDoneSchema(
        done=False,
        question=next_q_text
    )


# ==========================================
# 3. TRANSLATE ROUTE
# ==========================================
@router.post("/translate", response_model=TranslateResponse)
async def translate_text(req: TranslateRequest):
    """
    Translate text into target language using Groq's Llama model instead of Google Cloud
    """
    try:
        translated_text = await translate_helper(req.text, req.target_language)
        return TranslateResponse(
            success=True,
            translated_text=translated_text
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 4. CART ENDPOINTS
# ==========================================
@router.post("/cart/add", response_model=CartItemResponse)
def add_to_cart(
    cart_item: CartItemAdd, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        product = db.query(DBProduct).filter(DBProduct.id == cart_item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        existing_item = db.query(CartItem).filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == cart_item.product_id
        ).first()
        
        if existing_item:
            existing_item.quantity += cart_item.quantity
            db.commit()
            db.refresh(existing_item)
            return existing_item
        else:
            new_item = CartItem(
                user_id=current_user.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity
            )
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            return new_item
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in add_to_cart:", str(e))
        raise HTTPException(status_code=500, detail="Database operation failed")


@router.get("/cart/", response_model=List[CartItemResponse])
def get_cart(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        return db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    except Exception as e:
        print("Database error in get_cart:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch cart items")


@router.put("/cart/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: UUID, 
    cart_item_update: CartItemUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id
        ).first()
        
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
            
        if cart_item_update.quantity < 1:
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")
            
        item.quantity = cart_item_update.quantity
        db.commit()
        db.refresh(item)
        return item
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in update_cart_item:", str(e))
        raise HTTPException(status_code=500, detail="Failed to update cart item")


@router.delete("/cart/{item_id}", response_model=MessageResponse)
def delete_cart_item(
    item_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id
        ).first()
        
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
            
        db.delete(item)
        db.commit()
        return MessageResponse(message="Item removed from cart")
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in delete_cart_item:", str(e))
        raise HTTPException(status_code=500, detail="Failed to remove cart item")


# ==========================================
# 5. ORDER ENDPOINTS
# ==========================================
@router.post("/orders/", response_model=OrderResponse)
def place_order(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
            
        total_price = sum(item.product.price * item.quantity for item in cart_items)
        
        order = Order(
            buyer_id=current_user.id,
            status="processing",
            total_price=total_price
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        
        for item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=item.product.price
            )
            db.add(order_item)
            db.delete(item)
            
        db.commit()
        db.refresh(order)
        
        items_out = []
        for item in order.items:
            items_out.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_title": item.product.title,
                "product_title_hi": item.product.title_hi,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            })
            
        return {
            "id": order.id,
            "buyer_id": order.buyer_id,
            "status": order.status,
            "total_price": order.total_price,
            "created_at": order.created_at,
            "items": items_out
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in place_order:", str(e))
        raise HTTPException(status_code=500, detail="Failed to place order")


@router.get("/orders/buyer", response_model=List[OrderResponse])
def get_buyer_orders(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()
        
        result = []
        for order in orders:
            items_out = []
            for item in order.items:
                items_out.append({
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_title": item.product.title,
                    "product_title_hi": item.product.title_hi,
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase
                })
            result.append({
                "id": order.id,
                "buyer_id": order.buyer_id,
                "status": order.status,
                "total_price": order.total_price,
                "created_at": order.created_at,
                "items": items_out
            })
        return result
    except Exception as e:
        print("Database error in get_buyer_orders:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch orders")


@router.get("/orders/artisan", response_model=List[OrderResponse])
def get_artisan_orders(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "artisan":
        raise HTTPException(status_code=403, detail="Only artisans can view received orders")
        
    try:
        orders = db.query(Order).join(OrderItem).join(DBProduct).filter(
            DBProduct.artisan_id == current_user.id
        ).distinct().order_by(Order.created_at.desc()).all()
        
        result = []
        for order in orders:
            items_out = []
            for item in order.items:
                if item.product.artisan_id == current_user.id:
                    items_out.append({
                        "id": item.id,
                        "product_id": item.product_id,
                        "product_title": item.product.title,
                        "product_title_hi": item.product.title_hi,
                        "quantity": item.quantity,
                        "price_at_purchase": item.price_at_purchase
                    })
            if items_out:
                result.append({
                    "id": order.id,
                    "buyer_id": order.buyer_id,
                    "status": order.status,
                    "total_price": order.total_price,
                    "created_at": order.created_at,
                    "items": items_out
                })
                
        return result
    except Exception as e:
        print("Database error in get_artisan_orders:", str(e))
        raise HTTPException(status_code=500, detail="Failed to load incoming orders")


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: UUID, 
    status_update: OrderStatusUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "artisan":
        raise HTTPException(status_code=403, detail="Only artisans can update order status")
        
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        has_artisan_item = False
        for item in order.items:
            if item.product.artisan_id == current_user.id:
                has_artisan_item = True
                break
                
        if not has_artisan_item:
            raise HTTPException(status_code=403, detail="You do not have permission to update this order")
            
        valid_statuses = {"processing", "shipped", "delivered", "cancelled"}
        if status_update.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")
            
        order.status = status_update.status
        db.commit()
        db.refresh(order)
        
        items_out = []
        for item in order.items:
            items_out.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_title": item.product.title,
                "product_title_hi": item.product.title_hi,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            })
            
        return {
            "id": order.id,
            "buyer_id": order.buyer_id,
            "status": order.status,
            "total_price": order.total_price,
            "created_at": order.created_at,
            "items": items_out
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in update_order_status:", str(e))
        raise HTTPException(status_code=500, detail="Failed to update order status")


# ==========================================
# 6. FAVORITES ENDPOINTS
# ==========================================
from pydantic import BaseModel

class FavouriteToggleSchema(BaseModel):
    product_id: UUID

@router.post("/favourites/toggle", response_model=dict)
def toggle_favourite(
    payload: FavouriteToggleSchema, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        product = db.query(DBProduct).filter(DBProduct.id == payload.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        is_liked = db.query(user_product_likes).filter(
            user_product_likes.c.user_id == current_user.id,
            user_product_likes.c.product_id == payload.product_id
        ).first()
        
        if is_liked:
            db.execute(
                user_product_likes.delete().where(
                    user_product_likes.c.user_id == current_user.id,
                    user_product_likes.c.product_id == payload.product_id
                )
            )
            db.commit()
            return {"liked": False, "message": "Product removed from favorites"}
        else:
            db.execute(
                user_product_likes.insert().values(
                    user_id=current_user.id,
                    product_id=payload.product_id
                )
            )
            db.commit()
            return {"liked": True, "message": "Product added to favorites"}
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in toggle_favourite:", str(e))
        raise HTTPException(status_code=500, detail="Failed to update favorites")


@router.get("/favourites/", response_model=List[ProductResponse])
def get_favourites(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        liked_products = db.query(DBProduct).join(
            user_product_likes, 
            DBProduct.id == user_product_likes.c.product_id
        ).filter(
            user_product_likes.c.user_id == current_user.id
        ).all()
        
        return liked_products
    except Exception as e:
        print("Database error in get_favourites:", str(e))
        raise HTTPException(status_code=500, detail="Failed to load favorites")


# ==========================================
# 7. PLATFORM STATS & ANALYTICS
# ==========================================
@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db)):
    try:
        total_products = db.query(DBProduct).count()
        total_artisans = db.query(User).filter(User.role == "artisan").count()
        
        # Count unique categories
        total_categories = db.query(DBProduct.category).distinct().count()
        if total_categories == 0:
            total_categories = 5
            
        return {
            "products": total_products,
            "artisans": total_artisans,
            "categories": total_categories
        }
    except Exception as e:
        print("Error fetching platform stats:", str(e))
        raise HTTPException(status_code=500, detail="Failed to load marketplace stats")


@router.get("/artisan/analytics")
def get_artisan_analytics(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "artisan":
        raise HTTPException(status_code=403, detail="Only artisans can view analytics")
        
    try:
        total_products = db.query(DBProduct).filter(DBProduct.artisan_id == current_user.id).count()
        
        orders_count = db.query(OrderItem).join(DBProduct).filter(
            DBProduct.artisan_id == current_user.id
        ).count()
        
        revenue_results = db.query(OrderItem.price_at_purchase, OrderItem.quantity).join(DBProduct).filter(
            DBProduct.artisan_id == current_user.id
        ).all()
        
        total_revenue = sum(price * qty for price, qty in revenue_results)
        
        # Calculate real average rating of products
        rating_results = db.query(Review.rating).join(DBProduct).filter(
            DBProduct.artisan_id == current_user.id
        ).all()
        
        avg_rating = 0.0
        if rating_results:
            avg_rating = round(sum(r[0] for r in rating_results) / len(rating_results), 1)
        
        return {
            "total_products": total_products,
            "orders": orders_count,
            "revenue": total_revenue,
            "rating": avg_rating
        }
    except Exception as e:
        print("Error fetching artisan analytics:", str(e))
        raise HTTPException(status_code=500, detail="Failed to load analytics data")


# ==========================================
# 15. REVIEWS ROUTES
# ==========================================
@router.post("/products/{product_id}/reviews", response_model=ReviewResponse)
async def create_or_update_review(
    product_id: UUID,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(DBProduct).filter(DBProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.artisan_id == current_user.id:
        raise HTTPException(status_code=400, detail="Artisans cannot review their own products")

    if review_in.rating < 1 or review_in.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    comment_hi = None
    if review_in.comment and review_in.comment.strip():
        comment_hi = await translate_helper(review_in.comment, "Hindi")

    existing_review = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id
    ).first()

    if existing_review:
        existing_review.rating = review_in.rating
        existing_review.comment = review_in.comment
        existing_review.comment_hi = comment_hi
        db.commit()
        db.refresh(existing_review)
        review = existing_review
    else:
        new_review = Review(
            product_id=product_id,
            user_id=current_user.id,
            rating=review_in.rating,
            comment=review_in.comment,
            comment_hi=comment_hi
        )
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        review = new_review

    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        user_username=current_user.username,
        rating=review.rating,
        comment=review.comment,
        comment_hi=review.comment_hi,
        created_at=review.created_at
    )


@router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
def get_product_reviews(product_id: UUID, db: Session = Depends(get_db)):
    product = db.query(DBProduct).filter(DBProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    response = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        username = user.username if user else "Anonymous"
        response.append(
            ReviewResponse(
                id=r.id,
                product_id=r.product_id,
                user_id=r.user_id,
                user_username=username,
                rating=r.rating,
                comment=r.comment,
                comment_hi=r.comment_hi,
                created_at=r.created_at
            )
        )
    return response