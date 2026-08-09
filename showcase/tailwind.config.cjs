/**
 * The showcase's Tailwind config — deliberately written the way a real
 * consumer's is, including the `...genso.content` spread.
 *
 * That spread is the single most important line in this file. Tailwind does
 * NOT merge a preset's `content`: a project's array replaces the preset's
 * outright. Leave it out and every utility used only inside the package's own
 * components (`font-kanji`, `bg-earth-soft`, `shadow-glow-earth`, …) is never
 * generated and silently renders as nothing. Nothing errors. See
 * docs/decisions.md — it took two attempts to get this right, and the wrong
 * version was the intuitive one.
 *
 * `npx genso init` writes this file for you, with the spread already correct.
 */
const genso = require("../tokens/tailwind-preset.cjs");

module.exports = {
  presets: [genso],
  content: [...genso.content, "./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
};
