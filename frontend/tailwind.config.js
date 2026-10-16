/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070B14',
        card: 'rgba(15, 23, 42, 0.8)',
        cardBorder: 'rgba(103, 232, 249, 0.2)',
        cyanAccent: '#00F0FF',
        emeraldRoute: '#10B981',
        coralHazard: '#F43F5E',
        amberPriority: '#F59E0B',
        lightSlate: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
