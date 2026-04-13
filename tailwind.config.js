/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#5b4ff5',
          50: '#f0eeff',
          100: '#e0dcff',
          200: '#c5bcff',
          300: '#a193ff',
          400: '#7c6fff',
          500: '#5b4ff5',
          600: '#4a3de0',
          700: '#3b2fc0',
          800: '#2d239a',
          900: '#1e1870',
        },
        dark: {
          bg: '#0c0b14',
          surface: '#12111e',
          elevated: '#1a1830',
          border: '#1e1c30',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease both',
        'slide-in': 'slideIn 0.3s ease both',
        'pulse-dot': 'pulse 2s infinite',
        'slide-up': 'slideUp 0.3s ease both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
