from typing import Optional

from pydantic import BaseModel


class CandidateCreate(BaseModel):
    user_id: str
    name: str
    email: str

    branch: str = ""
    skills: list[str] = []

    resume_url: Optional[str] = None


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    branch: Optional[str] = None
    skills: Optional[list[str]] = None
    resume_url: Optional[str] = None


class Candidate(CandidateCreate):
    id: str

    created_at: Optional[str] = None
    updated_at: Optional[str] = None