/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FEF5F4',
          100: '#FCE9E7',
          200: '#F8C8C4',
          300: '#F2A099',
          400: '#EB6E64',
          500: '#E0443A', // Primary Coral Red
          600: '#C9322B', // Hover Red
          700: '#A9241E',
          800: '#891F1A',
          900: '#711F1B'
        },
        surface: {
          pink: '#FCE9E7',
          border: '#F2C7C3'
        },
        brand: {
          text: '#191919',
          muted: '#666666',
          success: '#238636',
          warning: '#D97706'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
