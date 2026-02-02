from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

from app.schemas.country import Country
from app.schemas.accommodation import Accommodation
from app.schemas.place import Place


class TripBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    preferred_transport_mode: str = "transit"  # walk, transit, drive, bike
    notes: Optional[str] = None


class TripCreate(TripBase):
    country_code: str


class TripUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    preferred_transport_mode: Optional[str] = None
    notes: Optional[str] = None


class Trip(TripBase):
    id: int
    country_id: int
    num_nights: int
    num_days: int
    created_at: datetime
    updated_at: datetime
    country: Optional[Country] = None

    class Config:
        from_attributes = True


class TripSummary(Trip):
    accommodations: List[Accommodation] = []
    places: List[Place] = []
