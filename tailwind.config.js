/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govt: {
          navy: '#0f2b5c',
          navyDark: '#091c3d',
          blue: '#1e3a8a',
          blueLight: '#f0f5ff',
          saffron: '#ea580c',
          saffronDark: '#c2410c',
          saffronLight: '#fff7ed',
          green: '#15803d',
          greenLight: '#f0fdf4',
          grayBg: '#f8fafc',
          grayBorder: '#cbd5e1',
          textDark: '#1e293b',
          textMuted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
