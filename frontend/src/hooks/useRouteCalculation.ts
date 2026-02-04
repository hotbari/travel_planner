import { useState } from 'react';
import { api } from '../services/api';
import { useToastStore } from '../stores/toastStore';
import type { RouteResult } from '../types/trip';

interface UseRouteCalculationReturn {
  calculateRoute: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'cycling'
  ) => Promise<RouteResult>;
  isCalculating: boolean;
}

export function useRouteCalculation(): UseRouteCalculationReturn {
  const [isCalculating, setIsCalculating] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const calculateRoute = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'cycling'
  ): Promise<RouteResult> => {
    setIsCalculating(true);

    try {
      // Try OSRM first
      const result = await api.calculateRoute(origin, destination, mode);
      setIsCalculating(false);
      return { ...result, estimated: false };
    } catch (error) {
      // Fallback to distance estimation
      console.warn('OSRM route calculation failed, using distance estimate:', error);

      // Show warning toast
      addToast({
        type: 'warning',
        message: 'Route calculation unavailable - using estimates'
      });

      // Calculate estimated route based on straight-line distance
      const R = 6371; // Earth radius in km
      const dLat = (destination.lat - origin.lat) * Math.PI / 180;
      const dLng = (destination.lng - origin.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance_meters = R * c * 1000;

      // Estimate duration based on mode
      const speeds = {
        driving: 40000, // 40 km/h in m/h
        walking: 5000,  // 5 km/h in m/h
        cycling: 15000  // 15 km/h in m/h
      };
      const duration_minutes = (distance_meters / speeds[mode]) * 60;

      setIsCalculating(false);

      return {
        duration_minutes: Math.round(duration_minutes),
        distance_meters: Math.round(distance_meters),
        polyline: undefined,
        estimated: true
      };
    }
  };

  return { calculateRoute, isCalculating };
}
