from fastapi import APIRouter, UploadFile, File, Form
from app.services.interview_service import verify_interview

router = APIRouter(prefix="/interview")


@router.post("/verify")

async def verify(
        unique_id: str = Form(...),
        frame: UploadFile = File(...)
):

    result = verify_interview(unique_id, await frame.read())

    return result