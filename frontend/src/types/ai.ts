// AI Optimization Types

export type OptimizeMode = 'optimize_only' | 'suggest_and_optimize';

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

export interface SuggestedPlace {
  name: string;
  latitude: number;
  longitude: number;
  estimated_duration_minutes: number;
  reason: string;
  category?: string;
  business_hours?: BusinessHours;
}

export interface OptimizeResponse {
  optimized_order: number[];
  suggested_places: SuggestedPlace[];
  day_assignments: Record<string, number[]>;
  reasoning: string;
  error: boolean;
}

export interface ApplyResponse {
  message: string;
  optimized_count: number;
  added_places: number[];
}

// AI Store State Types

export type AIStatus = 'idle' | 'loading' | 'preview' | 'applying' | 'error';

export type AIErrorCode =
  | 'NETWORK'
  | 'NOT_FOUND'
  | 'NO_PLACES'
  | 'RATE_LIMITED'
  | 'AI_ERROR';

export interface AIError {
  code: AIErrorCode;
  message: string;
  retryAfter?: number;  // seconds, for rate limiting
}

export interface AIState {
  mode: OptimizeMode;
  status: AIStatus;
  previewData: OptimizeResponse | null;
  selectedSuggestions: Set<number>;
  error: AIError | null;
  lastRequestTime: number | null;

  // Actions
  setMode: (mode: OptimizeMode) => void;
  requestOptimization: (tripId: number) => Promise<void>;
  toggleSuggestion: (index: number) => void;
  applyOptimization: (tripId: number) => Promise<void>;
  cancelPreview: () => void;
  reset: () => void;
}
