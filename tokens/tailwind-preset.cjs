/**
 * GENSO — TAILWIND PRESET
 *
 * This is a Tailwind *preset*, not a standalone config. Consume it:
 *
 *   // tailwind.config.js
 *   module.exports = {
 *     presets: [require("elemental-design/tailwind")],
 *     content: ["./index.html", "./src/ ** / *.{js,ts,jsx,tsx}"],
 *     theme: { extend: { ...project-specific additions only... } },
 *   };
 *
 * Presets exist so a project never copies this file. Copying is what let
 * the system drift out of sync with its own consumer — see docs/decisions.md.
 * Add project-only tokens in the project's own `theme.extend`; add anything
 * reusable HERE, so every project gets it.
 *
 * `content` below covers THIS PACKAGE'S OWN component files, and nothing else.
 * Consumers still list their own source; Tailwind merges the two arrays.
 *
 * This is not optional politeness — without it, every utility class that
 * appears only inside these components (font-kanji, bg-earth-soft,
 * shadow-glow-earth, …) is never generated in the consumer's stylesheet and
 * silently resolves to nothing. That is the same failure mode as the original
 * opacity-modifier bug: the component looks right in source and renders wrong.
 * Declaring it here means a project cannot forget it.
 *
 * The path is absolute, derived from __dirname, so it resolves wherever the
 * package is installed (node_modules, a workspace, a file: link).
 *
 * Colours read the RGB channel triplets from tokens.css, not the derived hex
 * vars, so opacity modifiers (bg-air/10, border-water/40) resolve correctly.
 * A plain `var(--fire)` cannot have an alpha channel composed onto it.
 *
 * Usage: bg-fire, text-fire-text, shadow-glow-fire, bg-water-soft,
 * border-line, text-washi-dim, rounded (default = sharp), etc.
 */

const path = require("node:path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // dark is the only mode — see docs/foundations.md

  // This package's own components only. Merged with the consumer's content.
  content: [
    path.join(__dirname, "..", "components", "**", "*.{js,cjs,mjs,jsx,ts,tsx}"),
    path.join(__dirname, "..", "layout", "**", "*.{js,cjs,mjs,jsx,ts,tsx}"),
  ],

  theme: {
    extend: {
      colors: {
        void: "rgb(var(--void-rgb) / <alpha-value>)",
        sumi: "rgb(var(--sumi-rgb) / <alpha-value>)",
        "sumi-2": "rgb(var(--sumi-2-rgb) / <alpha-value>)",
        washi: "rgb(var(--washi-rgb) / <alpha-value>)",
        "washi-dim": "rgb(var(--washi-dim-rgb) / <alpha-value>)",

        fire: "rgb(var(--fire-rgb) / <alpha-value>)",
        "fire-text": "rgb(var(--fire-text-rgb) / <alpha-value>)",
        water: "rgb(var(--water-rgb) / <alpha-value>)",
        "water-text": "rgb(var(--water-text-rgb) / <alpha-value>)",
        earth: "rgb(var(--earth-rgb) / <alpha-value>)",
        "earth-text": "rgb(var(--earth-text-rgb) / <alpha-value>)",
        air: "rgb(var(--air-rgb) / <alpha-value>)",
        "air-text": "rgb(var(--air-text-rgb) / <alpha-value>)",

        error: "rgb(var(--semantic-error-rgb) / <alpha-value>)",
        "error-text": "rgb(var(--semantic-error-text-rgb) / <alpha-value>)",
        warning: "rgb(var(--semantic-warning-rgb) / <alpha-value>)",
        "warning-text": "rgb(var(--semantic-warning-text-rgb) / <alpha-value>)",
        success: "rgb(var(--semantic-success-rgb) / <alpha-value>)",
        "success-text": "rgb(var(--semantic-success-text-rgb) / <alpha-value>)",

        // Element "soft" fills stay as authored tokens — they are fixed-alpha
        // by design (0.18), not meant to be alpha-composable.
        "fire-soft": "var(--fire-soft)",
        "water-soft": "var(--water-soft)",
        "earth-soft": "var(--earth-soft)",
        "air-soft": "var(--air-soft)",
      },

      fontFamily: {
        brush: ["var(--font-brush)"],
        kanji: ["var(--font-kanji)"],
        head: ["var(--font-head)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },

      // xs/sm/base/lg/xl/2xl deliberately OVERRIDE Tailwind's defaults rather
      // than sitting alongside them, so existing call sites pick up this scale
      // with no component edits. Small sizes carry a paired line-height so body
      // and label text don't need a `leading-*` class at every site; display
      // sizes set it explicitly.
      fontSize: {
        "2xs": ["var(--text-2xs)", { lineHeight: "var(--leading-normal)" }],
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-normal)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-relaxed)" }],
        base: ["var(--text-base)", { lineHeight: "var(--leading-relaxed)" }],
        md: ["var(--text-md)", { lineHeight: "var(--leading-relaxed)" }],
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
        "4xl": "var(--text-4xl)",
      },

      lineHeight: {
        display: "var(--leading-display)",
        tight: "var(--leading-tight)",
        snug: "var(--leading-snug)",
        normal: "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
      },

      letterSpacing: {
        label: "var(--tracking-label)",
        display: "var(--tracking-display)",
      },

      // The --line tokens were defined in tokens.css from the start but never
      // wired up, which is why components fell back to hardcoded
      // border-white/10 literals. Wired here so `border-line` works.
      borderColor: {
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        // --line re-binds inside `.void` (see tokens.css), so plain
        // `border-line` is already correct there. These two are only for
        // reaching for a void-strength hairline OUTSIDE a .void scope.
        "line-void": "rgb(var(--washi-rgb) / 0.14)",
        "line-void-strong": "rgb(var(--washi-rgb) / 0.24)",
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
