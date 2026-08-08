# Elemental Design

Genso (元素) — Rodney's personal design system. Built once, reused across
every project, so no project starts from a blank canvas.

## Folder map

| Folder | What lives here | When to open it |
|---|---|---|
| `docs/` | The *why* — philosophy, operating rules, decision log | Before changing a token, or when you forget why something is the way it is |
| `tokens/` | The *what* — colors, type, spacing, motion as CSS variables + the Tailwind preset + font loading | Every new project starts here |
| `components/` | The *how* — UI primitives (Button, Card, Input, Badge, Status, Compare) plus the element marks and Silhouette | Building any interface |
| `layout/` | Page-level shells (Sidebar, Dashboard shell, Centered form) and the Fourfold set | Starting a new page type |
| `motion/` | Animation principles, CSS keyframes, and the JS constants for framer-motion | Adding any transition or entrance animation |
| `assets/` | Self-hosted fonts (subsetted, no CDN dependency) and logo files | Rarely — `tokens/fonts.css` wires these up for you |
| `showcase/` | The living style guide — a real page that demonstrates the whole system | Reference, and the seed of the public showcase site |
| `scripts/` | `check-tokens.mjs` — the integrity check that keeps the above honest | Run it via `npm run check` |

## Using it in a project

**Install it — do not copy files out of it.** Copying is what broke this
system once already: bugs got fixed downstream in the consuming project and
never made it back, so the "source of truth" quietly became the more broken
copy. See `docs/decisions.md`. Everything below is designed so there is
exactly one copy of every value.

```bash
npm install "file:../elemental-design"   # sibling folder; swap for the git URL once pushed
```

**1. Tailwind — extend the preset, never paste it:**

```js
// tailwind.config.js
module.exports = {
  presets: [require("elemental-design/tailwind")],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { /* project-only additions go here */ } },
};
```

**2. CSS — import fonts and tokens above your Tailwind directives:**

```css
@import "elemental-design/fonts.css";
@import "elemental-design/tokens.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

The font files resolve straight out of the package — no copying `.woff2`
files into each project.

**3. Components and motion — import them:**

```ts
import { Button, Card, Status } from "elemental-design/primitives";
import { ElementMark, Silhouette } from "elemental-design/marks";
import { Fourfold, DashboardShell, Sidebar } from "elemental-design/shells";
import { easeAir, duration, riseInOnScroll } from "elemental-design/motion";
```

**4. Build with the semantic classes** (`bg-fire`, `text-water-text`,
`shadow-glow-fire`, `border-line`) — never a hand-typed hex. If a token is
missing, add it to `tokens/tokens.css` here, then use it. `npm run check`
fails the build if a component hand-types a color.

## Changing a color

Every color is authored **once**, as an RGB channel triplet:

```css
--fire-rgb: 170 0 0;
--fire: rgb(var(--fire-rgb));          /* derived */
--fire-soft: rgb(var(--fire-rgb) / 0.18);  /* derived */
```

Change the triplet. Everything else follows. The triplets exist because
Tailwind opacity modifiers (`bg-fire/40`) cannot compose an alpha channel
onto an opaque `var(--fire)` — see `docs/decisions.md`.

## Checks

```bash
npm run check
```

Verifies that the Tailwind preset only references tokens that exist, that
`motion/motion.ts` still matches the CSS motion tokens, and that no component
has hand-typed a hex, a `white/xx` literal, or an opacity modifier on a color
that can't take one. Run it after touching tokens, the preset, or motion.

## Status

**v0.5 — in production.** Shipped in `gtm-portfolio` (rodneyhu.com).

v0.4 fixed the bugs that surfaced building that site and closed the gaps
that forced it to invent its own type scale. v0.5 added the void stage,
object-bound halos, the element marks, and the Fourfold — the pieces needed
to express mastery of all four elements without loosening the restraint that
makes the system work.

Elemental Aura, the prior system, is archived. This is the only one.

See `CHANGELOG.md` for what changed and `docs/decisions.md` for why, so
nothing gets re-litigated by accident.
