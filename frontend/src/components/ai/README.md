# AI Components - Frost Winter Theme

Complete set of AI optimization UI components matching the travel planner's frost winter aesthetic.

## Design Philosophy

**Theme**: Frost Winter - Deep ocean blues with ice-like accents
**Mood**: Modern-retro hybrid with subtle pixel art touches
**Palette**: Deep blue (#0f172a) + Sky blue (#0ea5e9) + Frost white (#f0f9ff)

## Components

### 1. AIModeSelector
**Purpose**: Toggle between "Optimize Only" and "Suggest + Optimize" modes
**Design Features**:
- Two-column grid layout with active state highlighting
- Gradient backgrounds on selected mode with corner pixel accents
- Icon differentiation (Zap vs Sparkles)
- Smooth mode description transitions
- Touch-friendly button sizing

**Usage**:
```tsx
import { AIModeSelector } from '@/components/ai';

<AIModeSelector className="mb-4" />
```

---

### 2. AIOptimizeButton
**Purpose**: Primary trigger button with loading states and error handling
**Design Features**:
- Gradient background with animated shimmer effect
- Corner decorations on active state
- Loading spinner with "Optimizing..." text
- Inline error display with retry countdown
- Disabled state styling
- Full-width responsive layout

**Usage**:
```tsx
import { AIOptimizeButton } from '@/components/ai';

<AIOptimizeButton
  tripId={123}
  disabled={places.length === 0}
/>
```

---

### 3. AISuggestionCard
**Purpose**: Display individual AI place suggestion with toggle selection
**Design Features**:
- Click-to-toggle selection with visual feedback
- CheckCircle indicator in top-right corner
- Selected state: Sky blue gradient border + shadow glow
- Duration display with clock icon
- AI reasoning displayed with Info icon
- Staggered entrance animations (50ms delay per card)
- Hover state with subtle glow effect

**Usage**:
```tsx
import { AISuggestionCard } from '@/components/ai';

<AISuggestionCard
  place={suggestedPlace}
  index={0}
  isSelected={true}
  onToggle={handleToggle}
/>
```

---

### 4. AISuggestionList
**Purpose**: Container for all AI suggestions with bulk actions
**Design Features**:
- Header with suggestion count
- Info banner explaining selection behavior
- Select All / Deselect All quick actions
- Empty state for no suggestions
- Grid layout with 12px gap

**Usage**:
```tsx
import { AISuggestionList } from '@/components/ai';

<AISuggestionList className="mt-6" />
```

---

### 5. AIPreviewDiff
**Purpose**: Visual diff showing optimized route by day
**Design Features**:
- Day-by-day grouping with colored badges
- Vertical timeline with connecting lines
- Numbered sequence indicators (1, 2, 3...)
- Place cards with category and duration
- Gradient dividers for section separation
- Empty state with MapPin icon

**Usage**:
```tsx
import { AIPreviewDiff } from '@/components/ai';

<AIPreviewDiff
  originalPlaces={places}
  dayAssignments={{ "1": [2, 1], "2": [3] }}
/>
```

---

### 6. AIPreviewPanel
**Purpose**: Full-screen side panel showing complete preview
**Design Features**:
- Slides in from right with spring animation
- Backdrop blur overlay
- Three sections: Header, Scrollable Content, Fixed Footer
- Header: Sparkles icon badge + title + close button
- Content: AI reasoning box + suggestions + route diff
- Footer: Cancel + Apply buttons with gradient styling
- Corner pixel decorations on header/footer
- Max-width 2xl (672px)

**Usage**:
```tsx
import { AIPreviewPanel } from '@/components/ai';

<AIPreviewPanel
  places={places}
  onApply={handleApply}
/>
```

---

### 7. index.ts
**Purpose**: Barrel export for clean imports

**Usage**:
```tsx
import {
  AIModeSelector,
  AIOptimizeButton,
  AISuggestionList,
  AIPreviewPanel
} from '@/components/ai';
```

---

## Animation Details

All components use **Framer Motion** for smooth, performant animations:

- **Panel entrance**: Spring animation (damping: 30, stiffness: 300)
- **Card stagger**: 50ms delay increments for list items
- **Button hover**: Scale 1.02, tap 0.98
- **Shimmer effect**: 2s linear infinite gradient sweep
- **Mode transitions**: Opacity + Y-axis fade (4px)

---

## Accessibility

- All buttons have proper focus rings (ring-2)
- Keyboard navigable
- Disabled states clearly indicated
- Color contrast ratios meet WCAG AA standards
- Loading states announced via spinner icons
- Error messages display with AlertCircle icons

---

## Color Variables Used

From `tailwind.config.js`:
- `accent-primary`: #0ea5e9 (Sky blue)
- `accent-secondary`: #38bdf8 (Light ice blue)
- `text-primary`: #f0f9ff (Frost white)
- `text-secondary`: #94a3b8 (Muted slate)
- `text-muted`: #64748b (Dark muted)

---

## Dependencies

- `framer-motion`: Animations
- `lucide-react`: Icons (Sparkles, Zap, CheckCircle2, Info, MapPin, Clock, etc.)
- `zustand`: State management via `useAIStore`
- `tailwindcss`: Styling

---

## Integration Example

Complete example showing all components together:

```tsx
import { useState } from 'react';
import {
  AIModeSelector,
  AIOptimizeButton,
  AIPreviewPanel
} from '@/components/ai';
import { useAIStore } from '@/stores/aiStore';

function TripOptimizer({ tripId, places }) {
  const { applyOptimization } = useAIStore();

  const handleApply = async () => {
    await applyOptimization(tripId);
    // Reload itinerary data
  };

  return (
    <div className="space-y-4">
      <AIModeSelector />
      <AIOptimizeButton tripId={tripId} disabled={!places.length} />
      <AIPreviewPanel places={places} onApply={handleApply} />
    </div>
  );
}
```

---

## Design Rationale

**Why this aesthetic?**
- Frost winter theme creates trust and clarity for route optimization
- Sky blue accents suggest intelligence and precision
- Corner decorations add subtle pixel-art character without overwhelming
- Gradients and shadows create depth, preventing flat UI fatigue
- Dark backgrounds reduce eye strain during planning sessions
- Staggered animations feel responsive, not janky

**Typography choices**:
- Body text: Inter (clean, readable)
- Code/data: JetBrains Mono (coordinates, times)
- Headings: Semibold weights for hierarchy

**Spacing system**:
- Component padding: 4 (16px)
- Section gaps: 6 (24px)
- Card gaps: 3 (12px)
- Button padding: px-4 py-2 (16px × 8px)
