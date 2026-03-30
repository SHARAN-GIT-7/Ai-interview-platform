from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import IdentityVerification, UserProfile

router = APIRouter(prefix="/verification", tags=["Verification"])


class VerificationCreate(BaseModel):
    userId: Optional[int] = None
    userName: Optional[str] = None
    aadhaarLast4: Optional[str] = None
    aadhaarZipUrl: Optional[str] = None
    passportPhotoUrl: Optional[str] = ""
    uniqueId: Optional[str] = None
    shareCode: Optional[str] = None


class VerificationComplete(BaseModel):
    uniqueId: str
    passportPhotoUrl: Optional[str] = ""


@router.post("/create")
def create_verification(model: VerificationCreate, db: Session = Depends(get_db)):
    """Create a pending identity_verifications record in PostgreSQL."""
    try:
        import uuid

        # Fetch user name from user_profile table if user_id is provided
        user_name = model.userName or "User"
        if model.userId:
            profile = db.query(UserProfile).filter(UserProfile.user_id == model.userId).first()
            if profile and profile.full_name:
                user_name = profile.full_name

        record = IdentityVerification(
            user_id=model.userId,
            user_name=user_name,
            aadhaar_last4=model.aadhaarLast4,
            aadhaar_zip_url=model.aadhaarZipUrl or "Manual Upload",
            passport_photo_url=model.passportPhotoUrl or "",
            unique_id=model.uniqueId or str(uuid.uuid4()),
            share_code=model.shareCode,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return {"message": "Verification created", "uniqueId": record.unique_id, "userName": user_name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/complete")
def complete_verification(model: VerificationComplete, db: Session = Depends(get_db)):
    """Update passport_photo_url for an existing verification record."""
    if not model.uniqueId:
        raise HTTPException(status_code=400, detail="uniqueId is required")

    record = db.query(IdentityVerification).filter(
        IdentityVerification.unique_id == model.uniqueId
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Verification record not found")

    try:
        record.passport_photo_url = model.passportPhotoUrl or ""
        db.commit()
        return {"message": "Verification completed", "uniqueId": record.unique_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{user_id}")
def get_verification_status(user_id: int, db: Session = Depends(get_db)):
    """Check if a user has a completed verification (passport_photo_url is non-empty)."""
    record = db.query(IdentityVerification).filter(
        IdentityVerification.user_id == user_id,
        IdentityVerification.passport_photo_url != "",
        IdentityVerification.passport_photo_url.isnot(None),
    ).order_by(IdentityVerification.id.desc()).first()

    if not record:
        return {"verified": False}

    return {
        "verified": True,
        "uniqueId": record.unique_id,
        "photoUrl": record.passport_photo_url,
    }
