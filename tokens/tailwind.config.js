/**
 * GENSO — TAILWIND CONFIG
 * Merge theme.extend into an existing config, or use this file directly
 * for a new project. Every color reads from tokens.css via var(--x).
 *
 * Usage: bg-fire, text-fire-text, shadow-glow-fire, bg-water-soft,
 * border-line, text-washi-dim, rounded (default = sharp), etc.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // dark is the only mode — see docs/foundations.md
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // Next.js App Router
  ],
  theme: {
    extend: {
      colors: {
        sumi: "var(--sumi)",
        "sumi-2": "var(--sumi-2)",
        washi: "var(--washi)",
        "washi-dim": "var(--washi-dim)",

        fire: "var(--fire)",
        "fire-text": "var(--fire-text)",
        water: "var(--water)",
        "water-text": "var(--water-text)",
        earth: "var(--earth)",
        "earth-text": "var(--earth-text)",
        air: "var(--air)",
        "air-text": "var(--air-text)",

        error: "var(--semantic-error)",
        warning: "var(--semantic-warning)",
        success: "var(--semantic-success)",
      },
      fontFamily: {
        brush: ["var(--font-brush)"],
        kanji: ["var(--font-kanji)"],
        head: ["var(--font-head)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        DEFAULT: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
      },
      transitionTimingFunction: {
        air: "var(--ease-air)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        DEFAULT: "var(--duration-default)",
        slow: "var(--duration-slow)",
      },
      boxShadow: {
        "glow-fire": "0 0 40px var(--fire-glow-bold)",
        "glow-fire-soft": "0 0 20px var(--fire-glow)",
        "glow-water": "0 0 40px var(--water-glow-bold)",
        "glow-water-soft": "0 0 20px var(--water-glow)",
        "glow-earth": "0 0 40px var(--earth-glow-bold)",
        "glow-earth-soft": "0 0 20px var(--earth-glow)",
        "glow-air": "0 0 40px var(--air-glow-bold)",
        "glow-air-soft": "0 0 20px var(--air-glow)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
