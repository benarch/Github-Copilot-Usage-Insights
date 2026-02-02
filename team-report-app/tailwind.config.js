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
        github: {
          bg: '#ffffff',
          bgSecondary: '#f6f8fa',
          border: '#d0d7de',
          text: '#24292f',
          textSecondary: '#57606a',
        },
        dark: {
          bg: '#0d1117',
          bgSecondary: '#161b22',
          bgTertiary: '#21262d',
          border: '#30363d',
          text: '#c9d1d9',
          textSecondary: '#8b949e',
        }
      }
    },
  },
  plugins: [],
}
