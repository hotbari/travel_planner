from pydantic import BaseModel
from datetime import time, date, datetime
from typing import Optional, List, Literal

from app.schemas.place import Place
from app.schemas.accommodation import Accommodation


class ItineraryItemBase(BaseModel):
    day_number: int
    sequence_order: int
    item_type: Literal["accommodation_start", "accommodation_end", "place", "travel"]
    start_time: time
    end_time: Optional[time] = None
    notes: Optional[str] = None


class ItineraryItemCreate(ItineraryItemBase):
    trip_id: int
    place_id: Optional[int] = None
    accommodation_id: Optional[int] = None
    travel_mode: Optional[str] = None
    travel_duration_minutes: Optional[int] = None
    travel_distance_meters: Optional[int] = None
    travel_polyline: Optional[str] = None


class ItineraryItem(ItineraryItemBase):
    id: int
    trip_id: int
    place_id: Optional[int] = None
    accommodation_id: Optional[int] = None
    travel_mode: Optional[str] = None
    travel_duration_minutes: Optional[int] = None
    travel_distance_meters: Optional[int] = None
    travel_polyline: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Populated relations
    place: Optional[Place] = None
    accommodation: Optional[Accommodation] = None

    class Config:
        from_attributes = True


class DaySchedule(BaseModel):
    day_number: int
    date: date
    day_type: Literal["arrival", "middle", "departure"]
    items: List[ItineraryItem]


class ItineraryReorder(BaseModel):
    trip_id: int
    day_number: int
    item_ids: List[int]  # New order
    recalculate_routes: bool = True


class ItineraryMove(BaseModel):
    trip_id: int
    item_id: int
    from_day: int
    to_day: int
    new_sequence: int
    recalculate_routes: bool = True
