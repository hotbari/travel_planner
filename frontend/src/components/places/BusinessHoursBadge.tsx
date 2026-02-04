import { motion } from 'framer-motion'
import { Clock, Info } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

interface BusinessHoursBadgeProps {
  status: 'open' | 'closing' | 'closed' | 'unknown'
  businessHours?: string  // JSON string of hours
  currentTime?: Date
}

export function BusinessHoursBadge({
  status,
  businessHours,
  currentTime = new Date()
}: BusinessHoursBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const statusConfig = {
    open: {
      label: 'OPEN',
      bgColor: 'bg-status-open/20',
      borderColor: 'border-status-open',
      textColor: 'text-status-open',
      iconColor: 'text-status-open',
      glowColor: 'shadow-[0_0_12px_rgba(74,222,128,0.3)]',
    },
    closing: {
      label: 'CLOSING SOON',
      bgColor: 'bg-status-closing/20',
      borderColor: 'border-status-closing',
      textColor: 'text-status-closing',
      iconColor: 'text-status-closing',
      glowColor: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]',
    },
    closed: {
      label: 'CLOSED',
      bgColor: 'bg-status-closed/20',
      borderColor: 'border-status-closed',
      textColor: 'text-status-closed',
      iconColor: 'text-status-closed',
      glowColor: 'shadow-[0_0_12px_rgba(248,113,113,0.3)]',
    },
    unknown: {
      label: 'HOURS N/A',
      bgColor: 'bg-text-muted/10',
      borderColor: 'border-text-muted/30',
      textColor: 'text-text-muted',
      iconColor: 'text-text-muted',
      glowColor: '',
    },
  }

  const config = statusConfig[status]

  // Parse business hours if available
  let parsedHours: Record<string, string> | null = null
  try {
    if (businessHours) {
      parsedHours = JSON.parse(businessHours)
    }
  } catch {
    // Invalid JSON, ignore
  }

  const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' })
  const todayHours = parsedHours?.[currentDay.toLowerCase()] || 'Closed'

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1',
          'rounded border backdrop-blur-sm',
          'text-xs font-mono font-medium tracking-wide',
          'transition-all duration-300',
          config.bgColor,
          config.borderColor,
          config.textColor,
          showTooltip && config.glowColor
        )}
      >
        <Clock className={clsx('w-3 h-3', config.iconColor)} />
        <span>{config.label}</span>
        {businessHours && (
          <Info className={clsx('w-3 h-3 opacity-60', config.iconColor)} />
        )}
      </motion.div>

      {/* Tooltip */}
      {showTooltip && businessHours && parsedHours && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.95 }}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56"
        >
          <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border border-white/10 shadow-2xl p-3">
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-900 border-r border-b border-white/10" />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                <Clock className="w-4 h-4 text-accent-primary" />
                <span className="text-xs font-semibold text-white tracking-wide">BUSINESS HOURS</span>
              </div>

              <div className="space-y-1.5">
                {Object.entries(parsedHours).map(([day, hours]) => {
                  const isToday = day.toLowerCase() === currentDay.toLowerCase()
                  return (
                    <div
                      key={day}
                      className={clsx(
                        'flex justify-between text-xs',
                        isToday
                          ? 'text-accent-primary font-medium'
                          : 'text-slate-400'
                      )}
                    >
                      <span className="capitalize font-mono">{day.slice(0, 3)}</span>
                      <span className="font-mono">{hours}</span>
                    </div>
                  )
                })}
              </div>

              {/* Current status line */}
              <div className={clsx(
                'mt-2 pt-2 border-t border-white/10',
                'text-xs font-medium text-center',
                config.textColor
              )}>
                Today: {todayHours}
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent-primary/50 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent-primary/50 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent-primary/50 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent-primary/50 rounded-br-lg" />
          </div>
        </motion.div>
      )}
    </div>
  )
}
