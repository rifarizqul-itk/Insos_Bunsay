/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#8B1A1A',
          dark: '#6B1414',
          50: '#FDF2F2',
          100: '#FADADD',
        },
        cream: '#FBF7F2',
        'warm-gray': '#F5F0EB',
        border: '#E8E0D8',
        text: {
          DEFAULT: '#1A1410',
          2: '#5C4F46',
          3: '#9E8E82',
        },
        green: {
          DEFAULT: '#1A6B3A',
          bg: '#E8F5EE',
        },
        orange: {
          DEFAULT: '#C05C00',
          bg: '#FEF3E6',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        // Custom sizes untuk inline style original
        '3.5xl': ['32px', { lineHeight: '1.2', fontWeight: '800' }],
        '2.5xl': ['26px', { lineHeight: '1.3', fontWeight: '800' }],
        '4.5xl': ['42px', { lineHeight: '1.1', fontWeight: '725' }],
        'sm': ['15px', { lineHeight: '1.6' }], // override default 14px
        'base': ['15px', { lineHeight: '1.6' }],
        'xs': ['13px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        md: '10px',
        lg: '18px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(139,26,26,0.08)',
      },
      spacing: {
        '4.5': '1.125rem', // 18px
      },
    },
  },
  plugins: [],
}
