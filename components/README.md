# Components

Reusable UI primitives built directly on `tokens/tokens.css`. See
`docs/foundations.md` before adding a new variant — most "should I add a
new color variant" questions are already answered there.

## What's here

`primitives.tsx`
- `Button` — variants: `primary` (fire), `air` (elevated/featured), `secondary` (neutral)
- `Card` — a solid raised panel. `accent`: `fire`, `water` (default), `earth`, `air`
  — sets which element leads the hover morph. `interactive` is **visual only** and
  defaults to `false`; for a genuinely clickable card use `CardLink`, which
  renders an `<a>` and carries the system focus ring.
- `CardLink` / `CardButton` — `Card`'s clickable twins. Semantics come from the
  element, not a prop: navigate with one, act with the other.
- `Input` (with `invalid` / disabled states), `Label`, `ErrorText`
- `Badge` — one tone per element: `fire`, `water`, `earth`, `air`
- `Status` — semantic pills: `error`, `warning`, `success`
- `CompareRow` — old-way/new-way comparison rows

`typography.tsx`
- `Heading` — `level` 1–4. One size per level, so a project cannot end up with
  three different `<h2>` sizes (it did once — see `docs/decisions.md`).
- `Eyebrow` — the uppercase mono micro-label. Never renders an `<h*>`.
- `Prose` — body copy at `--measure`, on a panel by default.
- `Text`, `Link`

`forms.tsx`
- `FormField` — wires `Label` + control + `ErrorText` together with a generated
  id, `aria-describedby` and `aria-invalid`. No single component can do this;
  the wiring lives *between* them, which is why it never got done by hand.
- `Textarea`, `Select`, `Checkbox`, `Radio`, `RadioGroup` (fieldset + legend)

## Conventions

- One file per logical group, not one file per component — `primitives.tsx`
  holds everything foundational. Split out a new file only once a group
  gets large enough to need its own home (e.g. a future `forms.tsx` if
  input-related components grow past what fits here comfortably).
- Every component takes `className` and merges it last, so callers can
  override without fighting specificity.
- No component reaches for `earth` or a hardcoded color directly for
  emphasis — `earth` is grounding/stability, not an attention-getter. If
  something needs to visually lead, that's `fire` or `air`'s job.

## Still to build

- Modal / dialog shell (native `<dialog>`, focus trap, Escape)
- Toast / notification (semantic-status-driven, `aria-live`)
- Tabs (roving tabindex + ARIA)
- Table
