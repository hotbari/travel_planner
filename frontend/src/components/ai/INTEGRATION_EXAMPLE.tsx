/**
 * AI Optimization Integration Example
 *
 * This file demonstrates how to integrate all AI components
 * into a trip planning page.
 *
 * DO NOT import this file - it's for reference only.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  AIModeSelector,
  AIOptimizeButton,
  AIPreviewPanel,
} from './index';
import { useAIStore } from '../../stores/aiStore';
import { api } from '../../services/api';
import type { Place } from '../../types/trip';

export function AIOptimizationExample() {
  const { tripId } = useParams<{ tripId: string }>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const { status, applyOptimization } = useAIStore();

  // Load places for the trip
  useEffect(() => {
    if (!tripId) return;

    const loadPlaces = async () => {
      setLoading(true);
      try {
        const response = await api.getPlaces(parseInt(tripId));
        setPlaces(response);
      } catch (err) {
        console.error('Failed to load places:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, [tripId]);

  // Handle optimization apply
  const handleApply = async () => {
    if (!tripId) return;

    try {
      await applyOptimization(parseInt(tripId));

      // Reload places and itinerary after optimization
      const updatedPlaces = await api.getPlaces(parseInt(tripId));
      setPlaces(updatedPlaces);

      // Show success toast
      console.log('Optimization applied successfully!');
    } catch (err) {
      console.error('Failed to apply optimization:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading places...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">
          AI Trip Optimization
        </h1>
        <p className="text-text-secondary">
          Let AI optimize your itinerary for efficiency and discovery
        </p>
      </div>

      {/* AI Controls */}
      <div className="space-y-4 p-6 rounded-lg bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/10">
        <AIModeSelector />

        <AIOptimizeButton
          tripId={parseInt(tripId!)}
          disabled={places.length === 0}
        />

        {places.length === 0 && (
          <div className="text-xs text-text-muted text-center">
            Add some places to your trip before optimizing
          </div>
        )}
      </div>

      {/* Preview Panel (renders when status is 'preview') */}
      <AIPreviewPanel places={places} onApply={handleApply} />

      {/* Current places list (for context) */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">
          Current Places ({places.length})
        </h2>

        {places.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            No places added yet
          </div>
        ) : (
          <div className="grid gap-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-white/10"
              >
                <h3 className="font-semibold text-text-primary">
                  {place.name}
                </h3>
                {place.category && (
                  <span className="text-xs text-text-secondary">
                    {place.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ADVANCED EXAMPLE: With custom loading states and error handling
 */

export function AIOptimizationAdvanced() {
  const { tripId } = useParams<{ tripId: string }>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [reloading, setReloading] = useState(false);

  const { status, error, applyOptimization, reset } = useAIStore();

  const handleApply = async () => {
    if (!tripId) return;

    setReloading(true);

    try {
      await applyOptimization(parseInt(tripId));

      // Reload data
      const [updatedPlaces] = await Promise.all([
        api.getPlaces(parseInt(tripId)),
        new Promise((resolve) => setTimeout(resolve, 500)), // Min loading time
      ]);

      setPlaces(updatedPlaces);

      // Show success notification
      showSuccessToast('Optimization applied successfully!');
    } catch (err) {
      showErrorToast('Failed to apply optimization');
    } finally {
      setReloading(false);
    }
  };

  // Reset AI state on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <div className="space-y-6">
      {/* Your UI here */}
      <AIModeSelector />
      <AIOptimizeButton
        tripId={parseInt(tripId!)}
        disabled={places.length === 0 || reloading}
      />
      <AIPreviewPanel places={places} onApply={handleApply} />

      {/* Loading overlay while applying */}
      {reloading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-text-primary text-lg">
            Applying optimization...
          </div>
        </div>
      )}
    </div>
  );
}

// Mock toast functions (replace with your toast library)
function showSuccessToast(message: string) {
  console.log('✓', message);
}

function showErrorToast(message: string) {
  console.error('✗', message);
}

/**
 * INTEGRATION CHECKLIST:
 *
 * 1. ✓ Import components from '@/components/ai'
 * 2. ✓ Load places data for the trip
 * 3. ✓ Pass tripId to AIOptimizeButton
 * 4. ✓ Pass places array to AIPreviewPanel
 * 5. ✓ Implement onApply handler that:
 *    - Calls applyOptimization(tripId)
 *    - Reloads places/itinerary data
 *    - Shows success feedback
 * 6. ✓ Handle error states (already built into components)
 * 7. ✓ Consider cleanup (reset AI state on unmount)
 *
 * OPTIONAL ENHANCEMENTS:
 * - Add loading overlay during apply
 * - Show toast notifications
 * - Animate place list updates
 * - Track analytics events
 */
