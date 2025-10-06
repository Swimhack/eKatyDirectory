/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'brand': {
          50: '#f7f9f6',
          100: '#e8f0e6',
          200: '#d1e0cc',
          300: '#a8c49f',
          400: '#7da472',
          500: '#5d8454',
          600: '#4a6b42',
          700: '#3d5636',
          800: '#34462f',
          900: '#2c3b28',
        },
        'warm': {
          50: '#fdf8f3',
          100: '#faf0e6',
          200: '#f4ddc4',
          300: '#edc499',
          400: '#e4a56c',
          500: '#d18b4a',
          600: '#bd723f',
          700: '#9e5c36',
          800: '#804c32',
          900: '#68402b',
        },
        'earth': {
          50: '#f9f7f4',
          100: '#f1ede6',
          200: '#e2dace',
          300: '#cfc2ab',
          400: '#b8a382',
          500: '#a08968',
          600: '#8a7456',
          700: '#725f49',
          800: '#5f4f40',
          900: '#4f4238',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}