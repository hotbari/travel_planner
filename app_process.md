# Travel Planner App - Development Process

**Project Start Date**: 2026-02-02
**Last Updated**: 2026-02-02

---

## Current Phase: Phase 1 - Foundation

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation | 🔄 In Progress | 25% |
| Phase 2: Core Backend | ⏳ Pending | 0% |
| Phase 3: Frontend Foundation | ⏳ Pending | 0% |
| Phase 4: Map & Places | ⏳ Pending | 0% |
| Phase 5: Itinerary | ⏳ Pending | 0% |
| Phase 6: AI Integration | ⏳ Pending | 0% |
| Phase 7: Export & Polish | ⏳ Pending | 0% |

---

## Phase 1: Foundation

### Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Project structure setup | ✅ Done | Directories created |
| 1.2 | Docker Compose configuration | ✅ Done | Backend + Frontend services |
| 1.3 | SQLite database + models | 🔄 In Progress | Models created, need OSRM/AI updates |
| 1.4 | Basic FastAPI with health check | ✅ Done | Running on port 8000 |

### Files Created
- [x] `docker-compose.yml`
- [x] `.env.example`
- [x] `.gitignore`
- [x] `backend/Dockerfile`
- [x] `backend/requirements.txt`
- [x] `backend/app/main.py`
- [x] `backend/app/config.py`
- [x] `backend/app/db/database.py`
- [x] `backend/app/models/*.py`
- [x] `backend/app/schemas/*.py`
- [x] `frontend/Dockerfile`
- [x] `frontend/package.json`
- [x] `frontend/vite.config.ts`
- [x] `frontend/tailwind.config.js`

### Blockers
- None

---

## Phase 2: Core Backend

### Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Country API with greetings | ✅ Done | 20 countries with translations |
| 2.2 | Trip CRUD API | ✅ Done | Basic CRUD complete |
| 2.3 | Accommodation CRUD API | ✅ Done | Single per trip |
| 2.4 | Place CRUD API | ✅ Done | Manual entry support |
| 2.5 | OSRM routing service | ⏳ Pending | Replace Google Maps |
| 2.6 | OpenAI service wrapper | ⏳ Pending | GPT-4o-mini integration |

### Files to Create/Update
- [ ] `backend/app/services/osrm_service.py`
- [ ] `backend/app/services/openai_service.py`
- [ ] `backend/app/api/v1/ai.py`
- [ ] Update `backend/app/api/v1/routes.py` for OSRM
- [ ] Add `estimated_cost` field to Place model
- [ ] Add `preferred_transport_mode` to Trip model
- [ ] Add `name_ko` to Country model

### Blockers
- None

---

## Phase 3: Frontend Foundation

### Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | React + Vite + TypeScript setup | ✅ Done | Base setup complete |
| 3.2 | TailwindCSS + frost winter theme | 🔄 Partial | Need color update |
| 3.3 | i18n setup (Korean + English) | ⏳ Pending | With language persistence |
| 3.4 | Common hybrid modern-retro components | ⏳ Pending | Card, Button, Modal |
| 3.5 | Illustrated empty states | ⏳ Pending | |
| 3.6 | Greeting display with fade-in | ⏳ Pending | Framer Motion |
| 3.7 | Toast notifications | ⏳ Pending | For OSRM errors etc. |

### Files to Create/Update
- [ ] `frontend/src/styles/globals.css` - Frost winter theme
- [ ] `frontend/src/i18n/index.ts` - With localStorage persistence
- [ ] `frontend/src/i18n/en.json`
- [ ] `frontend/src/i18n/ko.json`
- [ ] `frontend/src/components/common/Card.tsx` - Hybrid pixel style
- [ ] `frontend/src/components/common/Button.tsx` - Hybrid pixel style
- [ ] `frontend/src/components/common/Toast.tsx`
- [ ] `frontend/src/components/trip/GreetingDisplay.tsx` - Fade-in animation
- [ ] `frontend/src/assets/illustrations/*.svg`

### Blockers
- None

---

## Phase 4: Map & Places

### Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Leaflet map integration | ⏳ Pending | Replace Google Maps |
| 4.2 | Click-to-add-place with confirm popup | ⏳ Pending | "Add place here?" popup |
| 4.3 | Place form modal | ⏳ Pending | |
| 4.4 | Place list display | ✅ Done | Needs expandable cards |
| 4.5 | Place templates (localStorage) | ⏳ Pending | Save/load templates |
| 4.6 | Business hours visual indicator | ⏳ Pending | Red/yellow/green badges |

### Files to Create/Update
- [ ] `frontend/src/components/map/LeafletMap.tsx`
- [ ] `frontend/src/components/map/ClickToPlace.tsx` - With confirm popup
- [ ] `frontend/src/components/map/RouteOverlay.tsx`
- [ ] `frontend/src/components/places/PlaceForm.tsx`
- [ ] `frontend/src/components/places/PlaceCard.tsx` - Expandable with cost
- [ ] `frontend/src/components/places/TemplateSelector.tsx`
- [ ] `frontend/src/stores/templateStore.ts` - localStorage persistence

### Blockers
- None

---

## Phase 5: Itinerary

### Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Vertical timeline component | ⏳ Pending | |
| 5.2 | Horizontal day tabs | ⏳ Pending | Tab navigation |
| 5.3 | Expandable place cards | ⏳ Pending | Name + time + cost default |
| 5.4 | Visual travel connectors | ⏳ Pending | Line + icon + time |
| 5.5 | Drag-and-drop with dnd-kit | ⏳ Pending | |
| 5.6 | Auto-recalculate times (sequential) | ⏳ Pending | On drag end |
| 5.7 | Route display on map | ⏳ Pending | |
| 5.8 | Business hours indicators | ⏳ Pending | 🟢🟡🔴 badges |

### Files to Create/Update
- [ ] `frontend/src/components/itinerary/Timeline.tsx`
- [ ] `frontend/src/components/itinerary/DayTabs.tsx`
- [ ] `frontend/src/components/itinerary/TimeSlot.tsx` - Expandable
- [ ] `frontend/src/components/itinerary/TravelConnector.tsx`
- [ ] `frontend/src/components/itinerary/BusinessHoursBadge.tsx`
- [ ] `frontend/src/stores/itineraryStore.ts` - With auto-recalc

### Blockers
- Requires OSRM service (Phase 2.5)

---

## Phase 6: AI Integration

### Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | OpenAI API integration | ⏳ Pending | GPT-4o-mini |
| 6.2 | AI mode selector | ⏳ Pending | Optimize-only vs Suggest+Optimize |
| 6.3 | AI suggestion preview panel | ⏳ Pending | With highlighted changes |
| 6.4 | Brief reasoning display | ⏳ Pending | One sentence summary |
| 6.5 | Apply/dismiss functionality | ⏳ Pending | |
| 6.6 | Smart scheduling (business hours) | ⏳ Pending | AI considers hours |

### Files to Create/Update
- [ ] `backend/app/services/openai_service.py` - With prompt template
- [ ] `backend/app/api/v1/ai.py`
- [ ] `frontend/src/components/itinerary/AIModeSelector.tsx`
- [ ] `frontend/src/components/itinerary/AISuggestion.tsx`
- [ ] `frontend/src/components/itinerary/SuggestionPreview.tsx`
- [ ] `frontend/src/components/itinerary/AIReasoning.tsx`

### Blockers
- Requires itinerary system (Phase 5)
- Requires OpenAI API key

---

## Phase 7: Export & Polish

### Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | PDF export (timeline visual style) | ⏳ Pending | Match app appearance |
| 7.2 | Animations and transitions | ⏳ Pending | Hybrid modern-retro |
| 7.3 | Error handling (OSRM fallback) | ⏳ Pending | Show error, continue |
| 7.4 | Final UI polish | ⏳ Pending | |

### Files to Create/Update
- [ ] `backend/app/services/pdf_service.py` - Timeline style
- [ ] `frontend/src/components/export/PDFPreview.tsx`
- [ ] `frontend/src/styles/animations.css`
- [ ] `frontend/src/hooks/useOSRMFallback.ts`

### Blockers
- Requires all previous phases

---

## Key Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-02 | Use OpenStreetMap + OSRM instead of Google Maps | Free, no API key needed for maps |
| 2026-02-02 | Single accommodation per trip | Simpler logic, covers 90% use cases |
| 2026-02-02 | Frost White + Deep Blue color scheme | Winter theme preference |
| 2026-02-02 | Hybrid modern-retro pixel art style | Clean base with pixel accents on interactive elements |
| 2026-02-02 | Korean + English i18n | User requirement |
| 2026-02-02 | GPT-4o-mini for AI | Cost-effective, fast |
| 2026-02-02 | Desktop only | Simpler development, better drag-drop UX |
| 2026-02-02 | Click on map with confirm popup | Clear user intent before opening form |
| 2026-02-02 | Sequential route processing | Simpler than async, acceptable performance |
| 2026-02-02 | Horizontal day tabs | One day visible at a time, cleaner UI |
| 2026-02-02 | Visual connector for travel | Line/arrow with icon, not full cards |
| 2026-02-02 | Business hours visual indicator | Red/yellow/green badges |
| 2026-02-02 | Place templates with full fields | Save all fields for reuse |
| 2026-02-02 | Configurable AI mode | User chooses optimize-only or suggest+optimize |
| 2026-02-02 | AI brief reasoning | One sentence summary, not per-place |
| 2026-02-02 | Default card shows name + time + cost | Most useful info at a glance |
| 2026-02-02 | Language-only persistence | Remember language in localStorage |
| 2026-02-02 | Greeting with fade-in animation | Simple but polished feel |
| 2026-02-02 | PDF matches app timeline style | Consistent visual experience |

---

## Technical Debt

| Item | Priority | Description |
|------|----------|-------------|
| Google Maps code cleanup | High | Remove unused Google Maps integration |
| Type definitions | Medium | Complete TypeScript types for all APIs |
| Test coverage | Low | Add unit tests for services |

---

## Notes

### Architecture Changes from Initial Plan
1. **Maps**: Google Maps → OpenStreetMap + Leaflet
2. **Routing**: Google Directions API → OSRM (free)
3. **Place Search**: Google Places → Manual entry + map click
4. **AI**: Added OpenAI for itinerary optimization

### Performance Considerations
- OSRM demo server is rate-limited; implement caching
- Debounce route calculations on drag
- Lazy load map tiles

### Accessibility
- Keyboard navigation for drag-drop
- ARIA labels for timeline elements
- High contrast text (frost white on deep blue)

---

## Commands

### Start Development
```bash
cd /Users/yeonsu/Desktop/project_2026/0202_trip_app
docker compose up
```

### Access App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Run Backend Tests
```bash
docker compose exec backend pytest
```

---

## Next Steps

1. ⬜ Update models for new fields (cost, transport mode, name_ko)
2. ⬜ Create OSRM service
3. ⬜ Create OpenAI service
4. ⬜ Update frontend theme to winter colors
5. ⬜ Set up i18n
