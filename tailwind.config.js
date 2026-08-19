/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta tirada da logo oficial (emblema roxo, astronautas, amora,
        // detalhes rosa/dourado). Ver public/brand/logo-badge.png.
        amora: {
          950: "#2A0F47",
          900: "#3B1666",
          800: "#4C1D85",
          700: "#5D26A3",
          600: "#7331BF",
          500: "#8B4FD1",
          400: "#AB7CE0",
          300: "#CDACEF",
          200: "#E6D6F8",
          100: "#F3EAFC",
          50: "#FAF5FE",
        },
        rosa: {
          600: "#D6297E",
          500: "#EC4899",
          400: "#F472B6",
          300: "#F9A8D4",
          200: "#FBCFE8",
          100: "#FDE6F3",
        },
        dourado: "#FBBF24",
        folha: "#6FA84B",
        paper: "#FCFAFF",
        ink: "#2A1B3D",
      },
      fontFamily: {
        // Carregadas via next/font em app/layout.tsx (self-hosted, sem
        // depender de link externo pro Google Fonts em runtime).
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 50px rgba(139, 79, 209, 0.45)",
        card: "0 4px 24px rgba(58, 22, 102, 0.08)",
        "card-hover": "0 16px 40px rgba(139, 79, 209, 0.25)",
        soft: "0 2px 12px rgba(58, 22, 102, 0.06)",
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-slower": "float-slow 9s ease-in-out infinite",
        "float-down": "float-down 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.6s ease-out both",
        twinkle: "twinkle 2.6s ease-in-out infinite",
        "shine-sweep": "shine-sweep 5s ease-in-out infinite",
        "spin-slow": "spin 14s linear infinite",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "float-down": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(14px) rotate(-3deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        "shine-sweep": {
          "0%, 55%": { transform: "translateX(-120%) skewX(-12deg)" },
          "80%, 100%": { transform: "translateX(220%) skewX(-12deg)" },
        },
      },
    },
  },
  plugins: [],
};
