# Changelog

Terse version list. Reasoning for each change lives in `docs/decisions.md`.

## v0.5.1 — current

**Fixed — packaged components were silently losing their styles.**
The Tailwind preset now declares `content` globs for its own `components/`
and `layout/` directories (absolute, via `__dirname`), which Tailwind merges
with the consuming project's array.

Without it, any utility used *only* inside this package was never generated
downstream: `font-kanji` (so the kanji register rendered in the body font),
`bg-earth-soft` (so `Badge tone="earth"` had no background) and
`shadow-glow-earth` (so `Card accent="earth"` had no glow). The README had
been teaching the broken configuration. Guarded by a new check.

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
