/**
 * COR-HARP Tailwind Configuration
 *
 * Brand colors extracted directly from hairp_app/app.py constants.
 * Do NOT use arbitrary Tailwind defaults for brand elements — always
 * reference these custom values (e.g., `bg-un-blue`, `text-un-navy`).
 *
 * TEMP-DOCS: This config maps every official UN/COR-HARP color to a
 * Tailwind utility so the frontend matches the Streamlit app exactly.
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        /* ── Official UN / COR-HARP brand palette ── */
        'un-navy':       '#1F4E79',
        'un-blue':       '#009EDB',
        'un-light-blue': '#4BA3E3',
        'un-gray':       '#5A6872',
        'un-light-gray': '#F0F2F5',
        'un-white':      '#FFFFFF',
        'un-red':        '#CF3A24',
        'un-amber':      '#F5A623',
        'un-green':      '#2E8540',

        /* ── Dark theme palette ── */
        'dark-bg':      '#0B0E17',
        'dark-card':    '#131825',
        'dark-sidebar': '#080B12',
        'dark-text':    '#E0E6ED',
        'dark-border':  '#1E2A3A',

        /* ── Tailwind-neutral aliases for text hierarchy ── */
        'surface': {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      borderRadius: {
        'card': '14px',
        'card-lg': '16px',
        'btn': '8px',
      },
      boxShadow: {
        'glass':   '0 12px 40px rgba(0, 0, 0, 0.4)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 158, 219, 0.25)',
        'glow-red':  '0 0 20px rgba(207, 58, 36, 0.25)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-lg': '20px',
      },
      animation: {
        'fade-in':        'fadeIn 0.5s ease both',
        'fade-in-up':     'fadeInUp 0.5s ease both',
        'fade-in-down':   'fadeInDown 0.5s ease both',
        'slide-in':       'slideIn 0.4s ease both',
        'marquee':        'marqueeScroll 60s linear infinite',
        'skeleton-shimmer': 'skeletonShimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        marqueeScroll: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        skeletonShimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};
