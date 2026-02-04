from fastapi import APIRouter

from app.api.v1 import countries, trips, places, accommodations, itinerary, routes, ai

api_router = APIRouter()

api_router.include_router(countries.router, prefix="/countries", tags=["countries"])
api_router.include_router(trips.router, prefix="/trips", tags=["trips"])
api_router.include_router(places.router, prefix="/places", tags=["places"])
api_router.include_router(accommodations.router, prefix="/accommodations", tags=["accommodations"])
api_router.include_router(itinerary.router, prefix="/itinerary", tags=["itinerary"])
api_router.include_router(routes.router, prefix="/routes", tags=["routes"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
