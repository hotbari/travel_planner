import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Loader2, Clock } from 'lucide-react'
import { ItineraryItem } from '../../types/trip'
import { TimeSlot } from './TimeSlot'
import { TravelConnector } from './TravelConnector'

interface TimelineProps {
  items: ItineraryItem[]
  onReorder?: (items: ItineraryItem[]) => void
  onItemClick?: (item: ItineraryItem) => void
  selectedItemId?: number
  isLoading?: boolean
  isReordering?: boolean
}

type BusinessHoursStatus = 'open' | 'closing' | 'closed' | 'unknown'

export function Timeline({
  items,
  onReorder,
  onItemClick,
  selectedItemId,
  isLoading = false,
  isReordering = false,
}: TimelineProps) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Slight delay to distinguish clicks from drags
      },
    })
  )

  // Filter only place items for dragging (exclude travel connectors)
  const placeItems = items.filter((item) => item.item_type === 'place' || item.item_type.startsWith('accommodation'))
  const activeItem = placeItems.find((item) => item.id === activeId)

  const toggleExpand = (itemId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Calculate business hours status for an item
  const getBusinessHoursStatus = (item: ItineraryItem): BusinessHoursStatus => {
    if (!item.place?.business_hours || !item.start_time) return 'unknown'

    try {
      const hours = item.place.business_hours

      // Simple heuristic - can be enhanced with actual parsing
      if (hours.toLowerCase().includes('24') || hours.toLowerCase().includes('always')) {
        return 'open'
      }

      // For now, return open as default - implement proper logic later
      // TODO: Parse business hours and compare with item.start_time
      return 'open'
    } catch {
      return 'unknown'
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = placeItems.findIndex((item) => item.id === active.id)
      const newIndex = placeItems.findIndex((item) => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedPlaces = arrayMove(placeItems, oldIndex, newIndex)

        // Update sequence_order for all items
        const updatedItems = reorderedPlaces.map((item, index) => ({
          ...item,
          sequence_order: index,
        }))

        onReorder(updatedItems)
      }
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
          <p className="text-sm text-text-secondary">Loading timeline...</p>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="relative mb-6">
          <Clock className="w-16 h-16 text-text-muted" />
          <motion.div
            className="absolute inset-0"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(14, 165, 233, 0)',
                '0 0 0 20px rgba(14, 165, 233, 0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <p className="text-lg text-text-secondary mb-2">No activities scheduled</p>
        <p className="text-sm text-text-muted">
          Add places to your trip and generate an itinerary
        </p>
      </motion.div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="relative py-6 timeline-container">
        {/* Reordering overlay */}
        {isReordering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-bg-card border-2 border-accent-primary/50">
              <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
              <span className="text-sm text-text-primary font-medium">Updating timeline...</span>
            </div>
          </motion.div>
        )}

        {/* Atmospheric background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.03) 0%, transparent 70%)',
          }}
        />

        {/* Timeline track with dashed pixel effect */}
        <div
          className="absolute left-6 top-0 bottom-0 w-[2px] timeline-track"
          style={{
            background: 'repeating-linear-gradient(to bottom, var(--pixel-border) 0px, var(--pixel-border) 4px, transparent 4px, transparent 8px)',
            imageRendering: 'pixelated',
            opacity: 0.3,
          }}
        />

        {/* Ice crystal glow effect on timeline */}
        <div
          className="absolute left-6 top-0 bottom-0 w-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--pixel-glow), transparent)',
            opacity: 0.1,
            filter: 'blur(8px)',
          }}
        />

        <SortableContext items={placeItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-0 relative">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const isTravel = item.item_type === 'travel'
                const isExpanded = expandedItems.has(item.id)

                return (
                  <motion.div
                    key={`${item.item_type}-${item.id}-${item.sequence_order}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      layout: { duration: 0.3, ease: 'easeInOut' },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    {isTravel ? (
                      <TravelConnector
                        mode={item.travel_mode as any || 'walk'}
                        durationMinutes={item.travel_duration_minutes || 0}
                        distanceMeters={item.travel_distance_meters}
                        onClick={() => onItemClick?.(item)}
                        isHighlighted={selectedItemId === item.id}
                      />
                    ) : (
                      <TimeSlot
                        item={item}
                        isExpanded={isExpanded}
                        onToggleExpand={() => toggleExpand(item.id)}
                        isDragging={activeId === item.id}
                        businessHoursStatus={getBusinessHoursStatus(item)}
                      />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </SortableContext>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="timeline-drag-overlay">
              <TimeSlot
                item={activeItem}
                isExpanded={false}
                onToggleExpand={() => {}}
                isDragging={true}
                businessHoursStatus={getBusinessHoursStatus(activeItem)}
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>

      <style>{`
        /* Timeline container */
        .timeline-container {
          position: relative;
          isolation: isolate;
        }

        /* Timeline track */
        .timeline-track {
          transition: opacity 0.3s ease, filter 0.3s ease;
          will-change: opacity, filter;
        }

        /* Drag overlay with frost effect */
        .timeline-drag-overlay {
          transform: scale(1.05) rotate(2deg);
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6))
                  drop-shadow(0 0 20px rgba(14, 165, 233, 0.4))
                  drop-shadow(0 0 40px rgba(56, 189, 248, 0.2));
          cursor: grabbing;
          animation: drag-float 0.6s ease-in-out infinite alternate;
        }

        @keyframes drag-float {
          0% {
            transform: scale(1.05) rotate(2deg) translateY(0px);
          }
          100% {
            transform: scale(1.05) rotate(2deg) translateY(-4px);
          }
        }

        /* Pulse glow animation for timeline during drag */
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.3;
            filter: drop-shadow(0 0 0 rgba(14, 165, 233, 0));
          }
          50% {
            opacity: 0.6;
            filter: drop-shadow(0 0 12px rgba(14, 165, 233, 0.6))
                    drop-shadow(0 0 24px rgba(56, 189, 248, 0.3));
          }
        }

        .dragging .timeline-track {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Ice shimmer effect - subtle animation on timeline */
        @keyframes ice-shimmer {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 100%;
          }
        }

        .timeline-container:hover .timeline-track {
          opacity: 0.5;
          animation: ice-shimmer 3s linear infinite;
        }

        /* Pixel-perfect dashed effect for retina displays */
        @media (min-resolution: 2dppx) {
          .timeline-track {
            background-size: 2px 8px;
          }
        }

        /* Frost particle effect on scroll */
        @keyframes frost-particle {
          0% {
            transform: translateY(-10px) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(10px) translateX(2px) scale(1);
            opacity: 0;
          }
        }

        /* Enhanced empty state animation */
        .timeline-container:empty::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(14, 165, 233, 0.05) 0%,
            transparent 70%
          );
          animation: breathing 4s ease-in-out infinite;
        }

        @keyframes breathing {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        /* Smooth scroll behavior */
        .timeline-container {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar styling for timeline */
        .timeline-container::-webkit-scrollbar {
          width: 4px;
        }

        .timeline-container::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }

        .timeline-container::-webkit-scrollbar-thumb {
          background: rgba(14, 165, 233, 0.3);
          border-radius: 2px;
        }

        .timeline-container::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.5);
        }

        /* Accessibility: Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .timeline-drag-overlay,
          .timeline-track,
          .timeline-container {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </DndContext>
  )
}
