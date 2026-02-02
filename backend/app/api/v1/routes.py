from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Tuple
import asyncio

from app.services.osrm_service import osrm_service

router = APIRouter()


class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    destination_lat: float
    destination_lng: float
    mode: str = "walk"  # walk, transit, drive, bike


class RouteResponse(BaseModel):
    duration_seconds: int
    distance_meters: int
    geometry: Optional[dict] = None
    estimated: bool = False


class BatchRouteRequest(BaseModel):
    waypoints: List[Tuple[float, float]]  # List of (lat, lng)
    mode: str = "walk"


class BatchRouteResponse(BaseModel):
    routes: List[Optional[RouteResponse]]
    total_duration_seconds: int
    total_distance_meters: int


@router.post("/calculate", response_model=RouteResponse)
async def calculate_route(request: RouteRequest):
    """Calculate route between two points using OSRM."""
    origin = (request.origin_lat, request.origin_lng)
    destination = (request.destination_lat, request.destination_lng)

    result = await osrm_service.get_route(origin, destination, request.mode)

    if not result:
        # Fallback to distance-based estimation
        result = osrm_service.estimate_by_distance(origin, destination, request.mode)
        return RouteResponse(
            duration_seconds=result["duration_seconds"],
            distance_meters=result["distance_meters"],
            geometry=None,
            estimated=True
        )

    return RouteResponse(
        duration_seconds=result["duration_seconds"],
        distance_meters=result["distance_meters"],
        geometry=result.get("geometry"),
        estimated=False
    )


@router.post("/batch", response_model=BatchRouteResponse)
async def calculate_batch_routes(request: BatchRouteRequest):
    """Calculate routes between consecutive waypoints."""
    if len(request.waypoints) < 2:
        raise HTTPException(status_code=400, detail="At least 2 waypoints required")

    routes = await osrm_service.get_routes_batch(request.waypoints, request.mode)

    response_routes = []
    total_duration = 0
    total_distance = 0

    for i, route in enumerate(routes):
        if route:
            response_routes.append(RouteResponse(
                duration_seconds=route["duration_seconds"],
                distance_meters=route["distance_meters"],
                geometry=route.get("geometry"),
                estimated=False
            ))
            total_duration += route["duration_seconds"]
            total_distance += route["distance_meters"]
        else:
            # Fallback to estimation
            origin = request.waypoints[i]
            destination = request.waypoints[i + 1]
            estimated = osrm_service.estimate_by_distance(origin, destination, request.mode)
            response_routes.append(RouteResponse(
                duration_seconds=estimated["duration_seconds"],
                distance_meters=estimated["distance_meters"],
                geometry=None,
                estimated=True
            ))
            total_duration += estimated["duration_seconds"]
            total_distance += estimated["distance_meters"]

    return BatchRouteResponse(
        routes=response_routes,
        total_duration_seconds=total_duration,
        total_distance_meters=total_distance
    )
