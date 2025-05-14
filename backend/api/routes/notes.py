from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List, Optional

from models.user import User
from models.note import ClinicalNote, GenerateNoteRequest, NoteResponse
from services.auth import get_current_active_user
from services.notes import generate_soap_note, get_notes, get_note_by_id, save_note

router = APIRouter()


@router.post("/generate", response_model=NoteResponse)
async def generate_note(
    request: GenerateNoteRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate a SOAP note using the NLP model based on transcription
    """
    try:
        note = generate_soap_note(
            transcription_id=request.transcription_id,
            user_id=current_user.id,
            patient_id=request.patient_id,
            specialty=request.specialty
        )
        return note
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate note: {str(e)}"
        )


@router.get("/", response_model=List[NoteResponse])
async def list_notes(
    patient_id: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    current_user: User = Depends(get_current_active_user)
):
    """
    List clinical notes, optionally filtered by patient
    """
    try:
        notes = get_notes(
            user_id=current_user.id,
            patient_id=patient_id,
            limit=limit,
            offset=offset
        )
        return notes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve notes: {str(e)}"
        )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific clinical note by ID
    """
    note = get_note_by_id(note_id, current_user.id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return note


@router.post("/save", response_model=NoteResponse)
async def save_clinical_note(
    note: ClinicalNote,
    current_user: User = Depends(get_current_active_user)
):
    """
    Save or update a clinical note
    """
    try:
        saved_note = save_note(note, current_user.id)
        return saved_note
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save note: {str(e)}"
        ) 