from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    preferred_transport_mode = Column(String(20), default="transit")  # walk, transit, drive, bike
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    country = relationship("Country")
    accommodations = relationship("Accommodation", back_populates="trip", cascade="all, delete-orphan")
    places = relationship("Place", back_populates="trip", cascade="all, delete-orphan")
    itinerary_items = relationship("ItineraryItem", back_populates="trip", cascade="all, delete-orphan")

    @property
    def num_nights(self) -> int:
        return (self.end_date - self.start_date).days

    @property
    def num_days(self) -> int:
        return self.num_nights + 1
