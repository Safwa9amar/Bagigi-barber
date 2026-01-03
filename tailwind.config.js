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
        /* ================= PRIMARY (Brand Black) ================= */
        primary: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#0F172A", // main brand
          600: "#020617",
          700: "#020617",
          800: "#020617",
          900: "#020617",
          950: "#000000",
        },

        /* ================= SECONDARY (Gold Accent) ================= */
        secondary: {
          50: "#FFF8E1",
          100: "#FDECC8",
          200: "#F6D89A",
          300: "#E9C46A",
          400: "#D4AF37",
          500: "#C9A24D", // gold
          600: "#A8892C",
          700: "#7C651F",
          800: "#4F4013",
          900: "#2A2209",
        },

        /* ================= TERTIARY ================= */
        tertiary: {
          500: "#64748B",
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
          50: "#F9FAFB",
          200: "#E5E7EB",
          400: "#9CA3AF",
          600: "#4B5563",
          800: "#1F2937",
          900: "#0F172A",
          white: "#FFFFFF",
          gray: "#D4D4D4",
          black: "#181718",
        },

        /* ================= OUTLINE ================= */
        outline: {
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
        },

        /* ================= BACKGROUND ================= */
        background: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          800: "#1F2937",
          900: "#111827",
          light: "#FBFBFB",
          dark: "#0B0F19",
          muted: "#F1F5F9",
          success: "#ECFDF5",
          warning: "#FFFBEB",
          error: "#FEF2F2",
          info: "#EFF6FF",
        },

        /* ================= INDICATOR ================= */
        indicator: {
          primary: "#C9A24D",
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
        "hard-1": "-2px 2px 8px rgba(38,38,38,0.2)",
        "hard-2": "0 3px 10px rgba(38,38,38,0.2)",
        "soft-1": "0 0 10px rgba(38,38,38,0.1)",
        "soft-2": "0 0 20px rgba(38,38,38,0.2)",
      },
    },
  },
};
