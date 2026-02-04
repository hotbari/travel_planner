import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface GreetingDisplayProps {
  greeting: string
  countryName: string
  localName?: string
}

export function GreetingDisplay({ greeting, countryName, localName }: GreetingDisplayProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  const glowVariants = {
    initial: { opacity: 0.3, scale: 0.95 },
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [0.95, 1.05, 0.95],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0, rotate: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: 0.5,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative flex flex-col items-center justify-center py-16 px-8"
    >
      {/* Animated glow background */}
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Decorative sparkles */}
      <motion.div
        variants={sparkleVariants}
        initial="initial"
        animate="animate"
        className="absolute top-8 left-1/4 text-pixel-glow"
        aria-hidden="true"
      >
        <Sparkles size={20} />
      </motion.div>
      <motion.div
        variants={sparkleVariants}
        initial="initial"
        animate="animate"
        className="absolute top-12 right-1/4 text-accent-secondary"
        style={{ animationDelay: '0.8s' }}
        aria-hidden="true"
      >
        <Sparkles size={16} />
      </motion.div>

      {/* Main content container with pixel border */}
      <div className="relative">
        {/* Pixel-style corner decorations */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-pixel-border opacity-60" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-pixel-border opacity-60" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-pixel-border opacity-60" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-pixel-border opacity-60" />

        {/* Main greeting text */}
        <motion.div
          variants={itemVariants}
          className="relative text-center mb-4"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary tracking-wide relative">
            {/* Text glow effect */}
            <span
              className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-pixel-glow to-accent-primary blur-sm"
              aria-hidden="true"
            >
              {greeting}
            </span>
            {/* Main text */}
            <span className="relative drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]">
              {greeting}
            </span>
          </h1>
        </motion.div>

        {/* Decorative divider */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3 mb-4"
          aria-hidden="true"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-pixel-border to-transparent" />
          <div className="w-1.5 h-1.5 bg-pixel-glow rounded-full shadow-glow-ice animate-pulse" />
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-pixel-border to-transparent" />
        </motion.div>

        {/* Country name text */}
        <motion.div
          variants={itemVariants}
          className="text-center"
        >
          <p className="text-xl md:text-2xl text-text-secondary font-medium tracking-wide">
            Welcome to{' '}
            <span className="text-accent-primary font-semibold">
              {countryName}
            </span>
            {localName && (
              <span className="ml-3 text-text-muted italic">
                ({localName})
              </span>
            )}
          </p>
        </motion.div>

        {/* Subtle bottom accent line */}
        <motion.div
          variants={itemVariants}
          className="mt-6 h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-accent-secondary/50 to-transparent rounded-full"
          aria-hidden="true"
        />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pixel-glow/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
