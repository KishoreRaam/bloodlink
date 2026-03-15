from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class DonationCreate(BaseModel):
    donor_id: int
    bloodbank_id: int
    donation_date: date
    quantity_donated: int = Field(..., gt=0)
    notes: Optional[str] = None


class DonationResponse(BaseModel):
    donation_id: int
    donor_id: int
    bloodbank_id: int
    donation_date: date
    quantity_donated: int
    notes: Optional[str] = None
    created_at: datetime
    donor_name: Optional[str] = None
    blood_bank_name: Optional[str] = None

    class Config:
        from_attributes = True
