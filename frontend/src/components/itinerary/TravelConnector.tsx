import { motion } from 'framer-motion'
import { Footprints, Train, Car, Bike, ArrowDown, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

interface TravelConnectorProps {
  mode: 'walk' | 'transit' | 'drive' | 'bike'
  durationMinutes: number
  distanceMeters?: number
  onClick?: () => void
  isHighlighted?: boolean
  isEstimated?: boolean
}

const TRANSPORT_ICONS = {
  walk: Footprints,
  transit: Train,
  drive: Car,
  bike: Bike,
}

const MODE_COLORS = {
  walk: 'sky',
  transit: 'violet',
  drive: 'emerald',
  bike: 'amber',
}

const MODE_LABELS = {
  walk: 'walk',
  transit: 'transit',
  drive: 'drive',
  bike: 'bike',
}

export function TravelConnector({
  mode,
  durationMinutes,
  distanceMeters,
  onClick,
  isHighlighted = false,
  isEstimated = false,
}: TravelConnectorProps) {
  const Icon = TRANSPORT_ICONS[mode]
  const color = MODE_COLORS[mode]

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  return (
    <div className="relative flex items-center justify-center py-3">
      {/* Dashed vertical line - using repeating linear gradient for pixel effect */}
      <div
        className={clsx(
          'absolute left-1/2 -translate-x-1/2 w-0.5 h-full',
          isHighlighted && 'opacity-100',
          !isHighlighted && 'opacity-40'
        )}
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            rgb(var(--color-${color})) 0px,
            rgb(var(--color-${color})) 4px,
            transparent 4px,
            transparent 8px
          )`,
          '--color-sky': '14, 165, 233',
          '--color-violet': '139, 92, 246',
          '--color-emerald': '16, 185, 129',
          '--color-amber': '245, 158, 11',
        } as React.CSSProperties}
      />

      {/* Clickable connector button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={clsx(
          'relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full',
          'backdrop-blur-sm transition-all duration-300',
          'border border-white/10',
          isHighlighted && [
            'bg-gradient-to-r shadow-lg',
            color === 'sky' && 'from-sky-500/30 to-sky-400/20 border-sky-400/50 shadow-sky-400/20',
            color === 'violet' && 'from-violet-500/30 to-violet-400/20 border-violet-400/50 shadow-violet-400/20',
            color === 'emerald' && 'from-emerald-500/30 to-emerald-400/20 border-emerald-400/50 shadow-emerald-400/20',
            color === 'amber' && 'from-amber-500/30 to-amber-400/20 border-amber-400/50 shadow-amber-400/20',
          ],
          !isHighlighted && 'bg-slate-800/60 hover:bg-slate-700/60',
          onClick && 'cursor-pointer',
          !onClick && 'cursor-default'
        )}
      >
        {/* Pulsing arrow icon */}
        <motion.div
          animate={{
            y: [0, 2, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={clsx(
            'flex-shrink-0',
            color === 'sky' && 'text-sky-400',
            color === 'violet' && 'text-violet-400',
            color === 'emerald' && 'text-emerald-400',
            color === 'amber' && 'text-amber-400'
          )}
        >
          <ArrowDown className="w-3 h-3" />
        </motion.div>

        {/* Transport icon */}
        <Icon
          className={clsx(
            'w-4 h-4 flex-shrink-0',
            color === 'sky' && 'text-sky-400',
            color === 'violet' && 'text-violet-400',
            color === 'emerald' && 'text-emerald-400',
            color === 'amber' && 'text-amber-400'
          )}
        />

        {/* Duration and distance */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className={clsx(
              'font-medium',
              color === 'sky' && 'text-sky-300',
              color === 'violet' && 'text-violet-300',
              color === 'emerald' && 'text-emerald-300',
              color === 'amber' && 'text-amber-300'
            )}
          >
            {formatDuration(durationMinutes)}
          </span>

          <span className="text-slate-400">
            {MODE_LABELS[mode]}
          </span>

          {distanceMeters !== undefined && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                {formatDistance(distanceMeters)}
              </span>
            </>
          )}

          {/* Estimated indicator badge */}
          {isEstimated && (
            <div
              className="group relative flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40"
              title="Using distance estimate - actual route unavailable"
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span className="text-amber-300 font-medium">Est.</span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800/95 border border-amber-500/30 rounded text-xs text-amber-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
                Using distance estimate - actual route unavailable
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-amber-500/30" />
              </div>
            </div>
          )}
        </div>

        {/* Glow effect when highlighted */}
        {isHighlighted && (
          <motion.div
            className={clsx(
              'absolute inset-0 rounded-full blur-md -z-10',
              color === 'sky' && 'bg-sky-400/20',
              color === 'violet' && 'bg-violet-400/20',
              color === 'emerald' && 'bg-emerald-400/20',
              color === 'amber' && 'bg-amber-400/20'
            )}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>
    </div>
  )
}
