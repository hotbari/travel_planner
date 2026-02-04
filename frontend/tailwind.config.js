/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds (Frost Winter Theme)
        'bg-primary': '#0f172a',      // Deep night blue
        'bg-secondary': '#1e293b',    // Evening slate
        'bg-card': '#1e3a5f',         // Card background
        'bg-card-hover': '#2d4a6f',   // Card hover

        // Accent colors
        'accent-primary': '#0ea5e9',   // Sky blue
        'accent-secondary': '#38bdf8', // Light ice blue
        'accent-highlight': '#f0f9ff', // Frost white

        // Text
        'text-primary': '#f0f9ff',     // Frost white
        'text-secondary': '#94a3b8',   // Muted slate
        'text-muted': '#64748b',       // Dark muted

        // Pixel accents
        'pixel-glow': '#7dd3fc',       // Ice glow
        'pixel-border': '#38bdf8',     // Pixel border

        // Status colors
        'status-open': '#4ade80',      // Green - within business hours
        'status-closing': '#fbbf24',   // Yellow - near closing
        'status-closed': '#f87171',    // Red - outside hours
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'main': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-sky': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-ice': '0 0 20px rgba(125, 211, 252, 0.3)',
        'glow-soft': '0 0 40px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(14, 165, 233, 0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
