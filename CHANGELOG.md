# Changelog

Terse version list. Reasoning for each change lives in `docs/decisions.md`.

## v0.3 — current
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
