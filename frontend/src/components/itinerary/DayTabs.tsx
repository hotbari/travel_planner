import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Calendar, Plane, MapPin } from 'lucide-react'

interface DayTabsProps {
  days: Array<{
    day_number: number
    date: string  // ISO date string
    day_type: 'arrival' | 'middle' | 'departure'
  }>
  activeDay: number
  onDayChange: (dayNumber: number) => void
}

const dayTypeConfig = {
  arrival: {
    label: 'Arrival',
    icon: Plane,
    color: 'from-emerald-500 to-green-600',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/50'
  },
  middle: {
    label: 'Explore',
    icon: MapPin,
    color: 'from-sky-500 to-blue-600',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/50'
  },
  departure: {
    label: 'Departure',
    icon: Plane,
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/50'
  }
}

export function DayTabs({ days, activeDay, onDayChange }: DayTabsProps) {
  const activeDate = days.find(d => d.day_number === activeDay)

  return (
    <div className="space-y-4">
      {/* Horizontal Tabs */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {days.map((day, index) => {
            const isActive = day.day_number === activeDay
            const config = dayTypeConfig[day.day_type]
            const Icon = config.icon

            return (
              <motion.button
                key={day.day_number}
                onClick={() => onDayChange(day.day_number)}
                className={`
                  relative flex-shrink-0 px-6 py-3 rounded-lg
                  font-medium text-sm tracking-wide
                  border-2 transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-r ' + config.color + ' text-white border-transparent shadow-glow-sky'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300'
                  }
                `}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>Day {day.day_number}</span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                    layoutId="activeTab"
                  >
                    <div className="w-2 h-2 rounded-full bg-white shadow-glow-ice" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Subtle underline decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* Active Day Info Card */}
      {activeDate && (
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/50 backdrop-blur-sm"
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${dayTypeConfig[activeDate.day_type].color}`} />

          <div className="p-5 flex items-center justify-between">
            {/* Date display */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-700/50 border border-slate-600">
                  <Calendar className="w-5 h-5 text-accent-secondary" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white tracking-tight">
                    {format(parseISO(activeDate.date), 'MMMM d, yyyy')}
                  </div>
                  <div className="text-sm text-slate-400 mt-0.5">
                    {format(parseISO(activeDate.date), 'EEEE')}
                  </div>
                </div>
              </div>
            </div>

            {/* Day type badge */}
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              border ${dayTypeConfig[activeDate.day_type].badgeBorder}
              ${dayTypeConfig[activeDate.day_type].badgeBg}
            `}>
              {(() => {
                const Icon = dayTypeConfig[activeDate.day_type].icon
                return <Icon className={`w-4 h-4 ${dayTypeConfig[activeDate.day_type].badgeText}`} />
              })()}
              <span className={`text-sm font-medium ${dayTypeConfig[activeDate.day_type].badgeText}`}>
                {dayTypeConfig[activeDate.day_type].label}
              </span>
            </div>
          </div>

          {/* Subtle texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.05),transparent_70%)] pointer-events-none" />
        </motion.div>
      )}
    </div>
  )
}
