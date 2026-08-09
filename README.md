# Elemental Design

Genso (元素) — Rodney's personal design system. Built once, reused across
every project, so no project starts from a blank canvas.

**Live style guide: [genso-design.vercel.app](https://genso-design.vercel.app)**

## Folder map

**New here?** Read `docs/philosophy.md` (what the system believes), then
`docs/foundations.md` (what to actually do). `docs/decisions.md` is a
reference, not a read-through — reach for it when you want to change something
and need to know whether it was already tried.

| Folder | What lives here | When to open it |
|---|---|---|
| `docs/` | The *why* — philosophy, operating rules, decision log | Before changing a token, or when you forget why something is the way it is |
| `tokens/` | The *what* — colors, type, spacing, motion as CSS variables + the Tailwind preset + font loading | Every new project starts here |
| `components/` | The *how* — UI primitives, typography (Heading, Eyebrow, Prose), form fields, plus the element marks and Silhouette | Building any interface |
| `layout/` | Structure (Container, Section, Stack, Grid), page shells (Sidebar, Dashboard, Centered form) and the Fourfold set | Starting a new page type |
| `motion/` | Animation principles, CSS keyframes, and the JS constants for framer-motion | Adding any transition or entrance animation |
| `assets/` | Self-hosted fonts (subsetted, no CDN dependency) and logo files | Rarely — `tokens/fonts.css` wires these up for you |
| `showcase/` | The living style guide — a Vite app rendering the real components. Live at **[genso-design.vercel.app](https://genso-design.vercel.app)** | `npm run dev` to see a component while building one |
| `scripts/` | The rules that keep the above honest — internal integrity checks, plus the usage rules that also run against consuming projects | `npm run check` here, `npx genso-check ./src` there |

## Using it in a project

**Install it — do not copy files out of it.** Copying is what broke this
system once already: bugs got fixed downstream in the consuming project and
never made it back, so the "source of truth" quietly became the more broken
copy. See `docs/decisions.md`. Everything below is designed so there is
exactly one copy of every value.

```bash
npm install github:rodney-hu/elemental-design#v1.0.0   # pin the tag
npm install "file:../elemental-design"                 # or a sibling folder, while developing the system itself
```

Then let the scaffold do the wiring below for you:

```bash
npx genso init
```

It writes `tailwind.config.js` with the content spread already correct, the CSS
import block, and the `body` void rule. Steps 1–3 document what it writes, so
you can do it by hand or check its work.

**⚠️ Next.js:** the exports map points at raw `.tsx` source (that's how the
Tailwind preset can scan it). Next must be told to transpile the package:

```js
// next.config.js
module.exports = { transpilePackages: ["elemental-design"] };
```

Without it the build fails on the first `import` with a syntax error that
doesn't mention this package. Vite needs nothing — it transpiles by default.

**1. Tailwind — extend the preset, never paste it:**

```js
// tailwind.config.js
const genso = require("elemental-design/tailwind");

module.exports = {
  presets: [genso],
  content: [...genso.content, "./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { /* project-only additions go here */ } },
};
```

**Spreading `genso.content` is required, not optional.** Tailwind does *not*
merge a preset's `content` — your array replaces it outright. Leave it out and
every class used only inside these components (`font-kanji`, `bg-earth-soft`,
`shadow-glow-earth`, …) is never generated and silently renders as nothing:
kanji falls back to the body font, element badges lose their fill, cards lose
their glow. Nothing errors. See `docs/decisions.md`.

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

**3. Set the page to void.** The system's surfaces are a three-tier elevation
scale, and the page is the bottom of it:

```css
body { background-color: var(--void); color: var(--washi); }
```

| Tier | Token | What sits here |
|---|---|---|
| Page | `--void` (#000000) | the stage — nothing but the page |
| Recessed | `--sumi` | inputs, wells, code blocks |
| Raised | `--sumi-2` | cards, modals, anything holding content |

Short passages read well directly on the void; put sustained prose on a panel.

**4. Components and motion — import them:**

```ts
import { Button, Card, CardLink, Status } from "elemental-design/primitives";
import { Heading, Eyebrow, Prose, Text, Link } from "elemental-design/typography";
import { FormField, Textarea, Select } from "elemental-design/forms";
import { Modal, ToastProvider, useToast } from "elemental-design/overlay";
import { Tabs, TabList, Tab, TabPanel } from "elemental-design/tabs";
import { Table, TableHead, TableBody, TableRow, TableCell } from "elemental-design/table";
import { Container, Section, Stack, Grid } from "elemental-design/structure";
import { ElementMark, Silhouette } from "elemental-design/marks";
import { Fourfold, DashboardShell, Sidebar } from "elemental-design/shells";
import { easeAir, duration, riseInOnScroll } from "elemental-design/motion";
```

Reach for `Heading` / `Eyebrow` / `Prose` and `Section` / `Container` rather
than hand-assembling `font-head text-2xl tracking-display`. The tokens make the
right value *available*; these components make it the **only** one — which is
the half that was missing when a single site ended up with three different
`<h2>` sizes and five competing tracking values.

**5. Build with the semantic classes** (`bg-fire`, `text-water-text`,
`shadow-glow-fire`, `border-line`) — never a hand-typed hex. If a token is
missing, add it to `tokens/tokens.css` here, then use it. `npm run check`
fails the build if a component hand-types a color.

## Versioning

Installs pin a tag (`#v1.0.0`), so nothing moves under a project until you
change that number. What the numbers mean:

| Bump | Means |
|---|---|
| **Major** | A rule changed, not just an addition. Removed or renamed a token, changed a component's default, narrowed a peer range. Always has a **Breaking** section in `CHANGELOG.md` with the migration. |
| **Minor** | New tokens, new components, new lint rules. Existing code keeps working. |
| **Patch** | Fixes and docs. No new surface. |

A new `genso-check` rule is a **minor** bump even though it can fail a build
that used to pass — the rule was always true, it just wasn't enforced. If a
rule is wrong for your project, `genso-allow` it rather than pinning back.

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

**In a consuming project, lint your own source too:**

```bash
npx genso-check ./src
```

Every rule this system has learned was broken *downstream*, not here — the
type scale, the tracking values, the second easing curve, the invented
durations. A checker that only guards this repo guards the wrong thing. Wire
it into the project's `build` script.

Suppress a rule where you genuinely mean it, with a reason:

```tsx
{/* genso-allow: soft-radius — matches the embedded Stripe widget */}
```

## Status

**v1.0 — in production.** Shipped in `gtm-portfolio` (rodneyhu.com); the
living style guide is at [genso-design.vercel.app](https://genso-design.vercel.app).

v0.4 fixed the bugs that surfaced building that site and closed the gaps that
forced it to invent its own type scale. v0.5 added the element marks,
object-bound halos and the Fourfold — the pieces needed to express mastery of
all four elements without loosening the restraint that makes the system work.
v0.6 made void the page and ink the panel, turning the neutrals into a real
elevation scale.

v0.7 attacked the gap between having good rules and never starting from
scratch. Every rule this system learned was broken *downstream* — so the
checker now runs there (`genso-check`), the layer that kept getting reinvented
badly now ships (typography, structure, form fields), and `genso init` writes
the wiring that had two documented ways to get silently wrong.

v1.0 closed the v0.1 "still to build" list — modal, toast, tabs, table — and
put the style guide on a real deployment, which immediately found a
horizontal-overflow bug in the corner aura that had survived three versions
because nobody had viewed it narrow.

Elemental Aura, the prior system, is archived. This is the only one.

See `CHANGELOG.md` for what changed and `docs/decisions.md` for why, so
nothing gets re-litigated by accident.
