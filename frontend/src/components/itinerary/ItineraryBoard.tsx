import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Trip, DaySchedule, Place } from '../../types/trip'
import { DayColumn } from './DayColumn'
import { Card } from '../common/Card'
import { AIModeSelector, AIOptimizeButton, AIPreviewPanel } from '../ai'
import { useAIStore } from '../../stores/aiStore'

interface ItineraryBoardProps {
  trip: Trip
  itinerary: DaySchedule[]
  setItinerary: (itinerary: DaySchedule[]) => void
  places: Place[]
  onReload: () => void
}

export function ItineraryBoard({ trip, itinerary, setItinerary, places, onReload }: ItineraryBoardProps) {
  const { status, applyOptimization } = useAIStore()

  const handleReorder = (dayNumber: number, newItems: DaySchedule['items']) => {
    setItinerary(
      itinerary.map((day) =>
        day.day_number === dayNumber ? { ...day, items: newItems } : day
      )
    )
  }

  const handleAIApply = async () => {
    await applyOptimization(trip.id)
    // Reload itinerary from parent
    onReload()
  }

  if (itinerary.length === 0) {
    return (
      <Card variant="default" className="text-center py-12">
        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No itinerary yet.</p>
        <p className="text-sm text-slate-500 mt-2">
          Add places and generate your itinerary
        </p>
      </Card>
    )
  }

  return (
    <div className="relative space-y-6">
      {/* AI Controls Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-pixel text-accent-cyan">
          AI OPTIMIZATION
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <AIModeSelector />
          </div>
          <AIOptimizeButton tripId={trip.id} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-pixel text-accent-cyan">
          <Calendar className="w-4 h-4 inline mr-2" />
          ITINERARY
        </h2>
        <span className="text-sm text-slate-400">
          Drag and drop to reorder
        </span>
      </div>

      {/* Day columns - horizontal scroll */}
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">
        {itinerary.map((day, index) => (
          <motion.div
            key={day.day_number}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-80"
          >
            <DayColumn
              day={day}
              tripId={trip.id}
              onReorder={(newItems) => handleReorder(day.day_number, newItems)}
            />
          </motion.div>
        ))}
      </div>

      {/* AI Preview Panel Overlay */}
      {status === 'preview' && (
        <AIPreviewPanel
          places={places}
          onApply={handleAIApply}
        />
      )}
    </div>
  )
}
