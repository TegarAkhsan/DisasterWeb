/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#020617',
          900: '#090d1f',
          800: '#0f172a',
          700: '#1e293b',
          blue: '#0284c7',
          cyan: '#06b6d4',
          neon: '#38bdf8',
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444',
          violet: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)' },
          'to': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
