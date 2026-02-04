import { motion } from 'framer-motion'
import {
  Plane,
  Luggage,
  MapPin,
  Search,
  Calendar,
  Clock
} from 'lucide-react'
import { Button } from './Button'

type EmptyStateType = 'no-trips' | 'no-places' | 'no-itinerary'

interface EmptyStateProps {
  type: EmptyStateType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.15
    }
  }
}

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut'
  }
}

const Illustration = ({ type }: { type: EmptyStateType }) => {
  const baseIconClass = "transition-all duration-300"
  const glowClass = "drop-shadow-[0_0_12px_rgba(125,211,252,0.4)]"

  switch (type) {
    case 'no-trips':
      return (
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Background circle glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-pixel-glow/10 to-accent-primary/5 rounded-full blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Luggage icon - bottom layer */}
          <motion.div
            className="absolute left-6 top-12"
            variants={iconVariants}
            animate={floatAnimation}
          >
            <Luggage
              className={`${baseIconClass} ${glowClass} text-text-secondary`}
              size={48}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Plane icon - top layer */}
          <motion.div
            className="absolute right-4 top-8"
            variants={iconVariants}
            animate={{
              ...floatAnimation,
              rotate: [0, -5, 0]
            }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <Plane
              className={`${baseIconClass} ${glowClass} text-accent-primary group-hover:text-accent-secondary`}
              size={56}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Decorative dots */}
          <motion.div
            className="absolute left-12 top-6 w-2 h-2 bg-pixel-glow rounded-full"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute right-8 top-20 w-1.5 h-1.5 bg-accent-secondary rounded-full"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
          />
        </div>
      )

    case 'no-places':
      return (
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Background circle glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-pixel-glow/10 to-accent-primary/5 rounded-full blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Search icon - background */}
          <motion.div
            className="absolute left-8 top-14"
            variants={iconVariants}
            animate={{
              ...floatAnimation,
              rotate: [0, 10, 0]
            }}
          >
            <Search
              className={`${baseIconClass} ${glowClass} text-text-muted`}
              size={44}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* MapPin icon - foreground */}
          <motion.div
            className="absolute right-6 top-6"
            variants={iconVariants}
            animate={floatAnimation}
          >
            <MapPin
              className={`${baseIconClass} ${glowClass} text-accent-primary group-hover:text-accent-secondary`}
              size={52}
              strokeWidth={1.5}
              fill="currentColor"
              fillOpacity={0.2}
            />
          </motion.div>

          {/* Decorative map dots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-pixel-glow rounded-full"
              style={{
                left: `${30 + i * 15}%`,
                top: `${40 + i * 10}%`
              }}
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4
              }}
            />
          ))}
        </div>
      )

    case 'no-itinerary':
      return (
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Background circle glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-pixel-glow/10 to-accent-primary/5 rounded-full blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Calendar icon - base */}
          <motion.div
            className="absolute left-6 top-10"
            variants={iconVariants}
            animate={floatAnimation}
          >
            <Calendar
              className={`${baseIconClass} ${glowClass} text-text-secondary`}
              size={52}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Clock icon - overlay */}
          <motion.div
            className="absolute right-4 top-6"
            variants={iconVariants}
            animate={{
              ...floatAnimation,
              rotate: [0, 360]
            }}
            transition={{
              y: floatAnimation.transition,
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }
            }}
          >
            <Clock
              className={`${baseIconClass} ${glowClass} text-accent-primary group-hover:text-accent-secondary`}
              size={40}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Time marker dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-pixel-glow"
              style={{
                left: `${20 + i * 20}%`,
                bottom: '25%'
              }}
              animate={{
                opacity: [0.3, 0.9, 0.3],
                y: [0, -4, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      )
  }
}

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="group flex flex-col items-center justify-center py-16 px-6 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Illustration type={type} />

      <motion.h3
        className="text-xl font-semibold text-text-primary mb-2"
        variants={iconVariants}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-text-secondary max-w-md mb-6"
        variants={iconVariants}
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          variants={iconVariants}
        >
          <Button
            variant="primary"
            onClick={action.onClick}
            className="group/btn"
          >
            <span className="relative z-10">{action.label}</span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
