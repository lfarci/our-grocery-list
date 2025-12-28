/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        honey: '#F6D85E',
        cream: '#FFF6DF',
        softblue: '#3A78D8',
        freshgreen: '#4CAF50',
        softmint: '#DFF2E1',
        basketbrown: '#C98A3A',
        mutedcoral: '#E57373',
        warmcharcoal: '#3A2E1F',
        softbrowngray: '#6F6254',
        warmsand: '#EADFC8',
      },
    },
  },
  plugins: [],
}
