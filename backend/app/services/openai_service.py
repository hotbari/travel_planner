import json
from typing import Optional, List, Dict, Any
from openai import OpenAI
from app.config import settings


class OpenAIService:
    def __init__(self):
        self.client = None
        if settings.openai_api_key:
            self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = "gpt-4o-mini"

    def _ensure_client(self):
        if not self.client:
            raise ValueError("OpenAI API key not configured")

    async def optimize_itinerary(
        self,
        country: str,
        start_date: str,
        end_date: str,
        num_days: int,
        accommodation: Optional[Dict[str, Any]],
        places: List[Dict[str, Any]],
        mode: str = "optimize_only",  # "optimize_only" or "suggest_and_optimize"
        preferred_transport: str = "walk"
    ) -> Dict[str, Any]:
        """
        Use GPT-4o-mini to optimize the itinerary.

        Args:
            mode: "optimize_only" - just reorder existing places
                  "suggest_and_optimize" - add recommendations + reorder

        Returns:
            {
                "optimized_order": [place_ids in optimized order],
                "suggested_places": [new place suggestions if mode is suggest_and_optimize],
                "day_assignments": {1: [place_ids], 2: [place_ids], ...},
                "reasoning": "Brief explanation"
            }
        """
        self._ensure_client()

        # Build places description
        places_desc = []
        for p in places:
            hours_info = ""
            if p.get("business_hours"):
                hours_info = f", Business hours: {p['business_hours']}"
            places_desc.append(
                f"- ID {p['id']}: {p['name']} at ({p['latitude']}, {p['longitude']}), "
                f"Duration: {p['estimated_duration_minutes']} min{hours_info}"
            )

        accommodation_desc = "No accommodation specified"
        if accommodation:
            accommodation_desc = (
                f"Accommodation: {accommodation['name']} at "
                f"({accommodation['latitude']}, {accommodation['longitude']})\n"
                f"Check-in: {accommodation.get('check_in_time', '15:00')}, "
                f"Check-out: {accommodation.get('check_out_time', '11:00')}"
            )

        mode_instruction = ""
        if mode == "suggest_and_optimize":
            mode_instruction = """
Additionally, suggest 2-3 places that would complement the existing list.
Include suggested_places in your response with name, estimated coordinates, duration, and why you recommend it.
"""
        else:
            mode_instruction = """
Only reorder existing places. Do NOT suggest new places.
Leave suggested_places as an empty array.
"""

        prompt = f"""You are a travel planner assistant. The user is visiting {country}
from {start_date} to {end_date} ({num_days} days).

{accommodation_desc}

Places to visit:
{chr(10).join(places_desc)}

Preferred transport mode: {preferred_transport}

{mode_instruction}

Create an optimized itinerary considering:
- Minimize travel time between places (group nearby locations)
- Respect business hours when provided
- Include reasonable meal/rest times (suggest meal breaks if gaps are too long)
- Arrival day (Day 1): Start activities after likely arrival, end at accommodation
- Departure day (Day {num_days}): Start from accommodation, finish activities early

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{{
    "optimized_order": [list of place IDs in optimized visiting order],
    "suggested_places": [
        {{"name": "Place Name", "latitude": 0.0, "longitude": 0.0, "estimated_duration_minutes": 60, "reason": "why recommended"}}
    ],
    "day_assignments": {{
        "1": [list of place IDs for day 1],
        "2": [list of place IDs for day 2]
    }},
    "reasoning": "Brief 1-2 sentence summary of optimization strategy"
}}
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful travel planning assistant. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )

            content = response.choices[0].message.content.strip()

            # Try to parse JSON
            # Handle potential markdown code blocks
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()

            result = json.loads(content)
            return result

        except json.JSONDecodeError as e:
            return {
                "optimized_order": [p["id"] for p in places],
                "suggested_places": [],
                "day_assignments": {},
                "reasoning": f"Failed to parse AI response: {str(e)}",
                "error": True
            }
        except Exception as e:
            return {
                "optimized_order": [p["id"] for p in places],
                "suggested_places": [],
                "day_assignments": {},
                "reasoning": f"AI optimization failed: {str(e)}",
                "error": True
            }


# Singleton instance
openai_service = OpenAIService()
