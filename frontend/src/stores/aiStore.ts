import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIState, OptimizeMode, AIError } from '../types/ai';
import { api } from '../services/api';

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // State
      mode: 'optimize_only',
      status: 'idle',
      previewData: null,
      selectedSuggestions: new Set(),
      error: null,
      lastRequestTime: null,

      // Actions
      setMode: (mode: OptimizeMode) => {
        set({ mode });
      },

      requestOptimization: async (tripId: number) => {
        // Check local cooldown (12 seconds = 5 req/min)
        const { lastRequestTime } = get();
        const cooldownMs = 12000;

        if (lastRequestTime && Date.now() - lastRequestTime < cooldownMs) {
          const remaining = Math.ceil((cooldownMs - (Date.now() - lastRequestTime)) / 1000);
          set({
            status: 'error',
            error: {
              code: 'RATE_LIMITED',
              message: `Please wait ${remaining} seconds before optimizing again`,
              retryAfter: remaining
            }
          });
          return;
        }

        // Set loading state
        set({ status: 'loading', error: null });

        try {
          const response = await api.optimizeItinerary(tripId, get().mode);

          set({
            status: 'preview',
            previewData: response,
            selectedSuggestions: new Set(
              // Auto-select all suggestions initially
              response.suggested_places.map((_: any, idx: number) => idx)
            ),
            lastRequestTime: Date.now()
          });
        } catch (err: any) {
          let error: AIError;

          if (err.response?.status === 429) {
            error = {
              code: 'RATE_LIMITED',
              message: 'Too many requests. Please try again later.',
              retryAfter: 60
            };
          } else if (err.response?.status === 404) {
            error = {
              code: 'NOT_FOUND',
              message: 'Trip not found'
            };
          } else if (err.response?.status === 400) {
            error = {
              code: 'NO_PLACES',
              message: 'Add some places to your trip before optimizing'
            };
          } else if (err.code === 'ECONNREFUSED' || !err.response) {
            error = {
              code: 'NETWORK',
              message: 'Network error. Please check your connection.'
            };
          } else {
            error = {
              code: 'AI_ERROR',
              message: err.response?.data?.detail || 'AI optimization failed. Please try again.'
            };
          }

          set({ status: 'error', error });
        }
      },

      toggleSuggestion: (index: number) => {
        const { selectedSuggestions } = get();
        const newSet = new Set(selectedSuggestions);

        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }

        set({ selectedSuggestions: newSet });
      },

      applyOptimization: async (tripId: number) => {
        const { previewData, selectedSuggestions } = get();

        if (!previewData) return;

        set({ status: 'applying' });

        try {
          const acceptedSuggestionPlaces = previewData.suggested_places.filter(
            (_: any, idx: number) => selectedSuggestions.has(idx)
          );
          await api.applyOptimization(
            tripId,
            previewData.optimized_order,
            previewData.day_assignments,
            acceptedSuggestionPlaces
          );

          // Success - reset AI state
          set({
            status: 'idle',
            previewData: null,
            selectedSuggestions: new Set(),
            error: null
          });

          // Trigger itinerary reload (handled by parent component)
        } catch (err: any) {
          set({
            status: 'error',
            error: {
              code: 'AI_ERROR',
              message: err.response?.data?.detail || 'Failed to apply optimization'
            }
          });
        }
      },

      cancelPreview: () => {
        set({
          status: 'idle',
          previewData: null,
          selectedSuggestions: new Set(),
          error: null
        });
      },

      reset: () => {
        set({
          status: 'idle',
          previewData: null,
          selectedSuggestions: new Set(),
          error: null,
          lastRequestTime: null
        });
      }
    }),
    {
      name: 'ai-mode-storage',
      partialize: (state) => ({ mode: state.mode })
    }
  )
);
