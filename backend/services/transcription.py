import boto3
import uuid
import json
import logging
from datetime import datetime
from bson import ObjectId
from typing import Dict, Any, Optional, List

from core.config import settings
from services.database import get_transcriptions_collection
from models.transcription import TranscriptionResponse, TranscriptionSegment

# Set up logging
logger = logging.getLogger(__name__)


def get_transcribe_client():
    """Get AWS Transcribe client."""
    return boto3.client(
        'transcribe',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )


def get_s3_client():
    """Get AWS S3 client."""
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )


def start_transcription(
    user_id: str, 
    specialty: str = "PRIMARY_CARE",
    language_code: str = "en-US",
    audio_data: Optional[bytes] = None
) -> TranscriptionResponse:
    """
    Start a transcription job with AWS Transcribe Medical.
    
    Args:
        user_id: The ID of the user starting the transcription
        specialty: Medical specialty (PRIMARY_CARE, CARDIOLOGY, etc.)
        language_code: Language code (en-US, etc.)
        audio_data: Optional audio data to transcribe
        
    Returns:
        TranscriptionResponse object with job details
    """
    try:
        transcribe = get_transcribe_client()
        job_id = f"scribely-{uuid.uuid4()}"
        
        # For demo purposes, we're simulating the start of a transcription job
        # In a real implementation, we would upload audio to S3 and start a job
        
        # Create transcription job record
        transcription = TranscriptionResponse(
            job_id=job_id,
            user_id=ObjectId(user_id),
            status="in_progress",
            specialty=specialty,
            language_code=language_code,
            segments=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save to database
        transcription_dict = transcription.dict(by_alias=True)
        get_transcriptions_collection().insert_one(transcription_dict)
        
        # Get the inserted document with _id
        saved_transcription = get_transcriptions_collection().find_one({"job_id": job_id})
        
        return TranscriptionResponse(**saved_transcription)
        
    except Exception as e:
        logger.error(f"Error starting transcription: {str(e)}")
        raise


def get_transcription_result(job_id: str, user_id: str) -> TranscriptionResponse:
    """
    Get the result of a transcription job.
    
    Args:
        job_id: The ID of the transcription job
        user_id: The ID of the user who started the job
        
    Returns:
        TranscriptionResponse object with transcription results
    """
    try:
        # Get job from database
        transcription = get_transcriptions_collection().find_one({
            "job_id": job_id,
            "user_id": ObjectId(user_id)
        })
        
        if not transcription:
            raise ValueError(f"Transcription job {job_id} not found")
        
        # For demo purposes, if job is in progress, simulate completion
        if transcription["status"] == "in_progress":
            # Simulate a completed transcription
            sample_transcript = (
                "The patient is a 45-year-old male with a history of hypertension "
                "and type 2 diabetes. He presents today with complaints of chest pain "
                "that started yesterday. The pain is described as pressure-like, "
                "radiating to the left arm, and is associated with shortness of breath. "
                "He rates the pain as 7 out of 10. No prior history of cardiac issues. "
                "Currently taking lisinopril and metformin."
            )
            
            segments = [
                TranscriptionSegment(
                    start_time=0.0,
                    end_time=5.2,
                    text="The patient is a 45-year-old male with a history of hypertension and type 2 diabetes.",
                    confidence=0.98,
                    speaker="clinician"
                ),
                TranscriptionSegment(
                    start_time=5.3,
                    end_time=10.1,
                    text="He presents today with complaints of chest pain that started yesterday.",
                    confidence=0.95,
                    speaker="clinician"
                ),
                TranscriptionSegment(
                    start_time=10.2,
                    end_time=15.8,
                    text="The pain is described as pressure-like, radiating to the left arm, and is associated with shortness of breath.",
                    confidence=0.97,
                    speaker="clinician"
                ),
                TranscriptionSegment(
                    start_time=16.0,
                    end_time=18.5,
                    text="He rates the pain as 7 out of 10.",
                    confidence=0.99,
                    speaker="clinician"
                ),
                TranscriptionSegment(
                    start_time=18.7,
                    end_time=22.3,
                    text="No prior history of cardiac issues.",
                    confidence=0.96,
                    speaker="clinician"
                ),
                TranscriptionSegment(
                    start_time=22.5,
                    end_time=25.1,
                    text="Currently taking lisinopril and metformin.",
                    confidence=0.98,
                    speaker="clinician"
                )
            ]
            
            # Update the transcription in the database
            get_transcriptions_collection().update_one(
                {"_id": transcription["_id"]},
                {
                    "$set": {
                        "status": "completed",
                        "transcript": sample_transcript,
                        "segments": [segment.dict() for segment in segments],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Get the updated transcription
            transcription = get_transcriptions_collection().find_one({"_id": transcription["_id"]})
        
        return TranscriptionResponse(**transcription)
        
    except Exception as e:
        logger.error(f"Error getting transcription result: {str(e)}")
        raise 