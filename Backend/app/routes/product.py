from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models import Product, User
from app.schemas import MessageResponse, ProductCreate, ProductUpdate, ProductResponse
from app.utils import get_current_user
from app.services.cloudinary_service import upload_image
from app.helpers import translate_helper

router = APIRouter(prefix="/products", tags=["Products"])


from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
# ... your other imports ...

@router.post("/addproduct", response_model=ProductResponse)
async def add_product(
    title: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    description: str | None = Form(None),
    story: str | None = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "artisan":
        raise HTTPException(
            status_code=403,
            detail="Only artisans can add products"
        )

    try:
        # Upload the image
        image_url = upload_image(image.file)

        # Translate title to Hindi
        title_hi = await translate_helper(title, "hi")

        # Create the product directly using the form variables
        new_product = Product(
            artisan_id=current_user.id,
            title=title,
            title_hi=title_hi,
            category=category,
            description=description,
            story=story,
            image_url=image_url,
            price=price
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return new_product
    except Exception as e:
        print("Database error in add_product:", str(e))
        raise HTTPException(status_code=500, detail="Failed to add product to database.")


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        product = db.query(Product).filter(Product.id == product_id).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product.artisan_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        db.delete(product)
        db.commit()

        return MessageResponse(
            message="Product deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in delete_product:", str(e))
        raise HTTPException(status_code=500, detail="Failed to delete product from database.")


@router.put("/updateproduct/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        product = db.query(Product).filter(Product.id == product_id).first()

        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")

        if current_user.role != "artisan":
            raise HTTPException(status_code=403, detail="Only artisans can update products")

        if product.artisan_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        if product_update.title is not None:
            product.title = product_update.title
            if product_update.title_hi is not None:
                product.title_hi = product_update.title_hi
            else:
                product.title_hi = await translate_helper(product_update.title, "hi")
        elif product_update.title_hi is not None:
            product.title_hi = product_update.title_hi

        if product_update.category is not None:
            product.category = product_update.category

        if product_update.description is not None:
            product.description = product_update.description
            if product_update.description_hi is not None:
                product.description_hi = product_update.description_hi
            else:
                product.description_hi = await translate_helper(product_update.description, "hi")
        elif product_update.description_hi is not None:
            product.description_hi = product_update.description_hi

        if product_update.story is not None:
            product.story = product_update.story
            if product_update.story_hi is not None:
                product.story_hi = product_update.story_hi
            else:
                product.story_hi = await translate_helper(product_update.story, "hi")
        elif product_update.story_hi is not None:
            product.story_hi = product_update.story_hi

        if product_update.image_url is not None:
            product.image_url = product_update.image_url

        if product_update.price is not None:
            product.price = product_update.price

        db.commit()
        db.refresh(product)

        return product
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in update_product:", str(e))
        raise HTTPException(status_code=500, detail="Failed to update product details.")


@router.get("/getproducts", response_model=list[ProductResponse])
def get_products(
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Product)

        if category is not None:
            query = query.filter(Product.category == category)

        if min_price is not None:
            query = query.filter(Product.price >= min_price)

        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        return query.all()
    except Exception as e:
        print("Database error in get_products:", str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve products from database.")


@router.get("/myproducts", response_model=list[ProductResponse])
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return db.query(Product).filter(Product.artisan_id == current_user.id).all()
    except Exception as e:
        print("Database error in get_my_products:", str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve your products from database.")


@router.get("/getproduct/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        product = db.query(Product).filter(Product.id == product_id).first()

        if product is None:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        return product
    except HTTPException:
        raise
    except Exception as e:
        print("Database error in get_product:", str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve product details.")