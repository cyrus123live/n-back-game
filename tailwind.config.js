/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ef',
          100: '#dceeda',
          200: '#b9ddb5',
          300: '#8ec587',
          400: '#6aae62',
          500: '#538d4e',
          600: '#497d44',
          700: '#3d6839',
          800: '#33542f',
          900: '#2b4528',
          950: '#142513',
        },
        surface: '#fafaf8',
        card: '#ffffff',
        'card-border': '#e5e2d9',
        'secondary-surface': '#f5f5f0',
        'text-primary': '#1a1a1a',
        'text-secondary': '#3a3a3a',
        'text-muted': '#787774',
      },
      fontFamily: {
        heading: ['"Libre Franklin"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-in': 'bounceIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fly-up': 'flyUp 1.5s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.25s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        flyUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-80px)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
