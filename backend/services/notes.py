import logging
from datetime import datetime
from bson import ObjectId
from typing import Dict, Any, List, Optional

from models.note import ClinicalNote, NoteResponse
from services.database import get_notes_collection, get_transcriptions_collection
from nlp.soap import extract_soap_sections

# Set up logging
logger = logging.getLogger(__name__)


def generate_soap_note(
    transcription_id: str,
    user_id: str,
    patient_id: Optional[str] = None,
    specialty: str = "PRIMARY_CARE"
) -> NoteResponse:
    """
    Generate a SOAP note from a transcription using NLP.
    
    Args:
        transcription_id: The ID of the transcription
        user_id: The ID of the user
        patient_id: Optional patient ID
        specialty: Medical specialty
        
    Returns:
        NoteResponse object with the generated SOAP note
    """
    try:
        # Get transcription from database
        transcription = get_transcriptions_collection().find_one({
            "_id": ObjectId(transcription_id),
            "user_id": ObjectId(user_id)
        })
        
        if not transcription:
            raise ValueError(f"Transcription {transcription_id} not found")
        
        if transcription["status"] != "completed":
            raise ValueError(f"Transcription {transcription_id} is not complete")
        
        # Extract SOAP sections using NLP
        transcript_text = transcription["transcript"]
        soap_sections = extract_soap_sections(transcript_text, specialty)
        
        # Create note
        note = ClinicalNote(
            user_id=ObjectId(user_id),
            patient_id=patient_id,
            transcription_id=ObjectId(transcription_id),
            subjective=soap_sections["subjective"],
            objective=soap_sections["objective"],
            assessment=soap_sections["assessment"],
            plan=soap_sections["plan"],
            specialty=specialty,
            status="draft",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save to database
        note_dict = note.dict(by_alias=True)
        result = get_notes_collection().insert_one(note_dict)
        
        # Get the saved note with _id
        saved_note = get_notes_collection().find_one({"_id": result.inserted_id})
        
        # Create response with confidence score and analysis
        response = NoteResponse(
            **saved_note,
            confidence_score=0.85,  # Demo confidence score
            analysis={
                "medical_concepts": ["hypertension", "diabetes", "chest pain"],
                "medications": ["lisinopril", "metformin"],
                "diagnoses": ["chest pain", "hypertension", "diabetes mellitus type 2"],
                "procedures": []
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating SOAP note: {str(e)}")
        raise


def get_notes(
    user_id: str,
    patient_id: Optional[str] = None,
    limit: int = 10,
    offset: int = 0
) -> List[NoteResponse]:
    """
    Get clinical notes for a user, optionally filtered by patient.
    
    Args:
        user_id: The ID of the user
        patient_id: Optional patient ID to filter by
        limit: Maximum number of notes to return
        offset: Number of notes to skip
        
    Returns:
        List of NoteResponse objects
    """
    try:
        # Build query
        query = {"user_id": ObjectId(user_id)}
        if patient_id:
            query["patient_id"] = patient_id
        
        # Get notes from database
        notes_cursor = get_notes_collection().find(query).skip(offset).limit(limit).sort("created_at", -1)
        
        # Convert to NoteResponse objects
        notes = [NoteResponse(**note) for note in notes_cursor]
        
        return notes
        
    except Exception as e:
        logger.error(f"Error getting notes: {str(e)}")
        raise


def get_note_by_id(note_id: str, user_id: str) -> Optional[NoteResponse]:
    """
    Get a specific clinical note by ID.
    
    Args:
        note_id: The ID of the note
        user_id: The ID of the user
        
    Returns:
        NoteResponse object if found, None otherwise
    """
    try:
        # Get note from database
        note = get_notes_collection().find_one({
            "_id": ObjectId(note_id),
            "user_id": ObjectId(user_id)
        })
        
        if not note:
            return None
        
        # Additional analysis for the response
        analysis = {
            "medical_concepts": ["hypertension", "diabetes", "chest pain"],
            "medications": ["lisinopril", "metformin"],
            "diagnoses": ["chest pain", "hypertension", "diabetes mellitus type 2"],
            "procedures": []
        }
        
        return NoteResponse(**note, confidence_score=0.85, analysis=analysis)
        
    except Exception as e:
        logger.error(f"Error getting note: {str(e)}")
        raise


def save_note(note: ClinicalNote, user_id: str) -> NoteResponse:
    """
    Save or update a clinical note.
    
    Args:
        note: The note to save
        user_id: The ID of the user
        
    Returns:
        NoteResponse object with the saved note
    """
    try:
        # Ensure note belongs to user
        if str(note.user_id) != user_id:
            raise ValueError("Cannot save note for another user")
        
        # Update timestamps
        note.updated_at = datetime.utcnow()
        
        # Convert to dict
        note_dict = note.dict(by_alias=True, exclude={"id"})
        
        if not note.id:  # New note
            result = get_notes_collection().insert_one(note_dict)
            saved_id = result.inserted_id
        else:  # Update existing note
            result = get_notes_collection().update_one(
                {"_id": ObjectId(note.id)},
                {"$set": note_dict}
            )
            saved_id = ObjectId(note.id)
        
        # Get the saved note
        saved_note = get_notes_collection().find_one({"_id": saved_id})
        
        # Additional analysis for response
        analysis = {
            "medical_concepts": ["hypertension", "diabetes", "chest pain"],
            "medications": ["lisinopril", "metformin"],
            "diagnoses": ["chest pain", "hypertension", "diabetes mellitus type 2"],
            "procedures": []
        }
        
        return NoteResponse(**saved_note, confidence_score=0.85, analysis=analysis)
        
    except Exception as e:
        logger.error(f"Error saving note: {str(e)}")
        raise 