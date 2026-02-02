from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func

from app.db.database import Base


class RouteCache(Base):
    __tablename__ = "route_cache"

    id = Column(Integer, primary_key=True, index=True)
    origin_place_id = Column(String(200), nullable=False)
    destination_place_id = Column(String(200), nullable=False)
    travel_mode = Column(String(20), nullable=False)
    departure_time = Column(String(50))  # ISO datetime or null

    duration_seconds = Column(Integer, nullable=False)
    distance_meters = Column(Integer, nullable=False)
    polyline = Column(Text, nullable=False)
    steps_json = Column(Text)  # Detailed directions as JSON

    cached_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime)
