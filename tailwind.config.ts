import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        text: "var(--text)",
        "neon-green": "var(--neon-green)",
        "neon-purple": "var(--neon-purple)",
        "neon-pink": "var(--neon-pink)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Orbitron", "sans-serif"],
      },
      animation: {
        "text-shimmer": "text-shimmer 2.5s ease-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "text-shimmer": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            filter: "brightness(100%)",
          },
          "50%": {
            opacity: "0.8",
            filter: "brightness(150%)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
