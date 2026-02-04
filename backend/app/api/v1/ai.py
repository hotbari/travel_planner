from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.db.database import get_db
from app.models.trip import Trip as TripModel
from app.models.place import Place as PlaceModel
from app.models.accommodation import Accommodation as AccommodationModel
from app.models.itinerary import ItineraryItem as ItineraryItemModel
from app.services.openai_service import openai_service
from app.middleware.rate_limiter import limiter

router = APIRouter()


class OptimizeRequest(BaseModel):
    trip_id: int
    mode: str = "optimize_only"  # "optimize_only" or "suggest_and_optimize"


class SuggestedPlace(BaseModel):
    name: str
    latitude: float
    longitude: float
    estimated_duration_minutes: int
    reason: str


class OptimizeResponse(BaseModel):
    optimized_order: List[int]
    suggested_places: List[SuggestedPlace]
    day_assignments: Dict[str, List[int]]
    reasoning: str
    error: bool = False


class ApplyRequest(BaseModel):
    trip_id: int
    optimized_order: List[int]
    day_assignments: Optional[Dict[str, List[int]]] = None
    accepted_suggestions: Optional[List[Dict[str, Any]]] = None  # List of suggested places to add


@router.post("/optimize", response_model=OptimizeResponse)
@limiter.limit("5/minute")
async def optimize_itinerary(request: OptimizeRequest, db: Session = Depends(get_db)):
    """Get AI-generated itinerary optimization suggestion."""

    # Load trip with related data
    trip = db.query(TripModel).options(
        joinedload(TripModel.country),
        joinedload(TripModel.places),
        joinedload(TripModel.accommodations)
    ).filter(TripModel.id == request.trip_id).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if not trip.places:
        raise HTTPException(status_code=400, detail="No places to optimize")

    # Prepare data for AI
    places_data = [
        {
            "id": p.id,
            "name": p.name,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "estimated_duration_minutes": p.estimated_duration_minutes,
            "business_hours": p.business_hours,
            "category": p.category,
        }
        for p in trip.places
    ]

    accommodation_data = None
    if trip.accommodations:
        acc = trip.accommodations[0]
        accommodation_data = {
            "name": acc.name,
            "latitude": acc.latitude,
            "longitude": acc.longitude,
            "check_in_time": str(acc.check_in_time) if acc.check_in_time else "15:00",
            "check_out_time": str(acc.check_out_time) if acc.check_out_time else "11:00",
        }

    # Call AI service
    result = await openai_service.optimize_itinerary(
        country=trip.country.name if trip.country else "Unknown",
        start_date=str(trip.start_date),
        end_date=str(trip.end_date),
        num_days=trip.num_days,
        accommodation=accommodation_data,
        places=places_data,
        mode=request.mode,
        preferred_transport=trip.preferred_transport_mode or "walk"
    )

    # Convert suggested places to proper format
    suggested = []
    for sp in result.get("suggested_places", []):
        if isinstance(sp, dict):
            suggested.append(SuggestedPlace(
                name=sp.get("name", ""),
                latitude=sp.get("latitude", 0),
                longitude=sp.get("longitude", 0),
                estimated_duration_minutes=sp.get("estimated_duration_minutes", 60),
                reason=sp.get("reason", "")
            ))

    return OptimizeResponse(
        optimized_order=result.get("optimized_order", []),
        suggested_places=suggested,
        day_assignments=result.get("day_assignments", {}),
        reasoning=result.get("reasoning", ""),
        error=result.get("error", False)
    )


@router.post("/apply")
async def apply_optimization(request: ApplyRequest, db: Session = Depends(get_db)):
    """Apply AI optimization to trip's itinerary."""

    trip = db.query(TripModel).filter(TripModel.id == request.trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    added_place_ids = []

    # Step 1: Create places from accepted_suggestions
    if request.accepted_suggestions:
        for suggestion in request.accepted_suggestions:
            # Validate suggestion has required fields
            if not all(k in suggestion for k in ["name", "latitude", "longitude"]):
                raise HTTPException(
                    status_code=400,
                    detail="Each suggestion must have name, latitude, and longitude"
                )

            # Create new place
            new_place = PlaceModel(
                trip_id=request.trip_id,
                name=suggestion["name"],
                latitude=suggestion["latitude"],
                longitude=suggestion["longitude"],
                estimated_duration_minutes=suggestion.get("estimated_duration_minutes", 60),
                category=suggestion.get("category", "attraction"),
                notes=f"AI suggested: {suggestion.get('reason', '')}"
            )
            db.add(new_place)
            db.flush()  # Get the ID
            added_place_ids.append(new_place.id)

    # Step 2: Validate all place_ids exist (both optimized_order and added places)
    all_place_ids = set(request.optimized_order)
    for place_id in all_place_ids:
        place = db.query(PlaceModel).filter(
            PlaceModel.id == place_id,
            PlaceModel.trip_id == request.trip_id
        ).first()
        if not place:
            raise HTTPException(
                status_code=400,
                detail=f"Place {place_id} not found in trip"
            )

    # Step 3: Update place priorities based on optimized order
    for index, place_id in enumerate(request.optimized_order):
        place = db.query(PlaceModel).filter(
            PlaceModel.id == place_id,
            PlaceModel.trip_id == request.trip_id
        ).first()
        if place:
            place.priority = len(request.optimized_order) - index  # Higher priority first

    # Step 4: Handle day_assignments - create or update itinerary items
    if request.day_assignments:
        for day_str, place_ids in request.day_assignments.items():
            day_number = int(day_str)

            for seq_order, place_id in enumerate(place_ids):
                # Find existing itinerary item for this place and trip
                item = db.query(ItineraryItemModel).filter(
                    ItineraryItemModel.trip_id == request.trip_id,
                    ItineraryItemModel.place_id == place_id
                ).first()

                if item:
                    # Update existing item
                    item.day_number = day_number
                    item.sequence_order = seq_order
                else:
                    # Create new itinerary item
                    # For now, use placeholder times - frontend should update these
                    from datetime import time
                    start_time = time(9, 0)  # Default 9:00 AM start

                    new_item = ItineraryItemModel(
                        trip_id=request.trip_id,
                        place_id=place_id,
                        day_number=day_number,
                        sequence_order=seq_order,
                        item_type='place',
                        start_time=start_time
                    )
                    db.add(new_item)

    db.commit()

    return {
        "message": "Optimization applied successfully",
        "optimized_count": len(request.optimized_order),
        "added_places": added_place_ids,
        "day_assignments_applied": bool(request.day_assignments)
    }
