from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models import Product, User
from app.schemas import MessageResponse, ProductCreate, ProductUpdate, ProductResponse
from app.utils import get_current_user
from app.services.cloudinary_service import upload_image

router = APIRouter(prefix="/products", tags=["Products"])


from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
# ... your other imports ...

@router.post("/addproduct", response_model=ProductResponse)
def add_product(
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

    # Upload the image
    image_url = upload_image(image.file)

    # Create the product directly using the form variables
    new_product = Product(
        artisan_id=current_user.id,
        title=title,
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


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

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


@router.put("/updateproduct/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role != "artisan":
        raise HTTPException(status_code=403, detail="Only artisans can update products")

    if product.artisan_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if product_update.title is not None:
        product.title = product_update.title

    if product_update.category is not None:
        product.category = product_update.category

    if product_update.description is not None:
        product.description = product_update.description

    if product_update.story is not None:
        product.story = product_update.story

    if product_update.image_url is not None:
        product.image_url = product_update.image_url

    if product_update.price is not None:
        product.price = product_update.price

    db.commit()
    db.refresh(product)

    return ProductResponse(
        id=product.id,
        artisan_id=product.artisan_id,
        title=product.title,
        category=product.category,
        description=product.description,
        story=product.story,
        image_url=product.image_url,
        price=product.price,
        created_at=product.created_at
    )


@router.get("/getproducts", response_model=list[ProductResponse])
def get_products(
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(Product)

    if category is not None:
        query = query.filter(Product.category == category)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    products = query.all()

    response = []

    for product in products:
        response.append(
            ProductResponse(
                id=product.id,
                artisan_id=product.artisan_id,
                title=product.title,
                category=product.category,
                description=product.description,
                story=product.story,
                image_url=product.image_url,
                price=product.price,
                created_at=product.created_at
            )
        )

    return response


@router.get("/myproducts", response_model=list[ProductResponse])
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    products = db.query(Product).filter(Product.artisan_id == current_user.id).all()

    response = []

    for product in products:
        response.append(
            ProductResponse(
                id=product.id,
                artisan_id=product.artisan_id,
                title=product.title,
                category=product.category,
                description=product.description,
                story=product.story,
                image_url=product.image_url,
                price=product.price,
                created_at=product.created_at
            )
        )

    return response


@router.get("/getproduct/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return ProductResponse(
        id=product.id,
        artisan_id=product.artisan_id,
        title=product.title,
        category=product.category,
        description=product.description,
        story=product.story,
        image_url=product.image_url,
        price=product.price,
        created_at=product.created_at
    )