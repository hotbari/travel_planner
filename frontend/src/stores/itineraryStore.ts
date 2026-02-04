import { create } from 'zustand'
import { DaySchedule, ItineraryItem } from '../types/trip'
import { api } from '../services/api'
import { useToastStore } from './toastStore'

interface ItineraryState {
  // State
  itinerary: DaySchedule[]
  isLoading: boolean
  isRecalculating: boolean
  error: string | null
  selectedItemId: number | null

  // Actions
  setItinerary: (itinerary: DaySchedule[]) => void
  loadItinerary: (tripId: number) => Promise<void>
  reorderItems: (tripId: number, dayNumber: number, itemIds: number[]) => Promise<void>
  moveItem: (tripId: number, itemId: number, fromDay: number, toDay: number, newSequence: number) => Promise<void>
  selectItem: (itemId: number | null) => void

  // Helper to recalculate times locally (optimistic)
  recalculateTimes: (dayNumber: number, items: ItineraryItem[]) => ItineraryItem[]
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  // Initial state
  itinerary: [],
  isLoading: false,
  isRecalculating: false,
  error: null,
  selectedItemId: null,

  // Set itinerary
  setItinerary: (itinerary) => set({ itinerary }),

  // Load itinerary from API
  loadItinerary: async (tripId) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getItinerary(tripId)
      set({ itinerary: data, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load itinerary'
      set({ error: errorMessage, isLoading: false })
      useToastStore.getState().addToast({
        type: 'error',
        message: errorMessage,
      })
    }
  },

  // Reorder items within a day
  reorderItems: async (tripId, dayNumber, itemIds) => {
    const previousItinerary = get().itinerary

    // Optimistic update
    set((state) => {
      const newItinerary = state.itinerary.map((day) => {
        if (day.day_number === dayNumber) {
          // Reorder items based on itemIds
          const itemsMap = new Map(day.items.map((item) => [item.id, item]))
          const reorderedItems = itemIds
            .map((id) => itemsMap.get(id))
            .filter((item): item is ItineraryItem => item !== undefined)
            .map((item, index) => ({
              ...item,
              sequence_order: index + 1,
            }))

          // Recalculate times
          const recalculatedItems = get().recalculateTimes(dayNumber, reorderedItems)

          return {
            ...day,
            items: recalculatedItems,
          }
        }
        return day
      })

      return { itinerary: newItinerary, isRecalculating: true }
    })

    try {
      // Call API to persist changes and get accurate route calculations
      await api.reorderItinerary(tripId, dayNumber, itemIds)

      // Reload to get accurate travel times from server
      const updatedItinerary = await api.getItinerary(tripId)
      set({ itinerary: updatedItinerary, isRecalculating: false })

      useToastStore.getState().addToast({
        type: 'success',
        message: 'Itinerary updated successfully',
      })
    } catch (error) {
      // Rollback on error
      set({ itinerary: previousItinerary, isRecalculating: false })

      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder items'
      useToastStore.getState().addToast({
        type: 'error',
        message: errorMessage,
      })
    }
  },

  // Move item to different day
  moveItem: async (tripId, itemId, fromDay, toDay, newSequence) => {
    const previousItinerary = get().itinerary

    // Optimistic update
    set((state) => {
      const newItinerary = state.itinerary.map((day) => {
        // Remove from source day
        if (day.day_number === fromDay) {
          return {
            ...day,
            items: day.items
              .filter((item) => item.id !== itemId)
              .map((item, index) => ({
                ...item,
                sequence_order: index + 1,
              })),
          }
        }

        // Add to destination day
        if (day.day_number === toDay) {
          const movedItem = previousItinerary
            .find((d) => d.day_number === fromDay)
            ?.items.find((item) => item.id === itemId)

          if (!movedItem) return day

          const newItems = [...day.items]
          newItems.splice(newSequence - 1, 0, {
            ...movedItem,
            day_number: toDay,
            sequence_order: newSequence,
          })

          // Update sequence orders
          const resequencedItems = newItems.map((item, index) => ({
            ...item,
            sequence_order: index + 1,
          }))

          // Recalculate times
          const recalculatedItems = get().recalculateTimes(toDay, resequencedItems)

          return {
            ...day,
            items: recalculatedItems,
          }
        }

        return day
      })

      return { itinerary: newItinerary, isRecalculating: true }
    })

    try {
      // Call API to persist changes
      await api.moveItineraryItem(tripId, itemId, fromDay, toDay, newSequence)

      // Reload to get accurate travel times from server
      const updatedItinerary = await api.getItinerary(tripId)
      set({ itinerary: updatedItinerary, isRecalculating: false })

      useToastStore.getState().addToast({
        type: 'success',
        message: 'Item moved successfully',
      })
    } catch (error) {
      // Rollback on error
      set({ itinerary: previousItinerary, isRecalculating: false })

      const errorMessage = error instanceof Error ? error.message : 'Failed to move item'
      useToastStore.getState().addToast({
        type: 'error',
        message: errorMessage,
      })
    }
  },

  // Select item
  selectItem: (itemId) => set({ selectedItemId: itemId }),

  // Recalculate times locally (optimistic)
  recalculateTimes: (_dayNumber, items) => {
    if (items.length === 0) return items

    const recalculated: ItineraryItem[] = []
    let currentTime: Date | null = null

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const prevItem = i > 0 ? recalculated[i - 1] : null

      // Determine start time
      if (item.item_type === 'accommodation_start') {
        // Start from accommodation check-out time
        if (item.accommodation?.check_out_time) {
          currentTime = parseTime(item.accommodation.check_out_time)
        }
      } else if (item.item_type === 'travel') {
        // Travel starts when previous item ends
        if (prevItem?.end_time) {
          currentTime = new Date(prevItem.end_time)
        }
      } else if (item.item_type === 'place') {
        // Place starts after previous travel or item
        if (prevItem) {
          if (prevItem.item_type === 'travel') {
            currentTime = new Date(prevItem.end_time || prevItem.start_time)
          } else if (prevItem.end_time) {
            currentTime = new Date(prevItem.end_time)
          }
        }
      } else if (item.item_type === 'accommodation_end') {
        // End at accommodation check-in time
        if (item.accommodation?.check_in_time) {
          currentTime = parseTime(item.accommodation.check_in_time)
        }
      }

      // If we don't have a current time, use the item's existing start_time or estimate
      if (!currentTime) {
        currentTime = item.start_time ? new Date(item.start_time) : new Date()
      }

      const startTime = new Date(currentTime.getTime())

      // Calculate end time
      let endTime: Date
      if (item.item_type === 'place' && item.place?.estimated_duration_minutes) {
        endTime = new Date(startTime.getTime() + item.place.estimated_duration_minutes * 60000)
      } else if (item.item_type === 'travel' && item.travel_duration_minutes) {
        endTime = new Date(startTime.getTime() + item.travel_duration_minutes * 60000)
      } else {
        endTime = startTime
      }

      recalculated.push({
        ...item,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      })

      currentTime = endTime
    }

    return recalculated
  },
}))

// Helper to parse time string (HH:MM) to Date object
function parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}
