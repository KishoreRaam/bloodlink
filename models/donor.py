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
    availability_status: Optional[str] = Field(None, pattern="^(Available|Not Available)$")
    last_donated: Optional[date] = None
    password: Optional[str] = Field(None, min_length=6)  # required for donor self-registration


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


class DonorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    age: Optional[int] = Field(None, ge=18, le=65)
    gender: Optional[str] = Field(None, pattern="^(Male|Female|Other)$")
    blood_group: Optional[str] = Field(None, pattern=r"^(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)$")
    contact_number: Optional[str] = Field(None, min_length=7, max_length=15)
    email: Optional[str] = None
    address: Optional[str] = None
    availability_status: Optional[str] = Field(None, pattern="^(Available|Not Available)$")


class DonorLogin(BaseModel):
    contact_number: str
    password: str


class DonorSession(BaseModel):
    donor_id: int
    name: str
    blood_group: str
    availability_status: str
