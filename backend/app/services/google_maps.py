import googlemaps
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple

from app.config import settings


class GoogleMapsService:
    def __init__(self):
        self.client = None
        if settings.google_maps_api_key:
            self.client = googlemaps.Client(key=settings.google_maps_api_key)

    def _ensure_client(self):
        if not self.client:
            raise ValueError("Google Maps API key not configured")

    def search_places(
        self,
        query: str,
        location: Optional[Tuple[float, float]] = None,
        radius: int = 50000
    ) -> List[Dict[str, Any]]:
        """Search for places using text query."""
        self._ensure_client()
        result = self.client.places(
            query=query,
            location=location,
            radius=radius
        )
        return result.get("results", [])

    def get_place_details(self, place_id: str) -> Dict[str, Any]:
        """Get detailed information about a place."""
        self._ensure_client()
        result = self.client.place(
            place_id=place_id,
            fields=[
                "name", "formatted_address", "geometry",
                "opening_hours", "types", "photos"
            ]
        )
        return result.get("result", {})

    def autocomplete(
        self,
        input_text: str,
        location: Optional[Tuple[float, float]] = None,
        radius: int = 50000
    ) -> List[Dict[str, Any]]:
        """Get place autocomplete suggestions."""
        self._ensure_client()
        result = self.client.places_autocomplete(
            input_text=input_text,
            location=location,
            radius=radius
        )
        return result

    def get_directions(
        self,
        origin: str,
        destination: str,
        mode: str = "transit",
        departure_time: Optional[datetime] = None
    ) -> Optional[Dict[str, Any]]:
        """Get directions between two points."""
        self._ensure_client()

        # Format place IDs if needed
        if not "," in origin and not origin.startswith("place_id:"):
            origin = f"place_id:{origin}"
        if not "," in destination and not destination.startswith("place_id:"):
            destination = f"place_id:{destination}"

        result = self.client.directions(
            origin=origin,
            destination=destination,
            mode=mode,
            departure_time=departure_time or datetime.now(),
            alternatives=False
        )

        if result:
            route = result[0]
            leg = route["legs"][0]
            return {
                "duration_seconds": leg["duration"]["value"],
                "distance_meters": leg["distance"]["value"],
                "polyline": route["overview_polyline"]["points"],
                "steps": leg["steps"]
            }
        return None

    def optimize_route(
        self,
        origin: str,
        destination: str,
        waypoints: List[str],
        mode: str = "transit"
    ) -> Optional[Dict[str, Any]]:
        """Get optimized route order using waypoint optimization."""
        self._ensure_client()

        # Format place IDs
        formatted_waypoints = [
            f"place_id:{wp}" if not wp.startswith("place_id:") else wp
            for wp in waypoints
        ]

        result = self.client.directions(
            origin=f"place_id:{origin}" if not origin.startswith("place_id:") else origin,
            destination=f"place_id:{destination}" if not destination.startswith("place_id:") else destination,
            waypoints=formatted_waypoints,
            optimize_waypoints=True,
            mode=mode
        )

        if result:
            route = result[0]
            legs = []
            for leg in route["legs"]:
                legs.append({
                    "duration_seconds": leg["duration"]["value"],
                    "distance_meters": leg["distance"]["value"],
                    "polyline": leg.get("overview_polyline", {}).get("points", ""),
                    "steps": leg["steps"]
                })

            return {
                "optimized_order": route.get("waypoint_order", []),
                "total_duration_seconds": sum(
                    leg["duration"]["value"] for leg in route["legs"]
                ),
                "legs": legs
            }
        return None


# Singleton instance
google_maps_service = GoogleMapsService()
