from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from sqlalchemy import or_
from app.database import get_db
from app.models import User
from app.schemas import *
from app.utils import *
from app.services.cloudinary_service import upload_image
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterOutputSchema)
def register(user: RegisterInputSchema, db: Session = Depends(get_db)):

    # check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    try:
        hashed_pw = bcrypt.hash(user.password)

        new_user = User(
            email=user.email,
            username=user.username,
            password=hashed_pw,
            role=user.role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return RegisterOutputSchema(
            id= new_user.id,
            email = new_user.email,
            username = new_user.username,
            role = new_user.role,
            created_at = new_user.created_at
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@router.post("/login", response_model=TokenSchema)
def login(user: UserCreate, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(
        or_(
            User.email == user.email_or_username,
            User.username == user.email_or_username
        )
    ).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    if not bcrypt.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    token_data = {
        "id": str(db_user.id),
        "email": db_user.email,
        "username": db_user.username,
        "role": db_user.role
    }

    token = create_token(data=token_data, expires=timedelta(hours=24))

    return TokenSchema(
        token=token,
        token_type="bearer"
    )

@router.get("/profile", response_model=ProfileResponse)
def profile_fetch(db:Session = Depends(get_db) , user:User = Depends(get_current_user)):
    return user

@router.put("/profile", response_model=ProfileResponse)
def profile_update(profile_data: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if profile_data.bio is not None:
        user.bio = profile_data.bio
    if profile_data.store_picture is not None:
        user.store_picture = profile_data.store_picture
    if profile_data.location is not None:
        user.location = profile_data.location
    if profile_data.contact_info is not None:
        user.contact_info = profile_data.contact_info
        
    db.commit()
    db.refresh(user)
    return user

@router.post("/profile/upload-picture", response_model=ProfileResponse)
def profile_upload_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        image_url = upload_image(file.file)
        user.store_picture = image_url
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        print("Profile upload picture error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to upload image. Please try again.")

@router.post("/upgrade", response_model=ProfileResponse)
def upgrade_to_artisan(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        user.role = "artisan"
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        print("Upgrade error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to upgrade profile to artisan.")