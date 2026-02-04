import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { format } from 'date-fns'
import { Calendar, Grip, Sparkles } from 'lucide-react'
import { DaySchedule, ItineraryItem } from '../../types/trip'
import { Timeline } from './Timeline'
import { Card } from '../common/Card'
import { api } from '../../services/api'
import { useToastStore } from '../../stores/toastStore'

interface DayColumnProps {
  day: DaySchedule
  tripId: number
  onReorder: (items: ItineraryItem[]) => void
  onItemClick?: (item: ItineraryItem) => void
}

const dayTypeLabels = {
  arrival: 'ARRIVAL',
  middle: 'DAY',
  departure: 'DEPARTURE',
}

const dayTypeColors = {
  arrival: 'from-emerald-500/20 to-accent-primary/20',
  middle: 'from-accent-primary/20 to-purple-500/20',
  departure: 'from-accent-primary/20 to-rose-500/20',
}

export function DayColumn({ day, tripId, onReorder, onItemClick }: DayColumnProps) {
  const [isReordering, setIsReordering] = useState(false)
  const addToast = useToastStore((state) => state.addToast)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = day.items.findIndex((item) => item.id === active.id)
    const newIndex = day.items.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const reorderedItems = arrayMove(day.items, oldIndex, newIndex)

    // Optimistically update UI
    onReorder(reorderedItems)

    // Persist to backend
    setIsReordering(true)
    try {
      await api.reorderItinerary(
        tripId,
        day.day_number,
        reorderedItems.map((item) => item.id)
      )
      addToast({
        type: 'success',
        message: 'Itinerary reordered successfully',
        duration: 2000,
      })
    } catch (error) {
      console.error('Failed to reorder itinerary:', error)
      addToast({
        type: 'error',
        message: 'Failed to reorder. Please try again.',
      })
      // Revert on error
      onReorder(day.items)
    } finally {
      setIsReordering(false)
    }
  }

  const visibleItems = day.items.filter(
    (item) => item.item_type !== 'travel'
  )

  return (
    <Card variant="default" className="h-full min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                dayTypeColors[day.day_type]
              } flex items-center justify-center`}
              whileHover={{ scale: 1.05 }}
            >
              <Calendar className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Day {day.day_number}
              </h3>
              <p className="text-xs text-text-muted uppercase font-pixel">
                {dayTypeLabels[day.day_type]}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-text-secondary">
              {format(new Date(day.date), 'MMM dd')}
            </p>
            <p className="text-xs text-text-muted">
              {format(new Date(day.date), 'EEEE')}
            </p>
          </div>
        </div>

        {/* Drag hint */}
        <motion.div
          className="flex items-center gap-1.5 text-xs text-text-muted mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Grip className="w-3 h-3" />
          <span>Drag to reorder</span>
        </motion.div>
      </div>

      {/* Timeline with drag-drop */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {visibleItems.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full py-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-primary/10 to-purple-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-accent-primary/50" />
            </div>
            <p className="text-text-muted text-sm">No activities yet</p>
            <p className="text-text-muted/60 text-xs mt-1">
              Add places to build your day
            </p>
          </motion.div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <Timeline
                items={visibleItems}
                isReordering={isReordering}
                onItemClick={onItemClick}
              />
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">
            {visibleItems.length} {visibleItems.length === 1 ? 'activity' : 'activities'}
          </span>
          {isReordering && (
            <motion.span
              className="text-accent-primary flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1 h-1 rounded-full bg-accent-primary animate-pulse" />
              Saving...
            </motion.span>
          )}
        </div>
      </div>
    </Card>
  )
}
