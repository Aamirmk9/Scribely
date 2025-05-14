from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from models.user import PyObjectId


class TranscriptionRequest(BaseModel):
    specialty: str = "PRIMARY_CARE"  # Medical specialty for transcription
    language_code: str = "en-US"  # Language of the audio


class TranscriptionSegment(BaseModel):
    start_time: float
    end_time: float
    text: str
    speaker: Optional[str] = None
    confidence: float


class TranscriptionResponse(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    job_id: str
    user_id: PyObjectId
    status: str  # "in_progress", "completed", "failed"
    specialty: str
    language_code: str
    transcript: Optional[str] = None
    segments: Optional[List[TranscriptionSegment]] = []
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str} 