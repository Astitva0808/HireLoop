from typing import Optional

from pydantic import BaseModel


class InterviewCreate(BaseModel):
    application_id: str
    drive_id: str
    candidate_id: str

    scheduled_at: Optional[str] = None

    interview_type: str = "ai"
    status: str = "scheduled"

    session_id: Optional[str] = None


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[str] = None
    interview_type: Optional[str] = None
    status: Optional[str] = None
    session_id: Optional[str] = None
    overall_score: Optional[float] = None
    summary: Optional[str] = None


class Interview(BaseModel):
    id: str

    application_id: str
    drive_id: str
    candidate_id: str

    scheduled_at: Optional[str] = None

    interview_type: str
    status: str

    session_id: Optional[str] = None

    overall_score: Optional[float] = None
    summary: Optional[str] = None

    created_at: Optional[str] = None
    updated_at: Optional[str] = None