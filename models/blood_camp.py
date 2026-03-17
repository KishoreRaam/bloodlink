import json
from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class BloodCampCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    organizer: Optional[str] = Field(None, max_length=150)
    camp_date: date
    start_time: Optional[str] = None    # HH:MM
    end_time: Optional[str] = None      # HH:MM
    venue: Optional[str] = None
    city: Optional[str] = None
    capacity: int = Field(default=100, ge=1, le=10000)
    blood_groups: List[str] = []
    description: Optional[str] = None
    status: str = Field(default="Upcoming", pattern="^(Upcoming|Active|Completed)$")


class BloodCampUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    organizer: Optional[str] = None
    camp_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1, le=10000)
    blood_groups: Optional[List[str]] = None
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(Upcoming|Active|Completed)$")


class BloodCampResponse(BaseModel):
    camp_id: int
    name: str
    organizer: Optional[str] = None
    camp_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    capacity: int
    blood_groups: List[str] = []
    description: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
