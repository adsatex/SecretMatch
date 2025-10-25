/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        rojoNavidad: '#B91C1C',
        verdePino: '#065F46',
        dorado: '#F59E0B'
      }
    }
  },
  plugins: [],
}
