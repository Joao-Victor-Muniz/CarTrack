/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        app: {
          bg: '#050505',
          card: '#111111',
          cardInner: '#1A1A1A',
          accent: '#FACC15',
          accentHover: '#EAB308',
          border: '#262626',
          text: '#F5F5F5',
          textMuted: '#A3A3A3'
        }
      }
    },
  },
  plugins: [],
}
