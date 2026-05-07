/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0d12',
          panel: '#11141b',
          subtle: '#161a23',
          hover: '#1c2230',
        },
        border: {
          DEFAULT: '#232838',
          subtle: '#1a1e2a',
        },
        text: {
          DEFAULT: '#e6e9ef',
          muted: '#8b93a7',
          dim: '#5b6378',
        },
        accent: {
          DEFAULT: '#7c5cff',
          hover: '#8e72ff',
          subtle: '#7c5cff20',
        },
        success: '#3fb950',
        warning: '#d29922',
        danger: '#f85149',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
