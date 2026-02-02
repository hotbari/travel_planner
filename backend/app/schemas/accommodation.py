from pydantic import BaseModel
from datetime import time, datetime
from typing import Optional


class AccommodationBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    google_place_id: Optional[str] = None
    check_in_time: time = time(15, 0)
    check_out_time: time = time(11, 0)
    notes: Optional[str] = None


class AccommodationCreate(AccommodationBase):
    trip_id: Optional[int] = None  # Will be set from URL param


class AccommodationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    check_in_time: Optional[time] = None
    check_out_time: Optional[time] = None
    notes: Optional[str] = None


class Accommodation(AccommodationBase):
    id: int
    trip_id: int
    created_at: datetime

    class Config:
        from_attributes = True
