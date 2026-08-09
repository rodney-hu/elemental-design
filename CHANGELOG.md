# Changelog

Terse version list. Reasoning for each change lives in `docs/decisions.md`.

## v0.7 — current

**Closes the gap between having good rules and never starting from scratch.**
Reading the whole decision log back surfaced the thing none of its entries said
out loud: every failure it records happened in a *consuming project*, not here.
Eleven type sizes below 24px, three `<h2>` sizes on one site, five tracking
values, mono headings, a second easing curve, three invented durations. Tokens
prevented none of them, and the checker only ever looked at this repo — so it
was guarding the code that had never broken a rule.

**`genso-check` — the linter runs in your project now**
- `npx genso-check ./src` enforces the system's rules on any source tree.
- The old `check-tokens.mjs` split into `scripts/lib/rules-internal.mjs`
  (token graph, motion mirror, contrast, alpha caps, mark drawing rules) and
  `scripts/lib/rules-usage.mjs` (everything true of any codebase).
- New rules, each one a decision-log entry made executable: arbitrary type /
  spacing / width / radius values, sizes below the 13px floor, unsanctioned
  durations, a second easing curve, uppercase on a real heading, raw
  black/white, `rgb()` colour literals, dead v0.6 patterns, CDN fonts,
  `font-smoothing: antialiased`, halos on page-level elements.
- Suppress a genuine exception with `genso-allow: <rule> — <reason>`.
- `npm run rules` lists every rule and what it guards.

**The layer that kept being reinvented now ships**
- `components/typography.tsx` — `Heading` (one size per level, permanently),
  `Eyebrow` (13px floor, `tracking-label`, and structurally incapable of
  rendering as a heading), `Prose` (capped at `--measure`, on a panel),
  `Text`, `Link`.
- `layout/structure.tsx` — `Container`, `Section` (rhythm + the corner-aura
  geometry), `Stack`, `Grid`.
- `components/forms.tsx` — `FormField` wires label → control → error → hint
  with a generated id, `aria-describedby` and `aria-invalid`. None of that
  existed: a screen-reader user got an unlabelled box and never heard the
  error. Plus `Textarea`, `Select`, `Checkbox`, `Radio`, `RadioGroup`.

**New tokens**
- `--measure` (68ch) — the line-length rule the system discussed for five
  versions and never set.
- `--container-sm/md/lg/xl` — four sanctioned page widths.
- `--space-3xl/4xl/5xl` (72/96/144px) — the scale stopped at 48px, so section
  rhythm was invented per project.
- `--shadow-root-earth` — earth's *behavior* half, described since v0.1 with
  no token behind it. Weight, not emission; never paired with a glow.

**Showcase is a real app**
- Rebuilt as Vite + React importing the actual components through the package's
  own `exports` map. The third copy of the palette is gone, its drift check was
  deleted rather than maintained, and `npm run dev` is a live sandbox.
- It found a bug on first render — see `Card` below.

**`genso init` and CI**
- `npx genso init` writes `tailwind.config.js` with `...genso.content` already
  spread (the footgun with two separate decision-log entries), the CSS import
  block, and the `body` void rule. Detects Next.js and ESM projects.
- GitHub Actions runs check + typecheck + showcase build on every push.

**Breaking**
- `Card` defaults to `interactive={false}` (was `true`). It had been giving
  every card `cursor-pointer` and a hover lift with no focus ring, no role and
  no keyboard path. **Migration:** pass `interactive` explicitly, or switch to
  `CardLink` / `CardButton` — which render a real `<a>` / `<button>`, so
  clickability comes from the element rather than from a styling prop.
- `Card`'s shadow is the `elevation` prop (`raised` | `rooted` | `none`), not
  a hardcoded `shadow-lg`. **Migration:** `className="shadow-…"` on a Card
  never reliably worked — it produced two `box-shadow` utilities at equal
  specificity and silently lost. Use `elevation`.
- `border-line-void` / `border-line-void-strong` **removed** — dead duplicates
  of `border-line` / `border-line-strong` from the era when `--line` re-bound
  inside `.void`. Use the plain pair.
- `peerDependencies.tailwindcss` narrowed from `>=3.4` to `^3.4`. The old range
  was a false promise: Tailwind 4 dropped the JS preset format this system is
  built on, so a fresh install could satisfy the range and then fail.
- `scripts/check-tokens.mjs` **removed** — replaced by `bin/genso-check.mjs`.
  `npm run check` is unchanged.

**Also**
- Next.js consumers need `transpilePackages: ["elemental-design"]`. This was
  always true and never documented; `genso init` now says so.

## v0.6

**The page is void; content lives on ink panels.** Reverses v0.5's "pure black
is a stage, not a background" after seeing it shipped. Panels separate from
the page at 1.19:1 on void versus 1.04:1 on ink — on ink they had been very
nearly invisible.

The neutrals are now a three-tier elevation scale rather than a page colour
plus a panel colour:

| Tier | Token | What sits here |
|---|---|---|
| Page | `--void` | the stage |
| Recessed | `--sumi` | inputs, wells, insets |
| Raised | `--sumi-2` | cards, modals, content |

**Breaking**
- The `.void` utility is **removed** — a class that paints a section black on
  a black page is a no-op. `.ink` and `.panel` replace it for deliberately
  recessing or raising a region.
- `--line` / `--line-strong` default to **0.14 / 0.24** (were 0.09 / 0.18).
  The old values were tuned for an ink page and dissolve against black.
- `Card` and `CenteredForm` are **solid** `--sumi-2` — no opacity tint, no
  `backdrop-blur` (there was nothing behind it to blur).
- `Input` moved to `--sumi`, since it sits on a panel and matching the panel
  flattened it.
- `DashboardShell` / `CenteredForm` page backgrounds moved to `--void`.

**Also**
- Water's "glassmorphism" is documented as the hover morph (lift + pooling
  glow), not the glass tint — the behaviour survives, the implementation
  doesn't.
- Contrast check now measures every `-text` tint against all three tiers.
- Fixed: the showcase was setting `-webkit-font-smoothing: antialiased`,
  which `decisions.md` explicitly forbids.

## v0.5.2

**Corrects v0.5.1, which did not actually work.** Tailwind does *not* merge a
preset's `content` — a project's own array replaces it outright (verified with
`resolveConfig` on 3.4.19). v0.5.1 declared globs in the preset and assumed
they'd combine; the built CSS came out byte-identical, which is what exposed it.

The preset still exports its own absolute globs, but consumers must now
**spread them in**:

```js
content: [...genso.content, "./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

README and preset docs updated to teach the working pattern.

## v0.5.1

**Fixed — packaged components were silently losing their styles.**
Any utility used *only* inside this package was never generated downstream:
`font-kanji` (so the kanji register rendered in the body font),
`bg-earth-soft` (so `Badge tone="earth"` had no background) and
`shadow-glow-earth` (so `Card accent="earth"` had no glow). The README had
been teaching the broken configuration. Added a check that the preset exports
content globs (it cannot verify a consumer spreads them — that's on the docs).

Caught the first time a packaged component was rendered in a real consumer —
the argument for actually using this stuff, not just typechecking it.

## v0.5

"Void, Halo, Fourfold." Adds the pieces the system was missing to express
mastery of all four elements, without loosening the restraint that makes it
work. Genso's palette and its martial framing already pointed here — this
pass builds the parts that were only implied.

**Added**
- `--void` (#000000) as an opt-in **stage**, scoped via a `.void` class.
  Ink stays the reading surface. `--line` re-binds stronger inside the scope.
- **Halos** (`--halo-*`, `.halo-fire|water|earth|air`) — object-bound glow,
  a separate namespace from the background-bound `--aura-*`, with its own
  (much higher) alpha budget. The rule is now "the background does not glow;
  objects do."
- `components/marks.tsx` — four **original** element marks (geometric) plus
  the kanji register, in one `ElementMark`, and a `Silhouette` treatment.
  Exported as `elemental-design/marks`.
- `Fourfold` in `layout/shells.tsx` — the one sanctioned place all four
  accents coexist. Arity and canonical order are compile-enforced.
- **The Avatar principle** in `philosophy.md` and **the Fourfold Rule** in
  `foundations.md`, reconciling "master of all four" with "one accent leads
  per screen."
- Showcase section 05 demonstrating all of the above.

**Fixed**
- `showcase/index.html` had no `prefers-reduced-motion` guard — it inlines
  its own CSS and never inherited the one in `tokens.css`, so it animated
  regardless of the OS setting.
- `assets/fonts/README.md` understated the Ma Shan Zheng subset: the kanji
  流 is included, not just the hiragana of 流れるように. Also documents that
  `document.fonts.check()` is unusable for glyph coverage.
- `Card` accepts all four elements as `accent`, not just water/air.
- Stale "Concept v0.3 — not yet shipped" banner in the showcase.

**Guard** — five new checks in `npm run check`: WCAG contrast for every
`-text` tint against *both* ink and void; aura/halo alpha caps enforced
numerically rather than in prose; element-mark drawing rules; kanji-subset
membership; and `.halo` on a page-level element.

## v0.4

First version shaped by a real shipped project (`gtm-portfolio` /
rodneyhu.com) rather than by concept work. Everything here is either a bug
that surfaced building it or a gap that forced that project to invent its own
solution locally.

**Distribution**
- The system is now an installable package (`package.json` + exports map)
  instead of a set of files to copy. Copying was the root cause of every bug
  below surviving in the source of truth after being fixed downstream.
- `tokens/tailwind.config.js` → `tokens/tailwind-preset.cjs`, consumed via
  Tailwind's `presets` array. Projects extend it; they never duplicate it.
- `tokens/fonts.css` added — `@font-face` rules resolving to the packaged
  `.woff2` files, so projects stop reconstructing font loading by hand.
- `scripts/check-tokens.mjs` (`npm run check`) — zero-dependency integrity
  check covering every bug class below, so none of them can return silently.
- `showcase/index.html` re-synced: its inlined palette (it is deliberately a
  standalone, network-free file) had fallen two versions behind and was still
  showing the old `--fire-text` and `--washi-dim`. Now covered by the check.

**Fixed**
- Tailwind opacity modifiers (`bg-air/10`, `border-water/40`) silently
  resolved to nothing. Colors are now authored once as RGB channel triplets
  with everything derived from them, so alpha composition works and there is
  still only one number per color to maintain.
- `ErrorText` rendered `--semantic-error` at 2.43:1 contrast. Added
  `--semantic-error-text` (6.81:1), `--semantic-success-text` (10.81:1) and
  `--semantic-warning-text`; every glyph now uses a `-text` token.
- `--fire-text` brightened `#E2574A` → `#F0776A` (4.79:1 → 6.36:1).
- `--washi-dim` lightened `#C8C1B3` → `#D9D3C7`.
- `--line` / `--line-strong` wired into Tailwind as `border-line` /
  `border-line-strong`; removed the hand-typed `border-white/[0.18]` and
  `border-white/10` literals from all primitives and shells.
- Focus rings moved from `focus:` to `focus-visible:`, so they stop firing on
  mouse clicks. Added `disabled:` styling to Button.

**Added**
- Full type scale: `--text-2xs`…`--text-4xl` (display sizes fluid via
  `clamp()`), `--leading-*`, and `--tracking-label` / `--tracking-display`.
  Previously the system had no typography tokens at all.
- `motion/motion.ts` — `easeAir`, `duration`, `riseIn`, `riseInOnScroll`,
  `prefersReducedMotion()` for framer-motion and other JS animation, which
  could not read the CSS motion tokens.
- `prefers-reduced-motion` handling in `tokens.css`.

## v0.3
- Palette restructured to exactly 6 colors: 2 neutrals + 4 elements
  (fire/water/earth/air), one color and one behavior each.
- Earth changed from brown to green.
- Water changed from teal to blue.
- Kintsugi gold accent merged into Air (no longer a separate 5th accent).
- Fire matched to the real logo (`#AA0000`).
- Added semantic color trio (error/warning/success), kept separate from
  element color tokens.
- Body text lightened for legibility.
- Ambient background glow removed — flat ink background.
- Fonts moved from Google Fonts CDN links to self-hosted, subsetted,
  base64-embedded `@font-face` — fixes a silent font-loading failure in
  sandboxed previews.

## v0.2
- Wordmark font split into two roles: Permanent Marker (Latin) and Ma
  Shan Zheng (kanji) — the original single "brush" font couldn't render
  both.
- Palette glow strength increased across the board — the initial pass
  read as too muted/restrained relative to the "premium" feel wanted.

## v0.1 — initial concept
- Established the Genso name, ink/paper/seal palette, brush wordmark,
  hanko seal signature mark, shoji glass panels, Japanese-minimalist
  layout direction. First version had a single red accent plus water/
  earth/air as pure motion mechanism (no visible color).
