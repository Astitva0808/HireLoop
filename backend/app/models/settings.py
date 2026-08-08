from typing import Optional

from pydantic import BaseModel


class SettingsCreate(BaseModel):
    company_id: str

    email_notifications: bool = True
    interview_notifications: bool = True
    application_notifications: bool = True

    default_interview_type: str = "technical"

    default_interview_duration: int = 30

    auto_generate_reports: bool = True

    candidate_visibility: str = "full"

    timezone: str = "Asia/Kolkata"


class SettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    interview_notifications: Optional[bool] = None
    application_notifications: Optional[bool] = None

    default_interview_type: Optional[str] = None

    default_interview_duration: Optional[int] = None

    auto_generate_reports: Optional[bool] = None

    candidate_visibility: Optional[str] = None

    timezone: Optional[str] = None


class Settings(SettingsCreate):
    id: str