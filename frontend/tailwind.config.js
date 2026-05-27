/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shimmer': 'shimmer 1.4s infinite',
        'fade-up': 'fadeInUp 0.5s ease both',
      },
    },
  },
  plugins: [],
}
