/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#fcfcfc',
          card: '#ffffff',
          sidebar: '#f7f6f3',
          border: '#e9e9e7',
          hover: '#efefe0',
          hoverLight: '#f1f1ef',
          text: '#37352f',
          muted: '#787774',
          darkBg: '#191919',
          darkCard: '#202020',
          darkSidebar: '#1e1e1e',
          darkBorder: '#2f2f2f',
          darkHover: '#2a2a2a',
          darkText: '#d4d4d4',
          darkMuted: '#9b9b9b',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        }
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      blur: {
        'xs': '2px',
      },
      borderRadius: {
        'xs': '2px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
