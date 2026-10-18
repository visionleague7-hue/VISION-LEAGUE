import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080808",
        foreground: "#f0f0f0",
        dark: {
          950: "#050505",
          900: "#0a0a0a",
          850: "#111111",
          800: "#181818",
          750: "#1f1f1f",
          700: "#2a2a2a",
          600: "#3a3a3a",
        },
        brand: {
          red: "#e8000d",
          "red-dark": "#9b0008",
          "red-light": "#ff1a24",
          silver: "#b0b8c4",
          "silver-dark": "#7a8490",
          "silver-light": "#d4dce6",
          // mantidos para compatibilidade
          cyan: "#e8000d",
          purple: "#b0b8c4",
          emerald: "#10b981",
          gold: "#f59e0b",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-red": "radial-gradient(circle, rgba(232,0,13,0.18) 0%, rgba(0,0,0,0) 70%)",
        "glow-silver": "radial-gradient(circle, rgba(176,184,196,0.12) 0%, rgba(0,0,0,0) 70%)",
        // aliases antigos para não quebrar classes existentes
        "glow-cyan": "radial-gradient(circle, rgba(232,0,13,0.15) 0%, rgba(0,0,0,0) 70%)",
        "glow-purple": "radial-gradient(circle, rgba(176,184,196,0.12) 0%, rgba(0,0,0,0) 70%)",
      },
      boxShadow: {
        "neon-red":    "0 0 20px -3px rgba(232, 0, 13, 0.5)",
        "neon-silver": "0 0 20px -3px rgba(176, 184, 196, 0.3)",
        "neon-glow":   "0 0 25px rgba(232, 0, 13, 0.3), 0 0 50px rgba(176, 184, 196, 0.15)",
        // aliases antigos para não quebrar classes existentes
        "neon-cyan":   "0 0 20px -3px rgba(232, 0, 13, 0.5)",
        "neon-purple": "0 0 20px -3px rgba(176, 184, 196, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
