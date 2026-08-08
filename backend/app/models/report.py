from typing import Any, Optional

from pydantic import BaseModel


class ReportCreate(BaseModel):
    interview_id: str
    candidate_id: str
    drive_id: str

    overall_score: Optional[float] = None
    summary: str = ""
    strength: str = ""
    recommendations: str = ""

    skill_breakdown: Optional[Any] = None

    status: str = "completed"


class ReportUpdate(BaseModel):
    overall_score: Optional[float] = None
    summary: Optional[str] = None
    strength: Optional[str] = None
    recommendations: Optional[str] = None
    skill_breakdown: Optional[Any] = None
    status: Optional[str] = None


class Report(BaseModel):
    id: str

    interview_id: str
    candidate_id: str
    drive_id: str

    overall_score: Optional[float] = None
    summary: str = ""
    strength: str = ""
    recommendations: str = ""

    skill_breakdown: Optional[Any] = None

    status: str

    created_at: Optional[str] = None
    updated_at: Optional[str] = None