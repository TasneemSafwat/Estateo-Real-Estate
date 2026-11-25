/** @type {import('tailwindcss').Config} */

/**
 * Tailwind 3 only ships opacity steps in multiples of 5. The UI uses finer
 * steps (e.g. `bg-white/12`, `from-brand-950/92`), which would otherwise
 * generate no CSS and silently drop overlays, borders and tints. Registering
 * every integer from 0 to 100 makes all of them work.
 */
const opacityScale = Object.fromEntries(
  Array.from({ length: 101 }, (_, value) => [String(value), String(value / 100)]),
);

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        '2xl': '1360px',
      },
    },
    extend: {
      opacity: opacityScale,
      colors: {
        /* Brand — deep petrol teal */
        brand: {
          50: '#F1F7F7',
          100: '#DDEBEC',
          200: '#BAD6D8',
          300: '#8CB9BD',
          400: '#5C969C',
          500: '#3A7780',
          600: '#2A5E67',
          700: '#1F4A52',
          800: '#153A41',
          900: '#0E2B31',
          950: '#081C20',
        },
        /* Accent — saffron amber */
        accent: {
          50: '#FFF9EB',
          100: '#FEF0C9',
          200: '#FCE08F',
          300: '#F9CB57',
          400: '#F5B72E',
          500: '#E89F12',
          600: '#C47C0A',
          700: '#9B5B0C',
          800: '#7C4810',
          900: '#663C11',
        },
        /* Neutral — cool mist */
        mist: {
          50: '#F7F9F9',
          100: '#EEF2F2',
          200: '#E1E8E8',
          300: '#CBD6D6',
          400: '#AEBDBD',
          500: '#8FA0A1',
          600: '#718384',
          700: '#596A6B',
          800: '#455354',
          900: '#364243',
        },
        /* Semantic tokens (theme aware, use CSS variables) */
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        elevated: 'rgb(var(--c-elevated) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        subtle: 'rgb(var(--c-subtle) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          'IBM Plex Sans Arabic',
          'Readex Pro',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        arabic: ['IBM Plex Sans Arabic', 'Readex Pro', 'sans-serif'],
        display: ['Readex Pro', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(14, 43, 49, 0.05), 0 10px 30px -18px rgba(14, 43, 49, 0.22)',
        card: '0 1px 3px rgba(14, 43, 49, 0.06), 0 16px 40px -22px rgba(14, 43, 49, 0.30)',
        lift: '0 2px 6px rgba(14, 43, 49, 0.08), 0 30px 60px -26px rgba(14, 43, 49, 0.42)',
        inset: 'inset 0 0 0 1px rgba(14, 43, 49, 0.07)',
        glow: '0 0 0 1px rgba(245, 183, 46, 0.35), 0 18px 50px -18px rgba(232, 159, 18, 0.55)',
      },
      backgroundImage: {
        grain: 'radial-gradient(circle at 1px 1px, rgba(14,43,49,0.06) 1px, transparent 0)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.65' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.25s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float-y': 'float-y 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
