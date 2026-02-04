from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
import json


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

    @field_validator('business_hours')
    @classmethod
    def validate_business_hours(cls, v):
        if v is None:
            return None
        try:
            data = json.loads(v)
            valid_days = {'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'}
            for day, hours in data.items():
                if day not in valid_days:
                    raise ValueError(f'Invalid day: {day}')
                if hours is not None:
                    if 'open' not in hours or 'close' not in hours:
                        raise ValueError(f'Missing open/close for {day}')
            return v
        except json.JSONDecodeError:
            raise ValueError('business_hours must be valid JSON')


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


class PlaceSearch(BaseModel):
    """Schema for searching places via Google Maps API."""
    query: str
    location: Optional[dict] = None  # {"lat": float, "lng": float}
    radius: Optional[int] = 5000  # meters
