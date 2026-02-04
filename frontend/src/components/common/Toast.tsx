import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertTriangle, Info, XCircle } from 'lucide-react'
import clsx from 'clsx'
import { useToastStore } from '../../stores/toastStore'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose: () => void
}

function Toast({ type, message, onClose }: Omit<ToastProps, 'id'>) {
  const icons = {
    success: Check,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const Icon = icons[type]

  const typeStyles = {
    success: {
      bg: 'bg-green-500/20 border-green-500/50',
      text: 'text-green-500',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
      iconBg: 'bg-green-500/30',
    },
    error: {
      bg: 'bg-red-500/20 border-red-500/50',
      text: 'text-red-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
      iconBg: 'bg-red-500/30',
    },
    warning: {
      bg: 'bg-amber-500/20 border-amber-500/50',
      text: 'text-amber-500',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      iconBg: 'bg-amber-500/30',
    },
    info: {
      bg: 'bg-sky-500/20 border-sky-500/50',
      text: 'text-sky-500',
      glow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]',
      iconBg: 'bg-sky-500/30',
    },
  }

  const style = typeStyles[type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={clsx(
        'relative flex items-start gap-3 p-4 pr-12 rounded-lg border backdrop-blur-md min-w-[320px] max-w-[420px]',
        style.bg,
        style.glow
      )}
    >
      {/* Icon container */}
      <div className={clsx('flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center', style.iconBg)}>
        <Icon className={clsx('w-5 h-5', style.text)} strokeWidth={2.5} />
      </div>

      {/* Message */}
      <div className="flex-1 pt-0.5">
        <p className="text-white text-sm font-medium leading-relaxed">{message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className={clsx(
          'absolute top-3 right-3 p-1 rounded transition-colors',
          'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20',
          style.text
        )}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Corner decorations - matching Card component style */}
      <div className={clsx('absolute top-0 left-0 w-2 h-2 border-t border-l', style.text, 'opacity-70')} />
      <div className={clsx('absolute top-0 right-0 w-2 h-2 border-t border-r', style.text, 'opacity-70')} />
      <div className={clsx('absolute bottom-0 left-0 w-2 h-2 border-b border-l', style.text, 'opacity-70')} />
      <div className={clsx('absolute bottom-0 right-0 w-2 h-2 border-b border-r', style.text, 'opacity-70')} />

      {/* Animated progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        className={clsx('absolute bottom-0 left-0 h-0.5 origin-left', style.text, 'opacity-60')}
        style={{ width: '100%' }}
      />
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Export hook for easy access
export { useToastStore }
