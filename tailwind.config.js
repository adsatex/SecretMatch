/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'vino': '#7B1026',
        'pino': '#0b3d2e',
        'dorado': '#D4AF37',
        'nieve': '#F7FBFF'
      },
      fontFamily: {
        'merri': ['Merriweather', 'serif'],
        'mont': ['Montserrat', 'sans-serif']
      }
    },
  },
  plugins: [],
}