# Foundations

Concrete rules for using this system correctly. Where `philosophy.md`
explains *why*, this file says *what to actually do*.

## Color

- Never hand-type a hex code in a component. If the color you need isn't
  a token in `tokens/tokens.css`, add it there first, then reference it.
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

## Motion

- One easing curve for the whole system: `--ease-air`
  (`cubic-bezier(0.16, 1, 0.3, 1)`), an ease-out curve. Don't introduce a
  second curve without a documented reason in `decisions.md`.
- Entrances fade + rise (`riseIn` keyframe in `tokens/tokens.css`).
  Nothing bounces, nothing overshoots — see `motion/README.md` for the
  full per-element motion language.
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
