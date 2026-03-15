from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class PatientRequestCreate(BaseModel):
    patient_name: str = Field(..., min_length=1, max_length=100)
    blood_group: str = Field(..., pattern=r"^(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)$")
    quantity_needed: int = Field(..., gt=0)
    hospital_id: int


class PatientRequestResponse(BaseModel):
    request_id: int
    patient_name: str
    blood_group: str
    quantity_needed: int
    hospital_id: int
    status: str
    request_date: datetime
    hospital_name: Optional[str] = None

    class Config:
        from_attributes = True


class FulfillRequest(BaseModel):
    bank_id: int
