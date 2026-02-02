from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.place import Place as PlaceModel
from app.models.trip import Trip as TripModel
from app.schemas.place import Place, PlaceCreate, PlaceUpdate, PlaceSearch
from app.services.google_maps import google_maps_service

router = APIRouter()


@router.get("/trips/{trip_id}/places", response_model=List[Place])
def get_places(trip_id: int, db: Session = Depends(get_db)):
    """List places for a trip."""
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return db.query(PlaceModel).filter(PlaceModel.trip_id == trip_id).order_by(PlaceModel.priority.desc()).all()


@router.post("/trips/{trip_id}/places", response_model=Place)
def create_place(trip_id: int, place: PlaceCreate, db: Session = Depends(get_db)):
    """Add place to a trip."""
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db_place = PlaceModel(
        trip_id=trip_id,
        **place.model_dump(exclude={"trip_id"})
    )
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place


@router.post("/search")
def search_places(search: PlaceSearch):
    """Search Google Places."""
    try:
        location = None
        if search.location:
            location = (search.location["lat"], search.location["lng"])

        results = google_maps_service.search_places(
            query=search.query,
            location=location,
            radius=search.radius
        )

        # Transform results for frontend
        return [
            {
                "place_id": r.get("place_id"),
                "name": r.get("name"),
                "address": r.get("formatted_address"),
                "latitude": r.get("geometry", {}).get("location", {}).get("lat"),
                "longitude": r.get("geometry", {}).get("location", {}).get("lng"),
                "types": r.get("types", []),
                "rating": r.get("rating"),
            }
            for r in results
        ]
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{place_id}", response_model=Place)
def get_place(place_id: int, db: Session = Depends(get_db)):
    """Get place by ID."""
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place


@router.put("/{place_id}", response_model=Place)
def update_place(place_id: int, place_update: PlaceUpdate, db: Session = Depends(get_db)):
    """Update place."""
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    update_data = place_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(place, field, value)

    db.commit()
    db.refresh(place)
    return place


@router.delete("/{place_id}")
def delete_place(place_id: int, db: Session = Depends(get_db)):
    """Delete place."""
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    db.delete(place)
    db.commit()
    return {"message": "Place deleted"}
