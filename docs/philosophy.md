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

## Four elements, one job

The elements are a **mindset**, and they govern **motion**. They do not
govern colour.

This is the v2.0 correction, and it is the most important sentence in this
file: **an accent is not a job title.** Fire is not "the CTA colour". Earth
is not "the success colour". The four accents exist to complement two
neutrals — ink and paper do the heavy lifting, and the accents are there to
give a page somewhere to go. Lead with earth if earth is what the page wants.

What each element still binds is how a thing *moves*:

| Element | Colour | Trait | Motion signature |
|---|---|---|---|
| 火 Fire | Red (`--fire`) | Bold | **Strike** — most of the distance covered early, a small overshoot, then it holds |
| 水 Water | Blue (`--water`) | Fluid | **Flow** — enters off-axis and eases across. No hard start or stop |
| 土 Earth | Green (`--earth`) | Grounded | **Settle** — arrives from above and lands. Overshoots *downward*; weight, never bounce |
| 風 Air | Gold (`--air`) | Formless | **Drift** — the lightest, slowest to commit. Seems to arrive from nowhere |

So the binding survives, but it moved: from *what a colour may be used for*
to *how a thing behaves*. Colour was the wrong place for it. A rule that says
"only fire may lead" is a rule about hierarchy wearing an elemental costume —
and hierarchy is a composition problem, solved by contrast and space, not by
reserving a hue.

All four signatures run on the system's single easing curve. Their characters
come from keyframe shape, not from four different curves — see
`foundations.md`. Fire's red does not make it urgent; fire's *timing* does.

Fire remains matched to the real logo (`#AA0000`) — the system is grounded in
an existing mark, not designed in a vacuum. That is a fact about the brand,
not a claim on where the colour may appear.

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

**This is a claim about the practitioner, not a rule about the palette.**
Until v2.0 it was enforced as one: exactly one accent could lead a screen,
and all four could only coexist inside a governed "Fourfold". Both rules are
gone. They were solving a real problem — a page sprinkled with four accents
for no reason reads as indecision — but solving it in the wrong place.

The honest version of the concern is just: *don't use colour where you
haven't got a reason.* That's a composition judgment, and it belongs in the
same category as "don't use six type sizes" — advice a designer applies, not
a constraint the system enforces. Enforcing it as a colour rule meant the
system kept saying no to compositions that were perfectly good.

What actually keeps a page disciplined is unchanged and still holds: two
neutrals carry nearly everything, negative space is a default, and glow is
emphasis rather than decoration. The set works precisely because it is rare, bounded,
and everything around it stays disciplined.

## Restraint rules

- Two neutrals (ink, paper) do the heavy lifting. Color is earned, not
  default. This is the rule that actually produces the restraint — not the
  ones about which accent may lead.
- Use as few accents as the page needs. That is advice, not a constraint:
  a page with four accents and a reason for each is fine; a page with four
  accents because the palette has four is not.
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
