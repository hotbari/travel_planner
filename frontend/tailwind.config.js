/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core dark theme
        'bg-primary': '#1a1a2e',
        'bg-secondary': '#16213e',
        'bg-card': '#1f2937',
        'bg-card-hover': '#374151',

        // Neon accents
        'accent-cyan': '#00d4ff',
        'accent-pink': '#ff6b9d',
        'accent-purple': '#c4b5fd',
        'accent-green': '#4ade80',
        'accent-amber': '#fbbf24',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'main': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-pink': '0 0 20px rgba(255, 107, 157, 0.3)',
        'glow-soft': '0 0 40px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' },
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
