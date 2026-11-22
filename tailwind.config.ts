import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#173B67",
          dark: "#0F2644",
          light: "#214E87",
        },
        secondary: {
          DEFAULT: "#285B91",
          light: "#3772B3",
        },
        accent: {
          DEFAULT: "#4B8FE8",
          hover: "#3B7DDA",
          soft: "#E0ECFC",
        },
        navy: {
          50: "#F4F8FD",
          100: "#EAF2FC",
          200: "#D3E4F9",
          300: "#ACCBF4",
          400: "#7CAEED",
          500: "#4B8FE8",
          600: "#285B91",
          700: "#1E4774",
          800: "#173B67",
          900: "#102847",
          950: "#09172B",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.70)",
          card: "rgba(255, 255, 255, 0.75)",
          border: "rgba(255, 255, 255, 0.60)",
          hover: "rgba(255, 255, 255, 0.85)",
          subtle: "rgba(255, 255, 255, 0.45)",
          dark: "rgba(23, 59, 103, 0.08)",
        },
        success: {
          DEFAULT: "#16A675",
          light: "#E3F7F0",
          dark: "#0F7A56",
        },
        expense: {
          DEFAULT: "#E15B67",
          light: "#FDF0F1",
          dark: "#B83A46",
        },
        text: {
          primary: "#172B46",
          secondary: "#71839B",
          muted: "#94A3B8",
        },
      },
      borderRadius: {
        "2.5xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(23, 59, 103, 0.08)",
        "glass-lg": "0 12px 40px 0 rgba(23, 59, 103, 0.12)",
        "glass-sm": "0 4px 16px 0 rgba(23, 59, 103, 0.05)",
        floating: "0 16px 48px -8px rgba(23, 59, 103, 0.18)",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
