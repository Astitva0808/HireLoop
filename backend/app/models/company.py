from typing import Optional

from pydantic import BaseModel


class CompanyCreate(BaseModel):
    owner_id: str

    name: str
    email: str

    website: str = ""
    industry: str = ""
    description: str = ""

    location: str = ""

    company_size: str = ""

    logo_url: str = ""


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

    website: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None

    location: Optional[str] = None

    company_size: Optional[str] = None

    logo_url: Optional[str] = None


class Company(CompanyCreate):
    id: str