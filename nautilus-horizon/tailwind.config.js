/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF6A00',
        'background': '#0B0B0B',
        'accent-a': '#D90429',
        'accent-b': '#FFFFFF',
        'card': '#1C1C1E',
        'subtle': '#3A3A3C',
        'text-primary': '#FFFFFF',
        'text-secondary': '#E5E5E7',
        'text-muted': '#A1A1AA',
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      borderRadius: {
        'soft': '1.2rem',
      },
    },
  },
  plugins: [],
}


