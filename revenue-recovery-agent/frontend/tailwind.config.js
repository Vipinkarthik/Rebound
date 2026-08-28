/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          900: '#0a192f',
        },
        recovered: {
          light: '#ecfdf5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        stopped: {
          light: '#f1f5f9',
          DEFAULT: '#64748b',
          dark: '#334155',
        },
        deferred: {
          light: '#fffbeb',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        }
      }
    },
  },
  plugins: [],
}
