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
        simba: {
          primary: "#EAB308", // Bright Gold
          secondary: "#1E3A8A", // Deep Navy
          accent: "#EF4444", // Red
          dark: "#0F172A", // Slate 900
          light: "#F8FAFC", // Slate 50
          blue: "#1E40AF",
          gold: "#FACC15",
          yellow: "#FEF08A"
        }
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
};
