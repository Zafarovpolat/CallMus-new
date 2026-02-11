/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', '-apple-system', 'Roboto', 'Helvetica', 'sans-serif'],
      },
      colors: {
        primary: '#8c59d0',
        secondary: '#a67dd8',
        accent: '#d4b8f7',
        background: {
          DEFAULT: '#f8f5ff',
          gradient: {
            from: '#8c59d0',
            via: '#9d6ad6',
            to: '#7c4cc0',
          },
        },
        text: '#4a4a4a',
        white: '#ffffff',
        black: '#000000',
      },
      boxShadow: {
        '2xl': '0 10px 15px -3px rgba(108,62,244,0.2), 0 4px 6px -2px rgba(108,62,244,0.15)',
        '3xl': '0 20px 25px -5px rgba(108,62,244,0.25), 0 10px 10px -5px rgba(108,62,244,0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        full: '9999px',
      },
      backdropBlur: {
        sm: '4px',
      },
    },
  },
  plugins: [],
}