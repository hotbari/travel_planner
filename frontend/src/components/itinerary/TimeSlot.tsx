import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  DollarSign,
  Hotel,
  Calendar,
  StickyNote
} from 'lucide-react'
import clsx from 'clsx'
import { ItineraryItem } from '../../types/trip'
import { BusinessHoursBadge } from '../places/BusinessHoursBadge'

interface TimeSlotProps {
  item: ItineraryItem
  isExpanded: boolean
  onToggleExpand: () => void
  isDragging?: boolean
  businessHoursStatus?: 'open' | 'closing' | 'closed' | 'unknown'
}

export function TimeSlot({
  item,
  isExpanded,
  onToggleExpand,
  isDragging = false,
  businessHoursStatus = 'unknown'
}: TimeSlotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isAccommodation = item.item_type === 'accommodation_start' || item.item_type === 'accommodation_end'
  const isPlace = item.item_type === 'place'

  // Format time (HH:MM)
  const formatTime = (time: string) => {
    try {
      const date = new Date(time)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch {
      return time
    }
  }

  // Calculate duration in minutes
  const getDuration = () => {
    if (isPlace && item.place) {
      return item.place.estimated_duration_minutes
    }
    if (item.start_time && item.end_time) {
      const start = new Date(item.start_time)
      const end = new Date(item.end_time)
      return Math.round((end.getTime() - start.getTime()) / 60000)
    }
    return null
  }

  const duration = getDuration()

  // Get display name
  const getDisplayName = () => {
    if (isAccommodation && item.accommodation) {
      return item.accommodation.name
    }
    if (isPlace && item.place) {
      return item.place.name
    }
    return 'Unknown Location'
  }

  const displayName = getDisplayName()

  // Get cost
  const getCost = () => {
    if (isPlace && item.place?.estimated_cost !== undefined) {
      return item.place.estimated_cost
    }
    return null
  }

  const cost = getCost()

  // Get label for accommodation
  const getAccommodationLabel = () => {
    if (item.item_type === 'accommodation_start') return 'Check-in'
    if (item.item_type === 'accommodation_end') return 'Check-out'
    return null
  }

  const accommodationLabel = getAccommodationLabel()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group relative',
        (isDragging || isSortableDragging) && 'z-50 opacity-50'
      )}
    >
      {/* Timeline connector dot */}
      <div className="absolute left-0 top-0 w-3 h-3 -translate-x-1/2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={clsx(
            'w-full h-full rounded-full border-2',
            isAccommodation
              ? 'bg-pink-500 border-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.5)]'
              : 'bg-accent-primary border-accent-secondary shadow-[0_0_8px_rgba(14,165,233,0.5)]'
          )}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={clsx(
          'relative ml-6 rounded-lg border-2 overflow-hidden',
          'transition-all duration-300',
          isAccommodation
            ? 'bg-pink-950/30 border-pink-500/40 hover:border-pink-400/60'
            : 'bg-bg-card/60 border-accent-primary/40 hover:border-accent-secondary/60',
          'backdrop-blur-sm',
          isExpanded && 'shadow-glow-sky',
          !isDragging && !isSortableDragging && 'hover:shadow-glow-ice'
        )}
      >
        {/* Header - Always visible */}
        <div
          className={clsx(
            'relative flex items-center gap-3 p-3',
            'cursor-pointer select-none',
            isAccommodation ? 'bg-gradient-to-r from-pink-950/50 to-transparent' : ''
          )}
          onClick={onToggleExpand}
        >
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className={clsx(
              'cursor-grab active:cursor-grabbing',
              'p-1 -ml-1 rounded hover:bg-white/10',
              'transition-colors'
            )}
          >
            <GripVertical className="w-4 h-4 text-text-muted" />
          </div>

          {/* Icon */}
          {isAccommodation && (
            <div className="flex items-center justify-center w-8 h-8 rounded bg-pink-500/20">
              <Hotel className="w-5 h-5 text-pink-400" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Time and name */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-accent-highlight">
                {formatTime(item.start_time)}
              </span>
              <span className="font-medium text-text-primary truncate">
                {displayName}
              </span>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              {/* Accommodation label */}
              {accommodationLabel && (
                <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-medium">
                  {accommodationLabel}
                </span>
              )}

              {/* Duration */}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration} min
                </span>
              )}

              {/* Cost */}
              {cost !== null && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ¥{cost}
                </span>
              )}

              {/* Business hours status */}
              {isPlace && item.place?.business_hours && (
                <BusinessHoursBadge
                  status={businessHoursStatus}
                  businessHours={item.place.business_hours}
                />
              )}
            </div>
          </div>

          {/* Expand toggle */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </motion.div>
        </div>

        {/* Expandable details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className={clsx(
                'px-3 pb-3 space-y-3',
                'border-t',
                isAccommodation ? 'border-pink-500/20' : 'border-accent-primary/20'
              )}>
                {/* Accommodation details */}
                {isAccommodation && item.accommodation && (
                  <div className="pt-3 space-y-2">
                    {/* Address */}
                    {item.accommodation.address && (
                      <div className="flex gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                        <span className="text-text-secondary">{item.accommodation.address}</span>
                      </div>
                    )}

                    {/* Times */}
                    <div className="flex gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">
                        Check-in: {item.accommodation.check_in_time} |
                        Check-out: {item.accommodation.check_out_time}
                      </span>
                    </div>

                    {/* Notes */}
                    {item.accommodation.notes && (
                      <div className="flex gap-2 text-sm">
                        <StickyNote className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                        <p className="text-text-secondary">{item.accommodation.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Place details */}
                {isPlace && item.place && (
                  <div className="pt-3 space-y-2">
                    {/* Category */}
                    {item.place.category && (
                      <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-accent-primary/20 text-accent-secondary border border-accent-primary/30">
                        {item.place.category}
                      </div>
                    )}

                    {/* Address */}
                    {item.place.address && (
                      <div className="flex gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-accent-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-text-secondary">{item.place.address}</span>
                      </div>
                    )}

                    {/* Full business hours */}
                    {item.place.business_hours && (
                      <div className="p-2 rounded bg-bg-secondary/50 border border-accent-primary/20">
                        <div className="text-xs font-medium text-accent-secondary mb-1">
                          Business Hours
                        </div>
                        <div className="text-xs text-text-secondary space-y-0.5 font-mono">
                          {(() => {
                            try {
                              const hours = JSON.parse(item.place.business_hours)
                              return Object.entries(hours).map(([day, time]) => (
                                <div key={day} className="flex justify-between">
                                  <span className="capitalize">{day}:</span>
                                  <span>{time as string}</span>
                                </div>
                              ))
                            } catch {
                              return <span>Invalid format</span>
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {item.place.notes && (
                      <div className="flex gap-2 text-sm">
                        <StickyNote className="w-4 h-4 text-accent-secondary flex-shrink-0 mt-0.5" />
                        <p className="text-text-secondary">{item.place.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pixel corner decorations */}
        <div className={clsx(
          'absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 rounded-tl',
          isAccommodation ? 'border-pink-400/50' : 'border-accent-secondary/50'
        )} />
        <div className={clsx(
          'absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 rounded-tr',
          isAccommodation ? 'border-pink-400/50' : 'border-accent-secondary/50'
        )} />
        <div className={clsx(
          'absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 rounded-bl',
          isAccommodation ? 'border-pink-400/50' : 'border-accent-secondary/50'
        )} />
        <div className={clsx(
          'absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 rounded-br',
          isAccommodation ? 'border-pink-400/50' : 'border-accent-secondary/50'
        )} />
      </motion.div>
    </div>
  )
}
