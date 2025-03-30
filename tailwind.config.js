/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        secondary: {
          50: '#f0e7ff',
          100: '#e2cfff',
          200: '#c49eff',
          300: '#a76eff',
          400: '#8a3eff',
          500: '#7928CA',
          600: '#6020a1',
          700: '#471879',
          800: '#2f1050',
          900: '#180828',
        },
        accent: {
          50: '#e6fbff',
          100: '#ccf7ff',
          200: '#99eeff',
          300: '#66e5ff',
          400: '#33dcff',
          500: '#00d3ff',
          600: '#00a9cc',
          700: '#007f99',
          800: '#005466',
          900: '#002a33',
        },
        dark: {
          50: 'var(--color-dark-50)',
          100: 'var(--color-dark-100)',
          200: 'var(--color-dark-200)',
          300: 'var(--color-dark-300)',
          400: 'var(--color-dark-400)',
          500: 'var(--color-dark-500)',
          600: 'var(--color-dark-600)',
          700: 'var(--color-dark-700)',
          800: 'var(--color-dark-800)',
          900: 'var(--color-dark-900)',
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/hero-bg.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 15px 5px rgba(0, 114, 255, 0.3)',
        'inner-glow': 'inset 0 0 15px 3px rgba(0, 114, 255, 0.2)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 