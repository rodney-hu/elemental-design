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
 *
 * ⚠️ You MUST spread it into your own array — Tailwind does NOT merge a
 * preset's content. A project's own `content` replaces the preset's outright
 * (verified with resolveConfig on 3.4.19; the preset's array applies only if
 * the project omits `content` entirely, which no real project does):
 *
 *   content: [...genso.content, "./index.html", "./src/ ** / *.{ts,tsx}"]
 *
 * Skip that spread and every utility appearing only inside these components
 * (font-kanji, bg-earth-soft, shadow-glow-earth, …) is never generated and
 * silently resolves to nothing — the same failure mode as the original
 * opacity-modifier bug: right in the source, wrong in the browser.
 *
 * The paths are absolute, derived from __dirname, so they resolve wherever
 * the package is installed (node_modules, a workspace, a file: link).
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
      //
      // There is exactly one hairline strength pair. `line-void` /
      // `line-void-strong` used to sit here from the era when `--line`
      // re-bound inside a `.void` scope; v0.6 made void the page, so both
      // were dead duplicates that re-authored 0.14 / 0.24 outside the token
      // system — the second-representation anti-pattern foundations.md bans.
      borderColor: {
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
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
        // Page-scale rhythm. Reach for these on sections, not components.
        "3xl": "var(--space-3xl)",
        "4xl": "var(--space-4xl)",
        "5xl": "var(--space-5xl)",
      },

      // `max-w-measure` is the reading-width rule; the containers are the
      // four sanctioned page widths. A hand-typed `max-w-[62rem]` is the
      // thing these exist to replace — genso-check flags it.
      maxWidth: {
        measure: "var(--measure)",
        "measure-display": "var(--measure-display)",
        "container-sm": "var(--container-sm)",
        "container-md": "var(--container-md)",
        "container-lg": "var(--container-lg)",
        "container-xl": "var(--container-xl)",
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

        // Earth's behavior — weight, not emission. See the token comment in
        // tokens.css: never pair this with a glow on the same object.
        "root-earth": "var(--shadow-root-earth)",
      },

      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
