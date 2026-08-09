# Foundations

Concrete rules for using this system correctly. Where `philosophy.md`
explains *why*, this file says *what to actually do*.

## Color

- Never hand-type a hex code in a component. If the color you need isn't
  a token in `tokens/tokens.css`, add it there first, then reference it.
  `npm run check` enforces this — it fails on a hex literal or a
  `border-white/10`-style literal in `components/` or `layout/`.
- Every color is authored **once**, as an RGB channel triplet
  (`--fire-rgb: 170 0 0`). The plain color, the soft fill and both glows
  derive from it. To change a color, change the triplet — never edit a
  derived value, and never add a second representation of the same color.
- Opacity modifiers (`bg-fire/40`) only work on colors the Tailwind preset
  exposes with `<alpha-value>`. The `-soft` and `-glow` tokens are
  fixed-alpha by design and cannot take one — use them as-is.
- Neutral hairlines and borders use `border-line` / `border-line-strong`.
  Never `border-white/10`.
### Elevation — three tiers, darkest at the back

| Tier | Token | What sits here |
|---|---|---|
| Page | `--void` (#000000) | the stage — nothing but the page |
| Recessed | `--sumi` | inputs, wells, code blocks, insets |
| Raised | `--sumi-2` | cards, modals, anything holding content |

- **Void is the page background.** Set it once at the app root
  (`body { background-color: var(--void) }`). Don't paint sections black —
  they already are.
- **Content lives on a panel.** Raise anything substantial off the void with
  `--sumi-2`. Short passages directly on black are fine and read well;
  **sustained prose is not** — put a case study body, a long form, or any
  multi-paragraph block on a panel.
- **Panels are solid.** No opacity tint, no `backdrop-blur`. A translucent
  panel on a flat black page composites to nearly nothing (1.09:1 against
  the page, versus 1.19:1 solid) and the blur has nothing behind it to blur.
  Translucency is only worth it where content genuinely scrolls underneath.
- **Don't stack a tier on itself.** An input on a panel goes to `--sumi`, not
  `--sumi-2` — matching the surface it sits on flattens it.

### The Fourfold Rule

The one place all four accents may coexist. All five conditions are
required — miss any one and it stops being a set and becomes four accents
competing, which is still banned:

1. **Exactly four cells**, one element each, in canonical order
   Fire → Water → Earth → Air.
2. **One accent per cell** — its mark, its `-text` label, its halo. No
   accent crosses a cell boundary.
3. **At most one Fourfold per page**, and never in the same viewport as a
   primary CTA.
4. **Cells are peers** — equal size, weight and glow. Emphasise one and
   the rule is broken.
5. **Outside the set, the page still has exactly one leading accent**
   (fire by default).

Use `Fourfold` from `layout/shells.tsx`; it enforces the arity and the
canonical order for you.

- Anything rendered as **text** uses a `-text` token — `--fire-text` for
  elements, `--semantic-error-text` / `--semantic-warning-text` /
  `--semantic-success-text` for status. The base colors are fills and
  borders only: `--semantic-error` is 2.43:1 on ink, far below the 4.5:1
  AA floor, and is effectively invisible as a glyph.
- Fire (`--fire`, `#AA0000`) is the only color allowed on a primary CTA.
  It's matched to the real logo — don't drift it without checking the
  logo first.
- Every element color ships in five forms: the true color (`--fire`), a
  lighter text-safe tint (`--fire-text`) for labels on dark backgrounds,
  a soft background tint (`--fire-soft`), and two glow strengths
  (`--fire-glow`, `--fire-glow-bold`). Use the true color for
  fills/borders, the `-text` variant for anything rendered as text.
- Semantic color (`--semantic-error/warning/success`) is separate from
  element color, even though error reuses fire's red. Don't reach for
  `--fire` when you mean "this failed" — use `--semantic-error`. They're
  allowed to share a hex value; they're not allowed to share a variable.
- Air's glow is intentionally capped slightly below the other three
  (0.7 vs 0.75 opacity at full strength) — gold at full glow strength
  reads garish fast. Don't "fix" this without testing it side by side
  first.

## Type

- Three font roles, each with a hard boundary:
  - `--font-brush` (Permanent Marker) — **Latin wordmark only.** Never
    body text, never headings. It has no kanji glyphs — it will silently
    fall back and break if used anywhere a kanji character might appear.
  - `--font-kanji` (Ma Shan Zheng) — **kanji marks only** (元 火 水 土 風
    and similar). Not a general display font.
  - `--font-head` (Klee One) — section headings, and the only font that
    covers both Latin headings AND kanji glyphs used inline (e.g. a
    swatch label). Default to this for anything both scripts touch.
  - `--font-body` (Zen Kaku Gothic New) — all body copy.
  - `--font-mono` (JetBrains Mono) — labels, status text, hex codes.
- Use the type scale (`--text-2xs` … `--text-4xl`), never a hand-typed
  size. Sizes below 20px are fixed; display sizes are fluid `clamp()`,
  so a heading needs no responsive variants. Body copy is `--text-base`.
- **13px (`--text-2xs`) is the hard floor.** Nothing renders smaller.
- Uppercase is reserved for the brush wordmark **and small mono eyebrow
  labels** — see `decisions.md`. It never goes on body copy or on
  anything that is really a heading: if it labels a block of content and
  would be an `<h2>`/`<h3>` in markup, it gets `--font-head` at a real
  size, not a mono label.
- One letter-spacing value for labels (`--tracking-label`), one for
  headings (`--tracking-display`). Don't add a third.
- Don't set `-webkit-font-smoothing: antialiased`. It thins glyph stems
  on macOS and reads as "the text is too small" — see `decisions.md`.

## Shape and space

- Border radius stays sharp: 2px on interactive elements (buttons,
  inputs, chips), up to 3px on cards. Never the soft 8px+ rounding
  common in glassmorphic UI — that reads as a different (older) system.
- Negative space is a default, not an afterthought. When in doubt, add
  more space around an element before adding more decoration to it.
- Layouts lean asymmetric over centered where the content allows it —
  matches the *ma* (negative space) principle in `philosophy.md`.

### Element marks

Two registers ship, both in `components/marks.tsx`:

- **Geometric** — the line marks, for UI (badges, cells, nav).
- **Kanji** — 火 水 土 風, for brand and formal moments. Limited to the
  font subset; see `assets/fonts/README.md` before using any other glyph.

Drawing rules for the geometric set, all enforced by `npm run check`:

- One `0 0 24 24` grid, built on 4-unit modules.
- `stroke-width: 1.5`, `stroke="currentColor"` — never a hardcoded color.
  The mark inherits its element from the parent's text color.
- **Butt caps, miter joins.** Round caps contradict the sharp-corner rule.
- No fills, and **no circle enclosure** — that last one is deliberate, see
  `decisions.md`.
- Each mark is *open* in the way its element is open. That gap is the
  design, not a simplification; don't close it.

## Motion

- One easing curve for the whole system: `--ease-air`
  (`cubic-bezier(0.16, 1, 0.3, 1)`), an ease-out curve. Don't introduce a
  second curve without a documented reason in `decisions.md`.
- Entrances fade + rise (`riseIn` keyframe in `tokens/tokens.css`).
  Nothing bounces, nothing overshoots — see `motion/README.md` for the
  full per-element motion language.
- Durations come from the three tokens only: `--duration-fast` (150ms),
  `--duration-default` (400ms), `--duration-slow` (700ms). If the value
  you want isn't one of the three, the answer is one of the three.
- **JS animation imports its constants; it never hand-types them.**
  framer-motion, GSAP and the Web Animations API cannot read a CSS
  variable, so `motion/motion.ts` mirrors the CSS tokens —
  `import { easeAir, duration, riseInOnScroll } from "elemental-design/motion"`.
  A hand-typed `[0.16, 1, 0.3, 1]` or `ease: "easeInOut"` is a bug, not a
  shortcut: that's how a second easing curve and two unsanctioned
  durations reached production unnoticed. `npm run check` asserts the JS
  constants still match the CSS ones.
- Every entrance is decorative, so all of it is gated on
  `prefers-reduced-motion` at the token level. Use
  `prefersReducedMotion()` from `motion/motion.ts` for the JS side.
- **The background does not glow; objects do.** Two different things with
  deliberately different budgets:
  - an **aura** (`--aura-*`) tints a *background*. One hue (fire), alpha
    ≤0.055 (0.085 on a hero), corner-anchored. Rules below.
  - a **halo** (`--halo-*`) sits behind a *mark or figure*, bounded by that
    object's own box. Any element, alpha up to 0.30 (air 0.24) — it may be
    far brighter precisely because it is emphasis on a thing the user is
    looking at, not decoration on a page.

  A halo on a `<section>`, `<main>` or the shell is the banned full-page
  wash under a new name; `npm run check` fails on it. Both are static —
  never animated.
- The page background **never animates**. No keyframes on the shell, no
  scroll-driven effects.
- The page background **may carry a static corner aura** — one hue
  (fire), anchored to a section's top corner, alpha ≤0.055, falling off
  before the reading column, on alternating sides, and absent from some
  sections. Full-page multi-hue glow is still banned: that's what read
  as a red-tinted background the first time. See `decisions.md` for the
  conditions and the `--aura-*` tokens; get any of them wrong and it
  reads as a tint again.

## Fonts and network

- Fonts are self-hosted (see `assets/fonts/README.md`), not loaded from
  Google's CDN at runtime. A CDN dependency silently breaks in sandboxed
  or offline preview environments — this was a real, hard-to-diagnose
  bug once. Don't reintroduce a `<link>` to fonts.googleapis.com.

## Adding something new

1. Figure out which element it belongs to (or that it's neutral/
   semantic) — this decides its color and motion behavior.
2. Add any new token to `tokens/tokens.css` first.
3. Build the component in `components/` (or `layout/` if it's page-level).
4. Add it to the relevant showcase section in `showcase/index.html` so
   it's actually visible somewhere, not just defined.
5. If the addition involved a real judgment call (not just following
   existing rules), log it in `docs/decisions.md`.
