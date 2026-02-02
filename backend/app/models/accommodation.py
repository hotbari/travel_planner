from sqlalchemy import Column, Integer, String, Float, Time, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import time

from app.db.database import Base


class Accommodation(Base):
    __tablename__ = "accommodations"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    google_place_id = Column(String(200))
    check_in_time = Column(Time, default=time(15, 0))  # 15:00
    check_out_time = Column(Time, default=time(11, 0))  # 11:00
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    trip = relationship("Trip", back_populates="accommodations")
