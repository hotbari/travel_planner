from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class RouteRequest(BaseModel):
    origin: str  # place_id or "lat,lng"
    destination: str
    mode: str = "transit"  # driving, walking, transit, bicycling
    departure_time: Optional[datetime] = None


class RouteResponse(BaseModel):
    duration_seconds: int
    distance_meters: int
    polyline: str
    steps: Optional[List[Dict[str, Any]]] = None


class OptimizeRequest(BaseModel):
    origin: str
    destination: str
    waypoints: List[str]  # List of place_ids
    mode: str = "transit"


class OptimizeResponse(BaseModel):
    optimized_order: List[int]  # Indices of waypoints in optimized order
    total_duration_seconds: int
    legs: List[RouteResponse]
