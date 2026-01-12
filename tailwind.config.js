/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        galaxy: {
          dark: "#0f172a",
          primary: "#2563eb",
          light: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};