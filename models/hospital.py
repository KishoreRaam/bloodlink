from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class HospitalCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    city: str = Field(..., min_length=1, max_length=100)
    contact_number: Optional[str] = Field(None, max_length=15)
    email: Optional[str] = None
    address: Optional[str] = None


class HospitalResponse(BaseModel):
    hospital_id: int
    name: str
    city: str
    contact_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
