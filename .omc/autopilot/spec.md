# Phase 6: AI Integration - Implementation Specification

**Project**: Travel Planner App
**Phase**: 6 - AI Integration
**Date**: 2026-02-04
**Status**: Ready for Implementation

---

## Executive Summary

This specification covers the implementation of AI-powered itinerary optimization for the Travel Planner app. Phase 6 builds on the completed Phases 1-5 (Foundation, Backend, Frontend, Map & Places, Itinerary) to add intelligent trip planning capabilities powered by OpenAI GPT-4o-mini.

### Critical Issues Identified

1. **API Path Mismatch**: Backend `/ai/optimize` vs Frontend `/ai/trips/{id}/optimize` (BLOCKING)
2. **Missing Router Registration**: AI endpoints exist but are not registered in main router
3. **Incomplete Persistence**: `/apply` endpoint accepts `day_assignments` but doesn't save them
4. **Type Mismatches**: Frontend and backend have different `OptimizeResult` structures
5. **Undefined business_hours Format**: No standard format or validation

---

## Requirements Analysis

### Functional Requirements

1. **AI Mode Selection**
   - User can choose between two optimization modes:
     - "Optimize Only": Reorder existing places for efficiency
     - "Suggest + Optimize": Add AI-recommended places AND optimize order
   - Mode selection persists in localStorage

2. **Optimization Trigger**
   - "Get AI Suggestion" button triggers optimization
   - Loading state shows while AI processes (2-5 seconds expected)
   - Error states handled gracefully with user-friendly messages

3. **Preview Panel**
   - Side panel displays proposed changes
   - Visual diff shows:
     - Original order vs optimized order
     - Day assignments for each place
     - Suggested new places (if mode = "suggest_and_optimize")
   - Brief reasoning summary (1-2 sentences) from AI

4. **Apply/Dismiss Actions**
   - User can accept all changes (Apply button)
   - User can reject changes (Dismiss button)
   - User can selectively accept suggested places
   - Applying updates itinerary immediately with optimistic UI

5. **Smart Scheduling**
   - AI considers business hours when scheduling
   - Validates proposed times fall within operating hours
   - Respects accommodation check-in/check-out times

### Non-Functional Requirements

1. **Performance**
   - AI optimization completes within 10 seconds
   - UI remains responsive during processing
   - Rate limited to 5 requests/minute per IP

2. **Security**
   - OpenAI API key stored securely in backend env
   - Input validation prevents injection attacks
   - Rate limiting prevents abuse

3. **UX**
   - Clear loading indicators
   - Informative error messages
   - Keyboard accessible controls
   - No full-page reloads

4. **Reliability**
   - Graceful degradation if OpenAI unavailable
   - Validation of AI responses before applying
   - Undo capability or confirmation before applying

### Implicit Requirements

1. **business_hours Standardization**
   - Define JSON format: `{"mon": {"open": "09:00", "close": "18:00"}, ...}`
   - Add frontend validation
   - Update AI prompt to parse structured format

2. **Suggested Places Handling**
   - Backend returns suggested places with coordinates
   - Frontend allows selective addition
   - New endpoint to convert suggestions to real places

3. **Concurrent Request Handling**
   - Block multiple simultaneous optimization requests
   - Cancel in-flight request if new one triggered

4. **Timezone Awareness**
   - Business hours compared in trip's timezone
   - Arrival/departure times adjusted for local time

### Out of Scope

1. **Per-place AI reasoning** - Only trip-level summary
2. **Natural language customization** - No freeform instructions to AI
3. **Real-time re-optimization on drag** - Manual trigger only
4. **AI-suggested edits to existing places** - Suggestions are new places only
5. **Multi-trip optimization** - Single trip at a time

---

## Technical Specification

### Tech Stack Additions

#### Backend Dependencies

```txt
slowapi==0.1.9        # Rate limiting for FastAPI
```

#### Frontend Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x"  // Optional: Better async state management
  }
}
```

*Note: Zustand is sufficient; React Query is optional enhancement*

---

### API Contract

#### 1. Register AI Router

**File**: `backend/app/api/v1/router.py`

```python
from app.api.v1 import ai

api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
```

#### 2. POST `/api/v1/ai/optimize`

**Request**:
```typescript
interface OptimizeRequest {
  trip_id: number;
  mode: 'optimize_only' | 'suggest_and_optimize';
}
```

**Response** (200 OK):
```typescript
interface OptimizeResponse {
  optimized_order: number[];                    // Place IDs in new sequence
  suggested_places: SuggestedPlace[];           // AI recommendations
  day_assignments: Record<string, number[]>;    // {"1": [1,2], "2": [3,4]}
  reasoning: string;                            // AI explanation
  error: boolean;                               // True if AI failed
}

interface SuggestedPlace {
  name: string;
  latitude: number;
  longitude: number;
  estimated_duration_minutes: number;
  reason: string;
  category?: string;
  business_hours?: BusinessHours;
}
```

**Error Responses**:
- `404`: Trip not found
- `400`: No places to optimize
- `429`: Rate limit exceeded (include `retry_after` in body)
- `503`: OpenAI service unavailable

#### 3. POST `/api/v1/ai/apply`

**Request**:
```typescript
interface ApplyRequest {
  trip_id: number;
  optimized_order: number[];
  day_assignments: Record<string, number[]>;
  accepted_suggestions?: number[];  // Indices of suggestions to add
}
```

**Response** (200 OK):
```typescript
interface ApplyResponse {
  message: string;
  optimized_count: number;
  added_places: number[];  // IDs of newly created places
}
```

---

### Frontend API Updates

**File**: `frontend/src/services/api.ts`

**Changes**:
1. Fix endpoint paths (remove trip ID from URL)
2. Update OptimizeResult type to match backend
3. Add error handling for rate limiting

```typescript
// BEFORE (WRONG):
async optimizeItinerary(tripId: number, mode: string): Promise<OptimizeResult> {
  const { data } = await client.post(`/ai/trips/${tripId}/optimize`, { mode });
  return data;
}

// AFTER (CORRECT):
async optimizeItinerary(tripId: number, mode: 'optimize_only' | 'suggest_and_optimize'): Promise<OptimizeResponse> {
  const { data } = await client.post('/ai/optimize', {
    trip_id: tripId,
    mode
  });
  return data;
}

async applyOptimization(tripId: number, optimizedOrder: number[], dayAssignments: Record<string, number[]>, acceptedSuggestions?: number[]): Promise<ApplyResponse> {
  const { data } = await client.post('/ai/apply', {
    trip_id: tripId,
    optimized_order: optimizedOrder,
    day_assignments: dayAssignments,
    accepted_suggestions: acceptedSuggestions
  });
  return data;
}
```

---

### Backend Updates

#### 1. Fix `/apply` Endpoint

**File**: `backend/app/api/v1/ai.py` (lines 117-139)

**Current Issue**: `day_assignments` parameter accepted but not persisted

**Fix**: Update itinerary_items with day_number based on day_assignments

```python
@router.post("/apply", response_model=Dict[str, Any])
async def apply_optimization(
    request: ApplyOptimizationRequest,
    db: Session = Depends(get_db)
):
    # ... existing validation ...

    # NEW: Update day assignments
    for day_str, place_ids in request.day_assignments.items():
        day_number = int(day_str)
        for seq, place_id in enumerate(place_ids):
            # Find or create itinerary_item for this place
            item = db.query(ItineraryItem).filter(
                ItineraryItem.trip_id == request.trip_id,
                ItineraryItem.place_id == place_id
            ).first()

            if item:
                item.day_number = day_number
                item.sequence_order = seq
            # ... continue with time calculations

    # ... rest of existing code
```

#### 2. Add Rate Limiting

**New File**: `backend/app/middleware/rate_limiter.py`

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

**Update**: `backend/app/api/v1/ai.py`

```python
from app.middleware.rate_limiter import limiter

@router.post("/optimize")
@limiter.limit("5/minute")
async def optimize_itinerary(...):
    # ... existing code
```

#### 3. business_hours Validation

**File**: `backend/app/schemas/place.py`

```python
from pydantic import field_validator
import json

class PlaceBase(BaseModel):
    business_hours: Optional[str] = None

    @field_validator('business_hours')
    @classmethod
    def validate_business_hours(cls, v):
        if v is None:
            return None
        try:
            data = json.loads(v)
            valid_days = {'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'}
            for day, hours in data.items():
                if day not in valid_days:
                    raise ValueError(f'Invalid day: {day}')
                if hours is not None and ('open' not in hours or 'close' not in hours):
                    raise ValueError(f'Missing open/close for {day}')
            return v
        except json.JSONDecodeError:
            raise ValueError('business_hours must be valid JSON')
```

#### 4. Improve OpenAI Service

**File**: `backend/app/services/openai_service.py`

**Add helper method**:

```python
def _format_business_hours(self, hours_json: Optional[str]) -> str:
    """Parse and format business hours for AI prompt"""
    if not hours_json:
        return "Hours unknown"
    try:
        hours = json.loads(hours_json)
        parts = []
        for day in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']:
            if day in hours and hours[day]:
                parts.append(f"{day.capitalize()}: {hours[day]['open']}-{hours[day]['close']}")
        return ", ".join(parts) if parts else "Hours unknown"
    except:
        return hours_json  # Fallback to raw string
```

---

### Frontend Architecture

#### Component Hierarchy

```
TripPage
├── ItineraryBoard (existing)
│   ├── DayColumn (existing)
│   └── AIPreviewPanel (NEW - conditional)
│       ├── AIPreviewDiff
│       └── ActionButtons (Apply/Cancel)
└── AIControls (NEW - sidebar/floating)
    ├── AIModeSelector
    ├── AIOptimizeButton
    └── AISuggestionList
        └── AISuggestionCard (per suggestion)
```

#### New Files Structure

```
frontend/src/
├── components/
│   └── ai/
│       ├── AIModeSelector.tsx
│       ├── AIOptimizeButton.tsx
│       ├── AISuggestionCard.tsx
│       ├── AISuggestionList.tsx
│       ├── AIPreviewPanel.tsx
│       ├── AIPreviewDiff.tsx
│       └── index.ts
├── stores/
│   └── aiStore.ts
└── types/
    └── ai.ts
```

#### State Management (aiStore.ts)

```typescript
interface AIState {
  // Mode
  mode: 'optimize_only' | 'suggest_and_optimize';
  setMode: (mode: AIState['mode']) => void;

  // Status
  status: 'idle' | 'loading' | 'preview' | 'applying' | 'error';

  // Preview data
  previewData: OptimizeResponse | null;
  selectedSuggestions: Set<number>;  // Indices of suggestions to accept

  // Error handling
  error: {
    code: 'NETWORK' | 'NOT_FOUND' | 'NO_PLACES' | 'RATE_LIMITED' | 'AI_ERROR';
    message: string;
    retryAfter?: number;  // seconds
  } | null;

  // Rate limiting
  lastRequestTime: number | null;

  // Actions
  requestOptimization: (tripId: number) => Promise<void>;
  toggleSuggestion: (index: number) => void;
  applyOptimization: (tripId: number) => Promise<void>;
  cancelPreview: () => void;
  reset: () => void;
}
```

#### State Flow

```
1. User selects mode → aiStore.setMode()
2. User clicks "Get AI Suggestion" → aiStore.requestOptimization()
   - Check rate limit cooldown
   - Set status = 'loading'
   - Call api.optimizeItinerary()
   - On success: Set status = 'preview', previewData = response
   - On error: Set status = 'error', error details
3. User reviews preview
   - Can toggle suggested places on/off
4. User clicks "Apply" → aiStore.applyOptimization()
   - Set status = 'applying'
   - Call api.applyOptimization() with selected suggestions
   - On success: Refresh itinerary, reset AI state
   - On error: Set status = 'error'
5. User clicks "Cancel" → aiStore.cancelPreview()
   - Reset to 'idle', clear preview
```

---

### business_hours Format Standard

#### TypeScript Definition

```typescript
// types/ai.ts
export interface BusinessHours {
  mon?: DayHours | null;
  tue?: DayHours | null;
  wed?: DayHours | null;
  thu?: DayHours | null;
  fri?: DayHours | null;
  sat?: DayHours | null;
  sun?: DayHours | null;
}

export interface DayHours {
  open: string;   // "HH:MM" format (24-hour)
  close: string;  // "HH:MM" format (24-hour)
}

// Example:
const hours: BusinessHours = {
  mon: { open: "09:00", close: "17:00" },
  tue: { open: "09:00", close: "17:00" },
  // ... weekends closed
};

// Stored as JSON string in database:
JSON.stringify(hours) // => '{"mon":{"open":"09:00","close":"17:00"},...}'
```

---

## Implementation Plan

### Task Breakdown

#### Backend Tasks

1. **Register AI Router** (Priority: CRITICAL)
   - File: `backend/app/api/v1/router.py`
   - Add AI router registration
   - Verify endpoints are reachable

2. **Fix /apply Endpoint** (Priority: HIGH)
   - File: `backend/app/api/v1/ai.py`
   - Persist day_assignments to itinerary_items
   - Add validation for place IDs

3. **Add Rate Limiting** (Priority: HIGH)
   - Create: `backend/app/middleware/rate_limiter.py`
   - Update: `backend/app/api/v1/ai.py`
   - Add slowapi dependency

4. **Standardize business_hours** (Priority: MEDIUM)
   - File: `backend/app/schemas/place.py`
   - Add JSON validation
   - Update: `backend/app/services/openai_service.py` with parser

5. **Add Suggested Places Handling** (Priority: MEDIUM)
   - Update /apply to create places from accepted_suggestions
   - Return new place IDs in response

#### Frontend Tasks

6. **Fix API Client** (Priority: CRITICAL)
   - File: `frontend/src/services/api.ts`
   - Fix endpoint paths
   - Update types to match backend

7. **Create Type Definitions** (Priority: HIGH)
   - Create: `frontend/src/types/ai.ts`
   - Define OptimizeResponse, ApplyRequest, etc.
   - Define BusinessHours interface

8. **Create AI Store** (Priority: HIGH)
   - Create: `frontend/src/stores/aiStore.ts`
   - Implement state machine
   - Add rate limit tracking

9. **Build AI Components** (Priority: MEDIUM)
   - Create: `frontend/src/components/ai/AIModeSelector.tsx`
   - Create: `frontend/src/components/ai/AIOptimizeButton.tsx`
   - Create: `frontend/src/components/ai/AISuggestionCard.tsx`
   - Create: `frontend/src/components/ai/AISuggestionList.tsx`
   - Create: `frontend/src/components/ai/AIPreviewPanel.tsx`
   - Create: `frontend/src/components/ai/AIPreviewDiff.tsx`
   - Create: `frontend/src/components/ai/index.ts`

10. **Integrate with Itinerary** (Priority: MEDIUM)
    - Update: `frontend/src/components/itinerary/ItineraryBoard.tsx`
    - Add AI controls section
    - Conditionally render AIPreviewPanel

11. **Add i18n Translations** (Priority: LOW)
    - Update: `frontend/src/i18n/en.json`
    - Update: `frontend/src/i18n/ko.json`
    - Add AI-related strings

#### Testing & Polish

12. **Error Handling** (Priority: HIGH)
    - Test all error scenarios
    - Verify toast messages
    - Check rate limit UI

13. **Edge Cases** (Priority: MEDIUM)
    - Single place optimization
    - No accommodation scenario
    - Concurrent requests
    - Network timeouts

14. **Accessibility** (Priority: LOW)
    - Keyboard navigation
    - ARIA labels
    - Focus management

---

## Verification Checklist

### Backend Verification

- [ ] `GET /api/v1/ai` returns router info
- [ ] `POST /api/v1/ai/optimize` returns 200 with valid response
- [ ] `POST /api/v1/ai/apply` persists day_assignments correctly
- [ ] Rate limiting returns 429 after 6th request in 1 minute
- [ ] business_hours validation rejects invalid JSON
- [ ] OpenAI service handles missing/null business hours
- [ ] Suggested places are created when accepted

### Frontend Verification

- [ ] AI mode selector toggles between modes
- [ ] Optimize button shows loading state
- [ ] Preview panel displays proposed changes
- [ ] Suggested places can be toggled on/off
- [ ] Apply button updates itinerary
- [ ] Cancel button clears preview
- [ ] Error states show appropriate messages
- [ ] Rate limit countdown displays correctly
- [ ] i18n works for all AI strings

### Integration Verification

- [ ] Full flow: Select mode → Optimize → Preview → Apply → Refresh
- [ ] Suggested places appear in itinerary after apply
- [ ] Day assignments update correctly
- [ ] Business hours display in AI reasoning
- [ ] No console errors in browser
- [ ] No 404s in network tab
- [ ] Backend logs show no errors

---

## Dependencies

### Prerequisites

- Phases 1-5 complete ✅
- OpenAI API key configured in backend `.env`
- Docker containers running

### Blockers

None - all prerequisites met

---

## Timeline Estimate

**Total Estimated Effort**: 2-3 days

| Phase | Tasks | Time |
|-------|-------|------|
| Backend Critical Fixes | Tasks 1-2 | 2-3 hours |
| Frontend API + Types | Tasks 6-7 | 1-2 hours |
| AI Store | Task 8 | 2-3 hours |
| Components | Task 9 | 4-6 hours |
| Integration | Task 10 | 2-3 hours |
| Polish | Tasks 11-14 | 2-4 hours |

*Note: Times are estimates for development; testing adds 30-50% overhead*

---

## Risk Assessment

### Critical Risks

1. **API Mismatch** (HIGH) - MITIGATED by fixing paths in Task 6
2. **OpenAI API Key Missing** (MEDIUM) - Need user to configure
3. **Rate Limit Too Restrictive** (LOW) - Can adjust if needed

### Technical Debt

1. **No undo functionality** - Accepted for v1, add later
2. **No per-place reasoning** - Out of scope
3. **Single-trip optimization only** - Accepted limitation

---

## Acceptance Criteria

### User Stories

1. **As a user, I want to optimize my trip itinerary**
   - Given I have added places to my trip
   - When I click "Get AI Suggestion"
   - Then I see an optimized schedule with reasoning

2. **As a user, I want to review AI suggestions before applying**
   - Given AI has generated suggestions
   - When I view the preview
   - Then I can see what changes will be made

3. **As a user, I want to add AI-recommended places**
   - Given mode is "Suggest + Optimize"
   - When AI suggests new places
   - Then I can selectively add them to my trip

4. **As a user, I want clear feedback on errors**
   - Given the AI service is unavailable
   - When I try to optimize
   - Then I see a helpful error message

### Definition of Done

- All tasks complete
- All verification checklist items pass
- No critical bugs
- Code reviewed
- Documentation updated (this file)
- Ready for Phase 7

---

## References

- **app_process.md**: Phase tracking
- **app_plan.md**: Overall implementation plan
- **Backend AI Endpoints**: `backend/app/api/v1/ai.py`
- **OpenAI Service**: `backend/app/services/openai_service.py`
- **Frontend API Client**: `frontend/src/services/api.ts`
- **Itinerary Store**: `frontend/src/stores/itineraryStore.ts`

---

**END OF SPECIFICATION**
