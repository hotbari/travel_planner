import httpx
from typing import Optional, List, Dict, Any, Tuple
from app.core.constants import TRANSPORT_MODES

# OSRM Demo Server (free, rate-limited)
OSRM_BASE_URL = "https://router.project-osrm.org"


class OSRMService:
    def __init__(self):
        self.base_url = OSRM_BASE_URL
        self.timeout = 10.0

    def _get_profile(self, mode: str) -> str:
        """Convert transport mode to OSRM profile."""
        osrm_mode = TRANSPORT_MODES.get(mode, "foot")
        # OSRM demo server supports: car, bike, foot
        if osrm_mode == "car":
            return "driving"
        elif osrm_mode == "bike":
            return "cycling"
        else:
            return "walking"

    async def get_route(
        self,
        origin: Tuple[float, float],  # (lat, lng)
        destination: Tuple[float, float],  # (lat, lng)
        mode: str = "walk"
    ) -> Optional[Dict[str, Any]]:
        """
        Get route between two points using OSRM.
        Returns duration, distance, and geometry.
        """
        profile = self._get_profile(mode)

        # OSRM uses lng,lat order (opposite of typical lat,lng)
        origin_str = f"{origin[1]},{origin[0]}"
        dest_str = f"{destination[1]},{destination[0]}"

        url = f"{self.base_url}/route/v1/{profile}/{origin_str};{dest_str}"
        params = {
            "overview": "full",
            "geometries": "geojson",
            "steps": "false"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("code") != "Ok" or not data.get("routes"):
                    return None

                route = data["routes"][0]
                return {
                    "duration_seconds": int(route["duration"]),
                    "distance_meters": int(route["distance"]),
                    "geometry": route["geometry"],  # GeoJSON LineString
                }
        except Exception as e:
            print(f"OSRM error: {e}")
            return None

    async def get_routes_batch(
        self,
        waypoints: List[Tuple[float, float]],  # List of (lat, lng)
        mode: str = "walk"
    ) -> List[Optional[Dict[str, Any]]]:
        """
        Get routes between consecutive waypoints.
        Returns list of routes.
        """
        if len(waypoints) < 2:
            return []

        routes = []
        for i in range(len(waypoints) - 1):
            route = await self.get_route(waypoints[i], waypoints[i + 1], mode)
            routes.append(route)

        return routes

    def estimate_by_distance(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        mode: str = "walk"
    ) -> Dict[str, Any]:
        """
        Fallback: Estimate travel time by straight-line distance.
        Used when OSRM is unavailable.
        """
        import math

        # Haversine formula for distance
        lat1, lng1 = origin
        lat2, lng2 = destination

        R = 6371000  # Earth's radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lng2 - lng1)

        a = math.sin(delta_phi / 2) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c

        # Estimate speed based on mode (m/s)
        speeds = {
            "walk": 1.4,  # ~5 km/h
            "transit": 8.3,  # ~30 km/h average
            "drive": 11.1,  # ~40 km/h average (city)
            "bike": 4.2,  # ~15 km/h
        }
        speed = speeds.get(mode, 1.4)

        # Add 20% for non-straight routes
        estimated_distance = distance * 1.2
        duration = estimated_distance / speed

        return {
            "duration_seconds": int(duration),
            "distance_meters": int(estimated_distance),
            "geometry": None,  # No geometry for estimates
            "estimated": True,
        }


# Singleton instance
osrm_service = OSRMService()
