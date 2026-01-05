/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "./app/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./components/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./utils/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./*.{html,js,jsx,ts,tsx,mdx}",
    "./src/**/*.{html,js,jsx,ts,tsx,mdx}",
  ],
  presets: [require("nativewind/preset")],
  important: "html",

  safelist: [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background|indicator)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/,
    },
  ],

  theme: {
    extend: {
      colors: {
        /* ================= PRIMARY (Rich Blacks/Neutrals) ================= */
        primary: {
          50: "#F2F2F2",
          100: "#E6E6E6",
          200: "#CCCCCC",
          300: "#999999",
          400: "#666666",
          500: "#1A1A1A", // Surface/Card color
          600: "#141414",
          700: "#0D0D0D", // Primary Background
          800: "#080808",
          900: "#050505",
          950: "#000000", // Pure black
        },

        /* ================= SECONDARY (Luxury Gold) ================= */
        secondary: {
          50: "#FAF6ED",
          100: "#F2E8D1",
          200: "#E5D0A3",
          300: "#D9B975",
          400: "#CCA147",
          500: "#C5A35D", // Main Brand Gold
          600: "#A6894D",
          700: "#876F3E", // Muted/Border gold
          800: "#695630",
          900: "#4A3D22",
        },

        /* ================= TERTIARY ================= */
        tertiary: {
          500: "#333333", // Muted strokes
        },

        /* ================= FEEDBACK ================= */
        success: {
          500: "#22C55E",
          600: "#16A34A",
        },
        warning: {
          500: "#F59E0B",
          600: "#D97706",
        },
        error: {
          500: "#EF4444",
          600: "#DC2626",
        },
        info: {
          500: "#3B82F6",
          600: "#2563EB",
        },

        /* ================= TYPOGRAPHY ================= */
        typography: {
          50: "#FFFFFF", // Main Headlines
          200: "#E5E7EB",
          400: "#B3B3B3", // Secondary Text / Subtitles
          600: "#71717A",
          800: "#3F3F46",
          900: "#18181B",
          white: "#FFFFFF",
          gray: "#B3B3B3",
          black: "#0D0D0D",
        },

        /* ================= OUTLINE ================= */
        outline: {
          200: "#262626", // Darker outlines for inputs
          300: "#333333",
          400: "#C5A35D", // Gold focus state
        },

        /* ================= BACKGROUND ================= */
        background: {
          50: "#1A1A1A",
          100: "#141414",
          200: "#0D0D0D",
          300: "#000000",
          800: "#0D0D0D",
          900: "#000000",
          light: "#FFFFFF", // Keep for rare light-mode use
          dark: "#232321;", // App standard
          muted: "#1A1A1A",
          success: "#064E3B",
          warning: "#451A03",
          error: "#450A0A",
          info: "#172554",
        },

        /* ================= INDICATOR ================= */
        indicator: {
          primary: "#C5A35D", // Gold active state
          info: "#3B82F6",
          error: "#EF4444",
        },
      },

      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "system-ui"],
        roboto: ["Roboto", "system-ui"],
        inter: ["Inter", "system-ui"],
        mono: ["Space Mono", "monospace"],
      },

      fontWeight: {
        extrablack: "950",
      },

      fontSize: {
        "2xs": "10px",
      },

      boxShadow: {
        "hard-1": "0 2px 8px rgba(0,0,0,0.4)",
        "hard-2": "0 3px 10px rgba(0,0,0,0.5)",
        "soft-1": "0 0 10px rgba(0,0,0,0.2)",
        "soft-2": "0 0 20px rgba(0,0,0,0.3)",
      },
    },
  },
};
