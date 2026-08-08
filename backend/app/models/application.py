from typing import Optional

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    drive_id: str


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None


class Application(BaseModel):
    id: str

    drive_id: str
    candidate_id: str

    status: str

    created_at: Optional[str] = None
    updated_at: Optional[str] = None