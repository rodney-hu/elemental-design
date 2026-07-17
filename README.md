# Elemental Design

Genso (元素) — Rodney's personal design system. Built once, reused across
every project, so no project starts from a blank canvas.

Not yet pushed to GitHub — this folder is the source of truth until it is.
See `docs/decisions.md` for why.

## Folder map

| Folder | What lives here | When to open it |
|---|---|---|
| `docs/` | The *why* — philosophy, operating rules, decision log | Before changing a token, or when you forget why something is the way it is |
| `tokens/` | The *what* — colors, type, spacing, motion as CSS variables + Tailwind config | Every new project starts here |
| `components/` | The *how* — reusable UI primitives (Button, Card, Input, Badge, Status, Compare) | Building any interface |
| `layout/` | Page-level shells (Sidebar, Dashboard shell, Centered form) | Starting a new page type |
| `motion/` | Animation principles + reusable keyframes, one per element | Adding any transition or entrance animation |
| `assets/` | Self-hosted fonts (subsetted, no CDN dependency) and logo files | Wiring up a new project's `<head>` |
| `showcase/` | The living style guide — a real page that demonstrates the whole system | Reference, and the seed of the public showcase site |

## Quick start (new project)

1. Copy `tokens/tokens.css` and `tokens/tailwind.config.js` into the project.
2. Import `tokens.css` above your Tailwind directives.
3. Copy the font files from `assets/fonts/` and wire them up (see
   `assets/fonts/README.md` — do not link Google Fonts directly, see
   `docs/decisions.md` for why).
4. Copy whichever `components/` and `layout/` files the project needs.
5. Build using the semantic classes (`bg-fire`, `text-water-text`,
   `shadow-glow-fire`, etc.) — never a hand-typed hex code. If a token is
   missing, add it to `tokens/tokens.css` first, then use it.

## Status

Concept stage (v0.3). Palette, type, and core primitives are settled.
Not yet used in a shipped project. See `docs/decisions.md` for the full
history of what changed and why, so nothing gets re-litigated by accident.
