from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.accommodation import Accommodation as AccommodationModel
from app.models.trip import Trip as TripModel
from app.schemas.accommodation import Accommodation, AccommodationCreate, AccommodationUpdate

router = APIRouter()


@router.get("/trips/{trip_id}/accommodations", response_model=List[Accommodation])
def get_accommodations(trip_id: int, db: Session = Depends(get_db)):
    """List accommodations for a trip."""
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return db.query(AccommodationModel).filter(AccommodationModel.trip_id == trip_id).all()


@router.post("/trips/{trip_id}/accommodations", response_model=Accommodation)
def create_accommodation(trip_id: int, accommodation: AccommodationCreate, db: Session = Depends(get_db)):
    """Add accommodation to a trip."""
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db_accommodation = AccommodationModel(
        trip_id=trip_id,
        **accommodation.model_dump(exclude={"trip_id"})
    )
    db.add(db_accommodation)
    db.commit()
    db.refresh(db_accommodation)
    return db_accommodation


@router.get("/{accommodation_id}", response_model=Accommodation)
def get_accommodation(accommodation_id: int, db: Session = Depends(get_db)):
    """Get accommodation by ID."""
    accommodation = db.query(AccommodationModel).filter(AccommodationModel.id == accommodation_id).first()
    if not accommodation:
        raise HTTPException(status_code=404, detail="Accommodation not found")
    return accommodation


@router.put("/{accommodation_id}", response_model=Accommodation)
def update_accommodation(accommodation_id: int, accommodation_update: AccommodationUpdate, db: Session = Depends(get_db)):
    """Update accommodation."""
    accommodation = db.query(AccommodationModel).filter(AccommodationModel.id == accommodation_id).first()
    if not accommodation:
        raise HTTPException(status_code=404, detail="Accommodation not found")

    update_data = accommodation_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(accommodation, field, value)

    db.commit()
    db.refresh(accommodation)
    return accommodation


@router.delete("/{accommodation_id}")
def delete_accommodation(accommodation_id: int, db: Session = Depends(get_db)):
    """Delete accommodation."""
    accommodation = db.query(AccommodationModel).filter(AccommodationModel.id == accommodation_id).first()
    if not accommodation:
        raise HTTPException(status_code=404, detail="Accommodation not found")

    db.delete(accommodation)
    db.commit()
    return {"message": "Accommodation deleted"}
