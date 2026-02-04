import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import type { Place } from '../../types/trip';

interface AIPreviewDiffProps {
  originalPlaces: Place[];
  dayAssignments: Record<string, number[]>;
  className?: string;
}

export function AIPreviewDiff({
  originalPlaces,
  dayAssignments,
  className = '',
}: AIPreviewDiffProps) {
  // Group by days
  const days = Object.entries(dayAssignments)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([dayNum, placeIds]) => ({
      dayNumber: parseInt(dayNum),
      places: placeIds.map((id) => originalPlaces.find((p) => p.id === id)).filter(Boolean) as Place[],
    }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Route Preview
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />
      </div>

      {/* Days */}
      <div className="space-y-5">
        {days.map((day, dayIndex) => (
          <motion.div
            key={day.dayNumber}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
            className="space-y-3"
          >
            {/* Day header */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-accent-primary/20 border border-accent-primary/40">
                <span className="text-xs font-semibold text-accent-primary">
                  Day {day.dayNumber}
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-accent-primary/20 to-transparent" />
            </div>

            {/* Places */}
            <div className="space-y-2 pl-4">
              {day.places.map((place, placeIndex) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.1 + placeIndex * 0.05 }}
                  className="flex items-start gap-3 group"
                >
                  {/* Order indicator */}
                  <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-accent-primary/30 flex items-center justify-center text-xs font-semibold text-accent-primary group-hover:border-accent-primary/60 transition-colors">
                      {placeIndex + 1}
                    </div>
                    {placeIndex < day.places.length - 1 && (
                      <div className="absolute left-[11px] top-8 w-0.5 h-8 bg-gradient-to-b from-accent-primary/30 to-transparent" />
                    )}
                  </div>

                  {/* Place card */}
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 rounded-md bg-slate-800/50 border border-white/10 group-hover:border-accent-primary/30 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-text-primary truncate">
                            {place.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            {place.category && (
                              <span className="text-xs text-text-secondary">
                                {place.category}
                              </span>
                            )}
                            {place.estimated_duration_minutes > 0 && (
                              <div className="flex items-center gap-1 text-text-secondary">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">
                                  {place.estimated_duration_minutes}min
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {days.length === 0 && (
        <div className="py-12 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary">
            No places assigned yet
          </p>
        </div>
      )}
    </div>
  );
}
