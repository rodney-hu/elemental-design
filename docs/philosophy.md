# Philosophy

## The name

**Genso (元素)** — Japanese for "element," the word used for chemical
elements. It closes a loop: the four classical elements were literally
alchemy's raw materials, and this system exists to *transmute* a blank
project into something with immediate identity — same instinct as the
"Alchemist" framing behind the work this system serves.

## The core tension

Two things that are usually traded off against each other, held at once:

- **Restraint** — dark, minimal, generous negative space (間 *ma* — the
  Japanese principle that empty space is load-bearing, not leftover).
- **Premium energy** — real glow, real motion, a system that feels alive
  rather than muted. Minimalism is not an excuse for dullness.

Every component in this system should be checked against both: does it
hold restraint, and does it still feel premium? A component that's quiet
but flat has failed as much as one that's flashy but cluttered.

## Four elements, two jobs each

Each element does double duty — it's a **color** and a **behavior**.
Neither is decorative; both come from the same trait.

| Element | Color | Trait | As a color | As a behavior |
|---|---|---|---|---|
| 火 Fire | Red (`--fire`) | Bold | The primary accent — the one color allowed to insist | Full-strength glow on primary actions; the strike |
| 水 Water | Blue (`--water`) | Fluid | Secondary accent, info | The hover morph — panels lift and pool light rather than switching state |
| 土 Earth | Green (`--earth`) | Grounded | Stability, success states | Wide, low shadows that root elements into the page |
| 風 Air | Gold (`--air`) | Formless | The elevated/premium accent | The motion language — fade and rise, ease-out, never bounce |

Fire is primary because it matches the real-world logo (`#AA0000`) — the
system is grounded in an existing mark, not designed in a vacuum.

## Martial and spiritual grounding

The four traits aren't arbitrary adjectives — they're meant to read the
way a martial-arts or spiritual practice would frame the same four
elements:

- **Fire is bold** — the committed strike. Decisive, not reckless.
- **Water is fluid** — yields to overcome; wears down stone through
  persistence, not force.
- **Earth is grounded** — the stance you strike from. Patient, rooted,
  alive (this is why earth is green, not brown — cultivated ground, not
  dirt).
- **Air is formless** — breath and spirit, *mushin* (no-mind). The most
  refined element, which is why it gets gold: the elevated, precious
  register.

When adding anything new to this system — a component, an animation, a
layout — ask which element it belongs to, and let that element's trait
(not just its color) shape the decision.

## The Avatar principle — mastery is the set, not the mix

The four elements are not four options to pick from. Holding all four is
the point: the same person who strikes decisively can also yield, also
root, also let go. That is what mastery of a practice looks like, and
it's the claim this system is built to make — in work, and in everything
else the four traits describe.

**But commanding all four does not mean using all four at once.** A
master bends one element at a time, and is recognised as a master by
moving cleanly between them. Four elements deployed simultaneously is not
mastery; it's noise.

So the system holds both:

- **One accent leads any given moment.** This is unchanged, and it is
  still the default everywhere.
- **The full four appear only as a deliberate composition of peers** —
  four cells, one element each, equal in size, weight and glow. That
  composition is a *claim about range*, not a decoration. It is called a
  **Fourfold**, and `foundations.md` sets the five conditions it has to
  meet.

The failure mode this rules out is the tempting one: sprinkling all four
accents across a page because the palette has four colors. That reads as
indecision, not range. The set works precisely because it is rare, bounded,
and everything around it stays disciplined.

## Restraint rules

- Two neutrals (ink, paper) do the heavy lifting. Color is earned, not
  default.
- One accent leads per screen — except inside a Fourfold set, the one
  sanctioned exception (see the Avatar principle above, and the Fourfold
  Rule in `foundations.md`). Fire and Air can both glow, but they
  shouldn't compete for the same moment.
- Sharp corners, not soft ones — precision over softness, closer to a
  shoji screen's rectilinear grid than a rounded glass panel.
- Glow is emphasis, not decoration. If everything glows, nothing does.

## What this is not

This is not a rebuild of Elemental Aura (the prior system, now archived).
It shares DNA — dark, glow, premium hover states — but Genso is its own
identity: Japanese-minimalist rather than generic-dark-SaaS, four-element
rather than single-accent, brush-marked rather than purely geometric. See
`docs/decisions.md` for the specific things that changed and why.

It is also not an Avatar: The Last Airbender tribute. The four-element
framing here predates that reference and comes from the classical
elements and martial practice; the series is simply another descendant of
the same source. Nothing in this system copies its artwork — the element
marks in `components/marks.tsx` are original and deliberately structured
to be unlike it. See `docs/decisions.md`.
