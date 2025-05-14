from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from models.user import PyObjectId


class GenerateNoteRequest(BaseModel):
    transcription_id: PyObjectId
    patient_id: Optional[str] = None
    specialty: Optional[str] = "PRIMARY_CARE"


class ClinicalNote(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    patient_id: Optional[str] = None
    transcription_id: PyObjectId
    
    # SOAP sections
    subjective: str
    objective: str
    assessment: str
    plan: str
    
    # Additional fields
    status: str = "draft"  # "draft", "finalized", "signed"
    specialty: str = "PRIMARY_CARE"
    tags: List[str] = []
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class NoteResponse(ClinicalNote):
    confidence_score: Optional[float] = None
    analysis: Optional[Dict[str, Any]] = None 