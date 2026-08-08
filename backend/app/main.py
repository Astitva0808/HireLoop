from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.interview import router as interview_router

app = FastAPI(
    title="HireLoop AI Interviewer",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    interview_router,
    prefix="/api",
    tags=["Interview"]
)

@app.get("/")
def root():
    return {
        "status": "running",
        "service": "HireLoop AI Interviewer"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
    