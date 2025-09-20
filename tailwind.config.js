/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'wine': {
          50: '#fdf2f2',
          100: '#fce7e7',
          200: '#fbd1d1',
          300: '#f7a6a6',
          400: '#f17575',
          500: '#e74c4c',
          600: '#d63447',
          700: '#b02a37',
          800: '#722F37',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};