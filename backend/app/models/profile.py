from typing import Optional

from pydantic import BaseModel


class ProfileCreate(BaseModel):
    id: str
    role: str
    full_name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class Profile(ProfileCreate):
    created_at: Optional[str] = None
    updated_at: Optional[str] = None