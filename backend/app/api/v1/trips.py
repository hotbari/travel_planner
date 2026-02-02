from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.db.database import get_db
from app.models.trip import Trip as TripModel
from app.models.country import Country as CountryModel
from app.schemas.trip import Trip, TripCreate, TripUpdate, TripSummary

router = APIRouter()


@router.get("", response_model=List[Trip])
def get_trips(db: Session = Depends(get_db)):
    """List all trips."""
    trips = db.query(TripModel).options(joinedload(TripModel.country)).order_by(TripModel.start_date.desc()).all()
    return trips


@router.post("", response_model=Trip)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    """Create a new trip."""
    # Find country by code
    country = db.query(CountryModel).filter(CountryModel.code == trip.country_code.upper()).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")

    # Validate dates
    if trip.end_date < trip.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    db_trip = TripModel(
        name=trip.name,
        country_id=country.id,
        start_date=trip.start_date,
        end_date=trip.end_date,
        notes=trip.notes
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)

    # Load relationship
    db_trip.country = country
    return db_trip


@router.get("/{trip_id}", response_model=Trip)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get trip by ID."""
    trip = db.query(TripModel).options(joinedload(TripModel.country)).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.get("/{trip_id}/summary", response_model=TripSummary)
def get_trip_summary(trip_id: int, db: Session = Depends(get_db)):
    """Get trip with all related data."""
    trip = db.query(TripModel).options(
        joinedload(TripModel.country),
        joinedload(TripModel.accommodations),
        joinedload(TripModel.places)
    ).filter(TripModel.id == trip_id).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.put("/{trip_id}", response_model=Trip)
def update_trip(trip_id: int, trip_update: TripUpdate, db: Session = Depends(get_db)):
    """Update a trip."""
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    update_data = trip_update.model_dump(exclude_unset=True)

    # Validate dates if both are being updated
    start = update_data.get("start_date", trip.start_date)
    end = update_data.get("end_date", trip.end_date)
    if end < start:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    for field, value in update_data.items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    """Delete a trip."""
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted"}
