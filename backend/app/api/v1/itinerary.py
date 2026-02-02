from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import timedelta

from app.db.database import get_db
from app.models.itinerary import ItineraryItem as ItineraryItemModel
from app.models.trip import Trip as TripModel
from app.models.place import Place as PlaceModel
from app.models.accommodation import Accommodation as AccommodationModel
from app.schemas.itinerary import ItineraryItem, DaySchedule, ItineraryReorder, ItineraryMove
from app.services.google_maps import google_maps_service

router = APIRouter()


@router.get("/trips/{trip_id}/itinerary", response_model=List[DaySchedule])
def get_itinerary(trip_id: int, db: Session = Depends(get_db)):
    """Get full itinerary for a trip."""
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    items = db.query(ItineraryItemModel).options(
        joinedload(ItineraryItemModel.place),
        joinedload(ItineraryItemModel.accommodation)
    ).filter(
        ItineraryItemModel.trip_id == trip_id
    ).order_by(
        ItineraryItemModel.day_number,
        ItineraryItemModel.sequence_order
    ).all()

    # Group by day
    days = {}
    for item in items:
        if item.day_number not in days:
            day_date = trip.start_date + timedelta(days=item.day_number - 1)
            day_type = "middle"
            if item.day_number == 1:
                day_type = "arrival"
            elif item.day_number == trip.num_days:
                day_type = "departure"

            days[item.day_number] = DaySchedule(
                day_number=item.day_number,
                date=day_date,
                day_type=day_type,
                items=[]
            )
        days[item.day_number].items.append(item)

    # Ensure all days exist even if empty
    for day_num in range(1, trip.num_days + 1):
        if day_num not in days:
            day_date = trip.start_date + timedelta(days=day_num - 1)
            day_type = "middle"
            if day_num == 1:
                day_type = "arrival"
            elif day_num == trip.num_days:
                day_type = "departure"

            days[day_num] = DaySchedule(
                day_number=day_num,
                date=day_date,
                day_type=day_type,
                items=[]
            )

    return [days[k] for k in sorted(days.keys())]


@router.post("/trips/{trip_id}/itinerary/generate")
def generate_itinerary(trip_id: int, db: Session = Depends(get_db)):
    """Auto-generate itinerary from places."""
    trip = db.query(TripModel).options(
        joinedload(TripModel.places),
        joinedload(TripModel.accommodations)
    ).filter(TripModel.id == trip_id).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Clear existing itinerary
    db.query(ItineraryItemModel).filter(ItineraryItemModel.trip_id == trip_id).delete()

    places = list(trip.places)
    accommodation = trip.accommodations[0] if trip.accommodations else None
    num_days = trip.num_days

    # Distribute places across days
    places_per_day = len(places) // num_days if num_days > 0 else len(places)
    remaining_places = places[:]

    from datetime import time

    for day_num in range(1, num_days + 1):
        sequence = 0
        is_arrival = day_num == 1
        is_departure = day_num == num_days

        # Start with accommodation (except arrival day)
        if accommodation and not is_arrival:
            item = ItineraryItemModel(
                trip_id=trip_id,
                day_number=day_num,
                sequence_order=sequence,
                item_type="accommodation_start",
                accommodation_id=accommodation.id,
                start_time=accommodation.check_out_time or time(11, 0),
                end_time=accommodation.check_out_time or time(11, 0)
            )
            db.add(item)
            sequence += 1

        # Add places for this day
        day_places = remaining_places[:places_per_day + (1 if day_num <= len(places) % num_days else 0)]
        remaining_places = remaining_places[len(day_places):]

        current_time = time(12, 0) if is_arrival else time(11, 30)

        for place in day_places:
            # Add place
            duration_minutes = place.estimated_duration_minutes or 60
            end_hour = current_time.hour + (current_time.minute + duration_minutes) // 60
            end_minute = (current_time.minute + duration_minutes) % 60

            item = ItineraryItemModel(
                trip_id=trip_id,
                day_number=day_num,
                sequence_order=sequence,
                item_type="place",
                place_id=place.id,
                start_time=current_time,
                end_time=time(min(end_hour, 23), end_minute)
            )
            db.add(item)
            sequence += 1

            # Update current time
            current_time = time(min(end_hour + 1, 23), end_minute)  # Add buffer

        # End with accommodation (except departure day)
        if accommodation and not is_departure:
            item = ItineraryItemModel(
                trip_id=trip_id,
                day_number=day_num,
                sequence_order=sequence,
                item_type="accommodation_end",
                accommodation_id=accommodation.id,
                start_time=accommodation.check_in_time or time(15, 0),
                end_time=None
            )
            db.add(item)

    db.commit()
    return {"message": "Itinerary generated", "days": num_days}


@router.post("/reorder")
def reorder_itinerary(reorder: ItineraryReorder, db: Session = Depends(get_db)):
    """Reorder items within a day (drag-drop)."""
    # Verify all items exist
    items = db.query(ItineraryItemModel).filter(
        ItineraryItemModel.id.in_(reorder.item_ids),
        ItineraryItemModel.trip_id == reorder.trip_id,
        ItineraryItemModel.day_number == reorder.day_number
    ).all()

    if len(items) != len(reorder.item_ids):
        raise HTTPException(status_code=400, detail="Invalid item IDs")

    # Update sequence orders
    item_map = {item.id: item for item in items}
    for new_order, item_id in enumerate(reorder.item_ids):
        item_map[item_id].sequence_order = new_order

    db.commit()

    # TODO: Recalculate routes if requested
    if reorder.recalculate_routes:
        pass  # Will implement route recalculation

    return {"message": "Reordered successfully"}


@router.post("/move")
def move_item(move: ItineraryMove, db: Session = Depends(get_db)):
    """Move item between days."""
    item = db.query(ItineraryItemModel).filter(
        ItineraryItemModel.id == move.item_id,
        ItineraryItemModel.trip_id == move.trip_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Update item's day and sequence
    item.day_number = move.to_day
    item.sequence_order = move.new_sequence

    # Reorder items in the destination day
    other_items = db.query(ItineraryItemModel).filter(
        ItineraryItemModel.trip_id == move.trip_id,
        ItineraryItemModel.day_number == move.to_day,
        ItineraryItemModel.id != move.item_id
    ).order_by(ItineraryItemModel.sequence_order).all()

    for i, other in enumerate(other_items):
        if i >= move.new_sequence:
            other.sequence_order = i + 1
        else:
            other.sequence_order = i

    db.commit()

    return {"message": "Item moved successfully"}
