/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "main-primary": "#0D1D28",
        "main-secondary": "#192833",
        "extra-primary": "#34ACC5",
        "extra-secondary": "#2B3E4A",
      },
    },
  },
  plugins: [],
};
