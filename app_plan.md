# Travel Planner App - Implementation Plan (Revised)

A personal travel planner with FastAPI backend, Docker deployment, and Steam indie game-inspired UI with pixel art touches.

---

## Key Design Decisions (From Interview)

| Topic | Decision |
|-------|----------|
| **Maps API** | OpenStreetMap + OSRM (free, no Google) |
| **AI Optimization** | OpenAI GPT-4o-mini for itinerary suggestions |
| **Place Entry** | Manual entry + click on map for coordinates |
| **Accommodation** | Single per trip (simpler) |
| **Scheduling** | Smart suggestions (auto-adjust to business hours) |
| **Transport** | All modes equal (user chooses) |
| **Map View** | Always visible (split view with itinerary) |
| **Theme** | Dark mode only |
| **Responsiveness** | Desktop only |
| **Animations** | Moderate with pixel art touches |
| **Colors** | Frost White + Deep Blue (winter palette) |
| **Languages** | Korean + English (i18n) |
| **Export** | PDF itinerary (timeline visual style) |
| **Budget** | Simple cost notes per place |
| **AI Output** | Show as suggestion with brief reasoning |
| **AI Mode** | Configurable: optimize only OR suggest + optimize |
| **Drag Behavior** | Auto-recalculate times |
| **Place Display** | Expandable cards (Name + time + cost default) |
| **Timeline** | Vertical timeline with horizontal day tabs |
| **Travel Display** | Visual connector (line/arrow with icon + time) |
| **Business Hours** | Visual indicator (red/yellow/green) |
| **Empty States** | Illustrated with messages |
| **Sounds** | None |
| **Route Processing** | Sequential (simpler) |
| **OSRM Fallback** | Show error, continue without routes |
| **Map Click** | "Add place here?" confirm popup |
| **Place Templates** | Full template save (all fields) |
| **Greeting Animation** | Fade in |
| **Pixel Style** | Hybrid modern-retro |
| **Persistence** | Language only |

---

## Tech Stack (Updated)

| Layer | Technology |
|-------|------------|
| Backend | FastAPI + SQLite + SQLAlchemy |
| Frontend | React 19 + Vite + TypeScript |
| Styling | TailwindCSS + CSS custom properties |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Animations | Framer Motion |
| State | Zustand |
| Maps | **Leaflet + OpenStreetMap** (free) |
| Routing | **OSRM API** (free) |
| AI | **OpenAI GPT-4o-mini** |
| i18n | react-i18next |
| PDF | jsPDF + html2canvas |
| Deployment | Docker Compose |

---

## Color Palette (Frost Winter Theme)

```css
/* Primary backgrounds */
--bg-primary: #0f172a;      /* Deep night blue */
--bg-secondary: #1e293b;    /* Evening slate */
--bg-card: #1e3a5f;         /* Card background */

/* Accent colors */
--accent-primary: #0ea5e9;   /* Sky blue */
--accent-secondary: #38bdf8; /* Light ice blue */
--accent-highlight: #f0f9ff; /* Frost white */

/* Text */
--text-primary: #f0f9ff;     /* Frost white */
--text-secondary: #94a3b8;   /* Muted slate */
--text-muted: #64748b;       /* Dark muted */

/* Pixel accents */
--pixel-glow: #7dd3fc;       /* Ice glow */
--pixel-border: #38bdf8;     /* Pixel border */
```

---

## Project Structure (Updated)

```
0202_trip_app/
├── docker-compose.yml
├── .env.example
├── app_plan.md
├── app_process.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/v1/
│   │   │   ├── trips.py
│   │   │   ├── places.py
│   │   │   ├── itinerary.py
│   │   │   ├── routes.py          # OSRM integration
│   │   │   ├── countries.py
│   │   │   └── ai.py              # OpenAI integration
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── osrm_service.py    # Free routing
│   │   │   ├── nominatim.py       # Free geocoding (backup)
│   │   │   ├── openai_service.py  # AI optimization
│   │   │   ├── itinerary_service.py
│   │   │   └── pdf_service.py     # PDF export
│   │   └── db/
│   └── tests/
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Button, Card, Modal, PixelBorder
│   │   │   ├── trip/          # CountrySelector, DatePicker, GreetingDisplay
│   │   │   ├── places/        # PlaceForm, PlaceCard, PlaceList
│   │   │   ├── itinerary/     # Timeline, DayColumn, TimeSlot, AISuggestion
│   │   │   └── map/           # LeafletMap, RouteOverlay, ClickToPlace
│   │   ├── stores/            # Zustand stores
│   │   ├── hooks/
│   │   ├── services/          # API clients
│   │   ├── i18n/              # Korean + English translations
│   │   │   ├── ko.json
│   │   │   └── en.json
│   │   ├── styles/
│   │   └── assets/
│   │       └── illustrations/ # Empty state illustrations
│   └── public/
│       └── textures/          # Pixel patterns
│
└── data/
    └── travel_planner.db
```

---

## Database Schema (Updated)

### Core Tables

**countries** - Greeting data by country
- `id`, `code` (ISO), `name`, `name_ko`, `local_name`, `greeting`, `timezone`

**trips** - Travel plans
- `id`, `name`, `country_id`, `start_date`, `end_date`
- `preferred_transport_mode` (walk/transit/drive/bike)
- Computed: `num_nights`, `num_days`

**accommodations** - Single hotel per trip
- `id`, `trip_id`, `name`, `latitude`, `longitude`
- `check_in_time` (default 15:00), `check_out_time` (default 11:00)
- `notes`

**places** - Points of interest
- `id`, `trip_id`, `name`, `latitude`, `longitude`
- `estimated_duration_minutes`, `business_hours` (JSON)
- `category`, `notes`
- **`estimated_cost`** (optional cost field)

**itinerary_items** - Scheduled activities
- `id`, `trip_id`, `day_number`, `sequence_order`
- `item_type`: 'accommodation_start' | 'accommodation_end' | 'place' | 'travel'
- `start_time`, `end_time`
- Travel: `travel_mode`, `travel_duration_minutes`, `travel_distance_meters`

**ai_suggestions** - Stored AI recommendations
- `id`, `trip_id`, `suggestion_json`, `reasoning`, `created_at`, `applied`

**place_templates** - Reusable place templates (stored in localStorage on frontend)
- `id`, `name`, `default_duration_minutes`, `category`
- `business_hours_template` (JSON), `default_cost`, `notes_template`

---

## API Endpoints (Updated)

### Countries
- `GET /api/v1/countries` - List all with greetings
- `GET /api/v1/countries/{code}/greeting` - Get greeting

### Trips
- `GET /api/v1/trips` - List trips
- `POST /api/v1/trips` - Create trip
- `GET /api/v1/trips/{id}` - Get trip details
- `PUT /api/v1/trips/{id}` - Update trip
- `DELETE /api/v1/trips/{id}` - Delete trip
- **`GET /api/v1/trips/{id}/export/pdf`** - Export as PDF

### Places
- `GET /api/v1/trips/{trip_id}/places` - List places
- `POST /api/v1/trips/{trip_id}/places` - Add place (with lat/lng from map click)
- `PUT /api/v1/places/{id}` - Update place
- `DELETE /api/v1/places/{id}` - Delete place

### Itinerary
- `GET /api/v1/trips/{trip_id}/itinerary` - Get full itinerary
- `POST /api/v1/trips/{trip_id}/itinerary/generate` - Basic algorithm generation
- `POST /api/v1/itinerary/reorder` - Reorder + auto-recalculate times
- `POST /api/v1/itinerary/move` - Move between days

### Routes (OSRM)
- `POST /api/v1/routes/calculate` - Calculate route via OSRM
- `POST /api/v1/routes/batch` - Calculate multiple routes

### AI (OpenAI)
- **`POST /api/v1/ai/optimize`** - Get AI-generated itinerary suggestion
- **`POST /api/v1/ai/apply`** - Apply AI suggestion to trip

---

## External APIs (All Free)

| Service | API | Usage |
|---------|-----|-------|
| Map Display | OpenStreetMap tiles | Leaflet renders free tiles |
| Routing | OSRM Demo Server | `router.project-osrm.org` (free, rate-limited) |
| Geocoding (backup) | Nominatim | Free address lookup |
| AI | OpenAI | GPT-4o-mini (~$0.15/1M tokens) |

### OSRM API Example
```
GET https://router.project-osrm.org/route/v1/driving/
    {lng1},{lat1};{lng2},{lat2}
    ?overview=full&geometries=geojson
```

---

## Key Features Implementation

### 1. Map Click to Add Place
```
User clicks on Leaflet map
→ Get lat/lng from click event
→ Show "Add place here?" popup at click position
→ User clicks "Yes" → Place form modal opens with coordinates
→ User enters name, duration, business hours, cost
→ Save place to database
→ Marker appears on map
```

### 1b. Place Templates
```
User can save frequently used place types as templates:
- Name (e.g., "Lunch Break")
- Default duration (e.g., 60 min)
- Category (e.g., "Restaurant")
- Business hours template
- Default cost estimate
- Notes template

When adding new place, user can select a template to pre-fill fields.
Templates stored in localStorage (persists across sessions).
```

### 2. AI Itinerary Optimization
```
User selects AI mode:
┌─────────────────────────────────────┐
│ ○ Optimize order only               │
│   (Reorder existing places)         │
│                                     │
│ ○ Suggest + optimize                │
│   (Add recommendations + reorder)   │
└─────────────────────────────────────┘

User clicks "Get AI Suggestion"
→ Send places, accommodation, dates, mode to OpenAI
→ GPT-4o-mini generates optimized itinerary
→ Returns brief reasoning summary:
  "Grouped Shibuya area in morning, museum in afternoon
   to avoid crowds. Added lunch break near Harajuku."
→ Display as preview panel with changes highlighted
→ User clicks "Apply" or "Dismiss"
→ If applied, update itinerary + recalculate routes
```

### AI Prompt Template
```
You are a travel planner assistant. The user is visiting {country}
from {start_date} to {end_date} ({num_days} days).

Accommodation: {hotel_name} at ({lat}, {lng})
Check-in: {check_in_time}, Check-out: {check_out_time}

Places to visit:
{places_list with business hours}

Mode: {optimize_only | suggest_and_optimize}

Create an optimized itinerary considering:
- Minimize travel time between places
- Respect business hours
- Group nearby locations
- Include reasonable meal/rest times
- Arrival day: activities end at hotel
- Departure day: activities start from hotel

Return JSON with:
- optimized_order: [place_ids in order]
- suggested_places: [] (if mode is suggest_and_optimize)
- reasoning: "Brief 1-2 sentence summary"
```

### 3. Vertical Timeline View (Horizontal Day Tabs)
```
┌─────────────────────────────────────────┐
│ [Day 1] [Day 2] [Day 3] [Day 4]  ← Tabs │
├─────────────────────────────────────────┤
│ April 1, 2026 (Arrival Day)             │
├─────────────────────────────────────────┤
│                                         │
│  14:00 ──●── Shibuya Crossing          │
│          │   90 min | ¥0        [🟢]   │
│          │   ▾ (expand for details)    │
│          │                              │
│          ↓ 🚶 15 min walk               │
│          │                              │
│  15:45 ──●── Harajuku                  │
│          │   60 min | ¥500      [🟡]   │
│          │                              │
│          ↓ 🚃 25 min transit            │
│          │                              │
│  17:10 ──●── 🏨 Hotel Check-in         │
│                                         │
└─────────────────────────────────────────┘

[🟢] = Within business hours
[🟡] = Near closing time
[🔴] = Outside business hours
```

### 3b. Travel Connector Style
```
Visual connector between places:
- Thin vertical line with dashed pixel pattern
- Transport icon (🚶/🚃/🚗/🚴) inline
- Duration text next to icon
- Clickable to see route details on map
```

### 4. Auto-Recalculate on Drag
```
User drags place to new position
→ Optimistic UI update (immediate visual feedback)
→ Background: Call OSRM for new route segments
→ Background: Recalculate all times for the day
→ Update timeline with new times
→ If OSRM fails: Show error toast, keep visual order
```

### 5. Split View Layout
```
┌─────────────────────────────────────────────────────┐
│ Header: Trip Name | Country Greeting | Export PDF   │
├───────────────────────┬─────────────────────────────┤
│                       │                             │
│  Itinerary Timeline   │      Leaflet Map           │
│  (Vertical, draggable)│   (Interactive, clickable) │
│                       │                             │
│  [Day 1] [Day 2] ...  │   Routes + Place markers   │
│                       │                             │
└───────────────────────┴─────────────────────────────┘
```

---

## Internationalization (i18n)

### Korean + English Support

**File structure:**
```
src/i18n/
├── index.ts       # i18next config
├── en.json        # English translations
└── ko.json        # Korean translations
```

**Sample translations:**
```json
// en.json
{
  "trip": {
    "create": "Create Trip",
    "delete": "Delete Trip",
    "export": "Export PDF"
  },
  "itinerary": {
    "generate": "Generate Itinerary",
    "aiSuggest": "Get AI Suggestion",
    "apply": "Apply",
    "dismiss": "Dismiss"
  }
}

// ko.json
{
  "trip": {
    "create": "여행 만들기",
    "delete": "여행 삭제",
    "export": "PDF 내보내기"
  },
  "itinerary": {
    "generate": "일정 생성",
    "aiSuggest": "AI 추천 받기",
    "apply": "적용",
    "dismiss": "취소"
  }
}
```

---

## Visual Design (Pixel Art Winter Theme)

### Pixel Art Elements
- **Borders**: 2px solid with slight pixel-stepping effect
- **Icons**: Custom 16x16 pixel icons for key actions
- **Buttons**: Slight bevel effect, pixel-perfect corners
- **Loading**: Pixel-style progress bar (stepped animation)
- **Empty states**: Pixel art illustrations

### Card Component Example
```css
.card-pixel {
  background: var(--bg-card);
  border: 2px solid var(--pixel-border);
  border-radius: 4px;
  box-shadow:
    4px 4px 0 var(--bg-primary),
    inset 1px 1px 0 rgba(255,255,255,0.1);
  image-rendering: pixelated;
}

.card-pixel:hover {
  box-shadow:
    4px 4px 0 var(--bg-primary),
    0 0 20px var(--pixel-glow);
}
```

### Timeline Styling
```css
.timeline-track {
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--pixel-border) 50%,
    transparent 50%
  );
  background-size: 2px 8px; /* Dashed pixel effect */
}
```

---

## Implementation Order (Revised)

### Phase 1: Foundation
1. [ ] Project structure setup
2. [ ] Docker Compose configuration
3. [ ] SQLite database + models
4. [ ] Basic FastAPI with health check

### Phase 2: Core Backend
5. [ ] Country API with greetings
6. [ ] Trip CRUD API
7. [ ] Accommodation CRUD API
8. [ ] Place CRUD API
9. [ ] OSRM routing service
10. [ ] OpenAI service wrapper

### Phase 3: Frontend Foundation
11. [ ] React + Vite + TypeScript setup
12. [ ] TailwindCSS + winter theme
13. [ ] i18n setup (Korean + English)
14. [ ] Common pixel-art components
15. [ ] Illustrated empty states

### Phase 4: Map & Places
16. [ ] Leaflet map integration
17. [ ] Click-to-add-place functionality
18. [ ] Place form modal
19. [ ] Place list display

### Phase 5: Itinerary
20. [ ] Vertical timeline component
21. [ ] Day columns
22. [ ] Drag-and-drop with dnd-kit
23. [ ] Auto-recalculate times
24. [ ] Route display on map

### Phase 6: AI Integration
25. [ ] OpenAI API integration
26. [ ] AI suggestion preview panel
27. [ ] Apply/dismiss functionality
28. [ ] Smart scheduling (business hours)

### Phase 7: Export & Polish
29. [ ] PDF export functionality
30. [ ] Animations and transitions
31. [ ] Error handling + toasts
32. [ ] Final UI polish

---

## Environment Variables

```env
# .env
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=sqlite:///./data/travel_planner.db
ENVIRONMENT=development
DEFAULT_LANGUAGE=ko
```

---

## Dependencies (Updated)

### Backend (requirements.txt)
```
fastapi==0.109.2
uvicorn[standard]==0.27.1
sqlalchemy==2.0.25
alembic==1.13.1
pydantic==2.6.1
pydantic-settings==2.1.0
python-dateutil==2.8.2
httpx==0.26.0
openai==1.12.0
reportlab==4.1.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "framer-motion": "^11.0.3",
    "zustand": "^4.5.0",
    "react-i18next": "^14.0.5",
    "i18next": "^23.10.0",
    "date-fns": "^3.3.1",
    "axios": "^1.6.7",
    "lucide-react": "^0.323.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1"
  }
}
```

---

## Verification & Testing

### Backend Testing
```bash
docker compose exec backend pytest
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/countries
```

### Frontend Testing
```bash
docker compose up
# Access at http://localhost:5173
```

### End-to-End Flow
1. Select language (Korean/English)
2. Create trip → See greeting in local language
3. Click map to add places
4. Click "Get AI Suggestion" → Review preview
5. Apply AI suggestion
6. Drag-drop to adjust order → Times auto-update
7. Export PDF
8. Verify routes display on map
