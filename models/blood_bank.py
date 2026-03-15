from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class BloodBankCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    city: str = Field(..., min_length=1, max_length=100)
    contact_number: Optional[str] = Field(None, max_length=15)
    email: Optional[str] = None
    available_units: int = Field(..., ge=0)
    blood_group: str = Field(..., pattern=r"^(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)$")


class BloodBankResponse(BaseModel):
    bloodbank_id: int
    name: str
    city: str
    contact_number: Optional[str] = None
    email: Optional[str] = None
    available_units: int
    blood_group: str
    created_at: datetime

    class Config:
        from_attributes = True


class BloodBankUnitsUpdate(BaseModel):
    available_units: int = Field(..., ge=0)
