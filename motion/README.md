# Motion

One easing curve for the whole system (`--ease-air`, an ease-out curve).
Every animation below uses it. Don't introduce a second curve without
logging why in `docs/decisions.md`.

Each element has one signature motion behavior. When adding a new
animation, find its element first — that decides how it should move.

## 火 Fire — Bold

Sudden, full-strength, no build-up. Glow snaps in on hover/focus rather
than fading in gradually — decisiveness, not a slow reveal.

```css
.fire-glow-on-hover {
  transition: box-shadow var(--duration-default) var(--ease-air);
}
.fire-glow-on-hover:hover {
  box-shadow: 0 0 40px var(--fire-glow-bold);
}
```

## 水 Water — Fluid

Morphing, pooling — never a hard cut. Already implemented as the Card
hover ripple in `components/primitives.tsx` (a radial-gradient
pseudo-element that scales from 0 on hover). Reuse that pattern for
anything that should feel like it's "filling" rather than appearing.

## 土 Earth — Grounded

The absence of motion, mostly. Earth-tagged elements should move less
than their fire/water/air counterparts — a small settle (`translateY`
1-2px) at most, or nothing at all. If you're animating an earth element
a lot, reconsider whether it should be tagged earth.

## 風 Air — Formless

The system's default entrance animation. Already defined in
`tokens/tokens.css` as the `.rise` utility:

```css
@keyframes riseIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Use `.rise` plus a stagger class (`.rise-d1` through `.rise-d4`, 0.05s
apart) for any group of elements entering together. Nothing bounces,
nothing overshoots — air fills space, it doesn't spring into it.

## Rules

- Hover transitions: `var(--duration-default)` (400ms).
- Micro-interactions (button press): `var(--duration-fast)` (150ms),
  usually just `active:scale-95`.
- Entrances: `var(--duration-slow)` (700ms).
- Nothing loops or auto-plays continuously. Every animation is a
  response to something (load, hover, focus) — never ambient/idle
  motion. (This is also why the background glow was removed — see
  `docs/decisions.md`.)

## Still to build

- A documented water-ripple utility class (currently only exists inline
  in `Card`'s CSS-in-JS — worth extracting once a second component needs it)
- A fire-pulse utility for anything that needs recurring (not just
  hover) urgency, e.g. an unread-count badge
