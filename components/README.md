# Components

Reusable UI primitives built directly on `tokens/tokens.css`. See
`docs/foundations.md` before adding a new variant — most "should I add a
new color variant" questions are already answered there.

## What's here

`primitives.tsx`
- `Button` — variants: `primary` (fire), `air` (elevated/featured), `secondary` (neutral)
- `Card` — accent: `water` (default, fluid glass) or `air` (elevated)
- `Input`, `Label`, `ErrorText`
- `Badge` — one tone per element: `fire`, `water`, `earth`, `air`
- `Status` — semantic pills: `error`, `warning`, `success`
- `CompareRow` — old-way/new-way comparison rows

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

Nothing yet has a real usage case beyond the showcase page. Candidates,
add here as they come up:
- Modal / dialog shell
- Toast / notification (semantic-status-driven)
- Tabs
- Table
