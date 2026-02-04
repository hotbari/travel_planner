import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  variant?: 'default' | 'inventory' | 'quest' | 'hud'
  glow?: boolean
}

export function Card({
  children,
  variant = 'default',
  glow = false,
  className,
  ...props
}: CardProps) {
  const baseClasses = 'relative rounded-lg p-4 overflow-hidden border backdrop-blur-sm'

  const variantClasses = {
    default: 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-white/10',
    inventory: 'bg-slate-800/80 border-2 border-slate-600/50 shadow-inner shadow-black/30 hover:border-sky-500/50 transition-colors duration-200',
    quest: 'bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-l-4 border-l-accent-primary border-white/10 pl-6',
    hud: 'bg-black/60 border-accent-primary/30 font-mono text-sm',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        glow && 'glow-border',
        className
      )}
      {...props}
    >
      {children}

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent-primary/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent-primary/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent-primary/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent-primary/50" />
    </motion.div>
  )
}
