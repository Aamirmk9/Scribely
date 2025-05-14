import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import transcribe, notes, auth, users
from core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load NLP models, establish connections
    print("Starting up the application...")
    yield
    # Shutdown: Release resources
    print("Shutting down the application...")

app = FastAPI(
    title="Scribely API",
    description="AI-powered clinical documentation assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(transcribe.router, prefix="/api/transcribe", tags=["Transcription"])
app.include_router(notes.router, prefix="/api/notes", tags=["Clinical Notes"])

@app.get("/")
async def root():
    return {"message": "Welcome to Scribely API! Visit /docs for API documentation."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 