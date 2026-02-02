from sqlalchemy import Column, Integer, String, Time, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer, nullable=False)  # 1, 2, 3, ...
    sequence_order = Column(Integer, nullable=False)  # Order within day

    # Type: 'accommodation_start', 'accommodation_end', 'place', 'travel'
    item_type = Column(String(50), nullable=False)

    # References
    place_id = Column(Integer, ForeignKey("places.id", ondelete="SET NULL"))
    accommodation_id = Column(Integer, ForeignKey("accommodations.id", ondelete="SET NULL"))

    # Scheduled times
    start_time = Column(Time, nullable=False)
    end_time = Column(Time)

    # For travel segments
    travel_mode = Column(String(20))  # 'driving', 'walking', 'transit', 'bicycling'
    travel_duration_minutes = Column(Integer)
    travel_distance_meters = Column(Integer)
    travel_polyline = Column(Text)  # Encoded polyline for map

    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    trip = relationship("Trip", back_populates="itinerary_items")
    place = relationship("Place")
    accommodation = relationship("Accommodation")
