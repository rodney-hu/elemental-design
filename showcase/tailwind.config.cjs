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
 *
 * — Why `__dirname`, not the plain relative strings a real project uses —
 * Tailwind resolves a relative content glob against `process.cwd()`, not
 * against this file's own directory. In a real project that's a
 * distinction without a difference: the config lives at the project root,
 * which IS the cwd `npm run dev` runs from, so `"./src/**"` is correct as
 * written in README.md. This repo is the one exception — the config lives
 * in `showcase/`, one level below the cwd `npm run dev` actually runs
 * from (the package root) — so a bare `"./src/**"` silently resolved to
 * `<repo-root>/src/**`, which doesn't exist. Any class typed only in
 * `Showcase.tsx` and nowhere in `components/`/`layout/` (covered by
 * `genso.content`'s own absolute globs) never generated, with no error —
 * caught when the v2.1 Remix section, the first showcase-only markup to
 * use classes not duplicated in `components/`, silently failed to render.
 * `__dirname` sidesteps the cwd assumption entirely; a real consuming
 * project doesn't need this, since its config and its cwd already match.
 */
const path = require("node:path");
const genso = require("../tokens/tailwind-preset.cjs");

module.exports = {
  presets: [genso],
  content: [
    ...genso.content,
    path.join(__dirname, "index.html"),
    path.join(__dirname, "src", "**", "*.{js,ts,jsx,tsx}"),
  ],
  theme: { extend: {} },
};
