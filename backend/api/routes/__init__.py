from fastapi import APIRouter
from api.routes import auth, users, transcribe, notes

# Initialize all routers
auth_router = auth.router
users_router = users.router
transcribe_router = transcribe.router
notes_router = notes.router 