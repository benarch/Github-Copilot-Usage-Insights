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
        // Primary colors from GitHub Copilot Insights
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Success/Agent adoption green
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Chart colors
        chart: {
          blue: '#2563eb',
          lightBlue: '#93c5fd',
          green: '#22c55e',
          lightGreen: '#86efac',
          purple: '#8b5cf6',
          orange: '#f97316',
          cyan: '#06b6d4',
        },
        // Gray scale matching GitHub UI
        github: {
          bg: '#ffffff',
          bgSecondary: '#f6f8fa',
          border: '#d0d7de',
          borderLight: '#e5e7eb',
          text: '#1f2937',
          textSecondary: '#6b7280',
          textMuted: '#9ca3af',
        },
        // GitHub Dark mode colors
        dark: {
          bg: '#0d1117',
          bgSecondary: '#161b22',
          bgTertiary: '#21262d',
          border: '#30363d',
          text: '#e6edf3',
          textSecondary: '#8b949e',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        cardHover: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
        dropdown: '0 8px 24px rgba(149,157,165,0.2)',
        'dark-dropdown': '0 8px 24px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
}
