/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf0',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          DEFAULT: '#006400',
        },
        kenya: {
          red:   '#BB0000',
          green: '#006400',
          black: '#1a1a1a',
          gold:  '#FFD700',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #006400 0%, #1a5c38 50%, #1a1a2e 100%)',
        'card-gradient': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(0,100,0,0.10)',
        'card-hover': '0 8px 40px rgba(0,100,0,0.18)',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease-out',
        'fade-in':   'fadeIn 0.4s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'check':     'checkBounce 0.6s cubic-bezier(0.175,0.885,0.32,1.275)',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        checkBounce: {
          '0%':   { transform: 'scale(0)' },
          '70%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
