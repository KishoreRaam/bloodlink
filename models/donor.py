from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class DonorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=18, le=65)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    blood_group: str = Field(..., pattern=r"^(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)$")
    contact_number: str = Field(..., min_length=7, max_length=15)
    email: Optional[str] = None
    address: Optional[str] = None
    last_donated: Optional[date] = None


class DonorResponse(BaseModel):
    donor_id: int
    name: str
    age: int
    gender: str
    blood_group: str
    contact_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    availability_status: str
    last_donated: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AvailabilityUpdate(BaseModel):
    availability_status: str = Field(..., pattern="^(Available|Not Available)$")
