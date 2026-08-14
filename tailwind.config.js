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
        nike: {
          ink: '#111111',
          canvas: '#ffffff',
          'soft-cloud': '#f5f5f5',
          charcoal: '#39393b',
          ash: '#4b4b4d',
          mute: '#707072',
          stone: '#9e9ea0',
          hairline: '#cacacb',
          'hairline-soft': '#e5e5e5',
          sale: '#d30005',
          'sale-deep': '#780700',
          success: '#007d48',
          'success-bright': '#1eaa52',
          info: '#1151ff',
          'info-deep': '#0034e3',
          'accent-pink': '#ed1aa0',
          'accent-pink-soft': '#ffb0dd',
          'accent-purple-soft': '#beaffd',
          'accent-purple-pale': '#d6d1ff',
          'accent-teal': '#0a7281',
          'accent-pink-deep': '#4c012d',
          // High-contrast Dark mode surfaces & borders
          'dark-surface': '#111111',
          'dark-elevated': '#1a1a1a',
          'dark-card': '#222222',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Anton', 'Impact', 'sans-serif'],
        sans: ['"IBM Plex Sans Thai"', '"Noto Sans Thai"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '18px',
        md: '24px',
        lg: '30px',
        full: '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        'section': '48px',
      },
      fontSize: {
        'campaign': ['96px', { lineHeight: '0.9', fontWeight: '400' }],
        'campaign-md': ['64px', { lineHeight: '0.9', fontWeight: '400' }],
        'campaign-sm': ['48px', { lineHeight: '0.9', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}
