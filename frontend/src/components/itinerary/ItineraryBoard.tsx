import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar, Loader2 } from 'lucide-react'
import { Trip, DaySchedule } from '../../types/trip'
import { DayColumn } from './DayColumn'
import { Card } from '../common/Card'

interface ItineraryBoardProps {
  trip: Trip
  itinerary: DaySchedule[]
  setItinerary: (itinerary: DaySchedule[]) => void
}

export function ItineraryBoard({ trip, itinerary, setItinerary }: ItineraryBoardProps) {
  const handleReorder = (dayNumber: number, newItems: DaySchedule['items']) => {
    setItinerary(
      itinerary.map((day) =>
        day.day_number === dayNumber ? { ...day, items: newItems } : day
      )
    )
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
    <div className="space-y-6">
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
    </div>
  )
}
