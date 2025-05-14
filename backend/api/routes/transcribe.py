from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Body
from typing import Optional

from models.user import User
from models.transcription import TranscriptionRequest, TranscriptionResponse
from services.auth import get_current_active_user
from services.transcription import start_transcription, get_transcription_result

router = APIRouter()


@router.post("/start", response_model=TranscriptionResponse)
async def start_transcription_job(
    request: TranscriptionRequest = Body(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Start a real-time transcription job with AWS Transcribe Medical
    """
    try:
        transcription_job = start_transcription(
            user_id=current_user.id,
            specialty=request.specialty,
            language_code=request.language_code
        )
        return transcription_job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start transcription: {str(e)}"
        )


@router.post("/upload", response_model=TranscriptionResponse)
async def upload_audio_file(
    audio_file: UploadFile = File(...),
    specialty: str = Body("PRIMARY_CARE"),
    language_code: str = Body("en-US"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload an audio file for transcription
    """
    if not audio_file.filename.endswith(('.mp3', '.wav', '.flac')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload MP3, WAV, or FLAC files."
        )
    
    try:
        audio_content = await audio_file.read()
        transcription_job = start_transcription(
            user_id=current_user.id,
            specialty=specialty,
            language_code=language_code,
            audio_data=audio_content
        )
        return transcription_job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload and transcribe audio: {str(e)}"
        )


@router.get("/{job_id}", response_model=TranscriptionResponse)
async def get_transcription(
    job_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the result of a transcription job
    """
    try:
        result = get_transcription_result(job_id, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transcription: {str(e)}"
        ) 