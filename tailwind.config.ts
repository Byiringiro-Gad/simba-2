/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Simba Original Brand Colors (from simba-2-ebon.vercel.app) ──────
        brand: {
          DEFAULT:        '#EAB308',   // Gold — primary CTA, buttons
          dark:           '#CA8A04',   // Darker gold for hover
          light:          '#FACC15',   // Lighter gold
          muted:          '#FEF9C3',   // Very light gold bg (light mode)
          'muted-dark':   '#1C1A00',   // Dark gold bg (dark mode)
          accent:         '#EAB308',   // Same as DEFAULT (alias)
          'accent-dark':  '#CA8A04',
          'accent-light': '#FEF9C3',
          blue:           '#1E40AF',   // Deep blue — secondary
          'blue-light':   '#DBEAFE',   // Light blue bg
          'bg-dark':      '#0F172A',   // Simba dark background
          success:        '#16A34A',   // Green
          error:          '#DC2626',   // Red
          warning:        '#D97706',   // Amber
          // Neutral warm tones
          'neutral-50':   '#F8FAFC',
          'neutral-100':  '#F1F5F9',
          'neutral-200':  '#E2E8F0',
          'neutral-300':  '#CBD5E1',
          'neutral-400':  '#94A3B8',
          'neutral-500':  '#64748B',
          'neutral-600':  '#475569',
          'neutral-700':  '#334155',
          'neutral-800':  '#1E293B',
          'neutral-900':  '#0F172A',
          'neutral-950':  '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'brand-sm':  '0 1px 3px 0 rgba(234,179,8,0.15)',
        'brand-md':  '0 4px 12px 0 rgba(234,179,8,0.25)',
        'brand-lg':  '0 8px 24px 0 rgba(234,179,8,0.30)',
        'brand-xl':  '0 16px 40px 0 rgba(234,179,8,0.35)',
      },
      animation: {
        'shimmer':    'shimmer 1.5s linear infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        bounceIn:  { from: { opacity: '0', transform: 'scale(0.75)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
