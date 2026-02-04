import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Edit,
  Trash2,
  Clock,
  Coins,
  MapPin,
  GripVertical,
  Tag,
  FileText
} from 'lucide-react'
import { Place } from '../../types/trip'
import clsx from 'clsx'

interface PlaceCardProps {
  place: Place
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  onDragStart?: () => void
  businessHoursStatus?: 'open' | 'closing' | 'closed' | 'unknown'
}

export function PlaceCard({
  place,
  index,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onDragStart,
  businessHoursStatus = 'unknown',
}: PlaceCardProps) {
  const statusConfig = {
    open: {
      color: 'bg-status-open',
      label: 'Open',
      ring: 'ring-status-open/30',
      glow: 'shadow-[0_0_12px_rgba(74,222,128,0.3)]'
    },
    closing: {
      color: 'bg-status-closing',
      label: 'Closing Soon',
      ring: 'ring-status-closing/30',
      glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]'
    },
    closed: {
      color: 'bg-status-closed',
      label: 'Closed',
      ring: 'ring-status-closed/30',
      glow: 'shadow-[0_0_12px_rgba(248,113,113,0.3)]'
    },
    unknown: {
      color: 'bg-text-muted',
      label: 'Unknown',
      ring: 'ring-text-muted/30',
      glow: ''
    }
  }

  const status = statusConfig[businessHoursStatus]

  // Extract cost from notes or use default
  const estimatedCost = place.notes?.match(/¥\d+/) ?
    place.notes.match(/¥\d+/)?.[0] :
    '¥0'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
      className={clsx(
        'group relative rounded-lg overflow-hidden',
        'bg-gradient-to-br from-bg-card/95 to-bg-card/80',
        'border border-pixel-border/30',
        'hover:border-pixel-border/60 hover:shadow-glow-sky',
        'transition-all duration-300',
        isExpanded && 'ring-2 ring-accent-primary/40 shadow-glow-ice'
      )}
      style={{
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Frost texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Collapsed View */}
      <div
        className="relative flex items-center gap-3 p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <button
          type="button"
          onMouseDown={onDragStart}
          className={clsx(
            'touch-none cursor-grab active:cursor-grabbing',
            'text-text-muted hover:text-text-secondary transition-colors',
            'opacity-0 group-hover:opacity-100'
          )}
          aria-label="Drag to reorder"
        >
          <GripVertical size={20} className="stroke-[1.5]" />
        </button>

        {/* Index Badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center">
          <span className="text-sm font-bold text-accent-secondary font-mono">
            {index}
          </span>
        </div>

        {/* Place Name */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary truncate">
            {place.name}
          </h3>
        </div>

        {/* Compact Info */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Cost */}
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Coins size={16} className="text-accent-secondary" />
            <span className="text-sm font-mono font-medium">{estimatedCost}</span>
          </div>

          {/* Business Hours Status Badge */}
          <div
            className={clsx(
              'w-3 h-3 rounded-full ring-2',
              status.color,
              status.ring,
              status.glow
            )}
            title={status.label}
          />

          {/* Duration */}
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Clock size={16} className="text-accent-secondary" />
            <span className="text-sm font-mono font-medium">
              {place.estimated_duration_minutes}min
            </span>
          </div>

          {/* Expand Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChevronDown
              size={20}
              className="text-text-muted group-hover:text-text-secondary transition-colors"
            />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2 }
            }}
          >
            <div className="px-4 pb-4 pt-2 space-y-4 border-t border-white/5">
              {/* Category & Status Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {place.category && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent-primary/10 border border-accent-primary/30">
                    <Tag size={14} className="text-accent-secondary" />
                    <span className="text-xs font-medium text-text-secondary">
                      {place.category}
                    </span>
                  </div>
                )}

                <div className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md border',
                  `${status.color}/20 border-${status.color}/40`
                )}>
                  <div className={clsx('w-2 h-2 rounded-full', status.color)} />
                  <span className="text-xs font-medium text-text-secondary">
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Business Hours Details */}
              {place.business_hours && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Clock size={14} className="text-accent-secondary" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Business Hours
                    </span>
                  </div>
                  <div className="pl-5 text-sm text-text-secondary font-mono whitespace-pre-line">
                    {place.business_hours}
                  </div>
                </div>
              )}

              {/* Open Days */}
              {place.open_days && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Clock size={14} className="text-accent-secondary" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Open Days
                    </span>
                  </div>
                  <div className="pl-5 text-sm text-text-secondary">
                    {place.open_days}
                  </div>
                </div>
              )}

              {/* Notes */}
              {place.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <FileText size={14} className="text-accent-secondary" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Notes
                    </span>
                  </div>
                  <div className="pl-5 text-sm text-text-secondary leading-relaxed">
                    {place.notes}
                  </div>
                </div>
              )}

              {/* Coordinates (subtle) */}
              <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
                <MapPin size={12} className="text-accent-secondary/50" />
                <span>
                  {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md',
                    'bg-accent-primary/10 border border-accent-primary/30',
                    'hover:bg-accent-primary/20 hover:border-accent-primary/50',
                    'text-accent-secondary font-medium text-sm',
                    'transition-all duration-200'
                  )}
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md',
                    'bg-status-closed/10 border border-status-closed/30',
                    'hover:bg-status-closed/20 hover:border-status-closed/50',
                    'text-status-closed font-medium text-sm',
                    'transition-all duration-200'
                  )}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pixel Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent-primary/40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-accent-primary/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-accent-primary/40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent-primary/40 pointer-events-none" />
    </motion.div>
  )
}
