from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PlaceBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    estimated_duration_minutes: int = 60
    estimated_cost: float = 0
    business_hours: Optional[str] = None  # JSON string
    category: Optional[str] = None
    priority: int = 0
    notes: Optional[str] = None


class PlaceCreate(PlaceBase):
    trip_id: Optional[int] = None  # Will be set from URL param


class PlaceUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    estimated_cost: Optional[float] = None
    business_hours: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[int] = None
    notes: Optional[str] = None


class Place(PlaceBase):
    id: int
    trip_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
