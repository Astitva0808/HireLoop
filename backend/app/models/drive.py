from typing import Optional

from pydantic import BaseModel


class DriveCreate(BaseModel):
    company_id: str
    title: str
    role: str
    description: str = ""
    skills: list[str] = []
    experience_level: str = ""
    location: str = ""

    status: str = "open"
    application_deadline: Optional[str] = None


class DriveUpdate(BaseModel):
    title: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[list[str]] = None
    experience_level: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    application_deadline: Optional[str] = None


class Drive(DriveCreate):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None