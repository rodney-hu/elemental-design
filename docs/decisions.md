# Decisions

A running log of judgment calls and why they were made. Newest first.
When you settle something non-obvious, add it here — the point is that
nobody (including future-you) has to re-derive it from scratch.

---

**Background glow — partially reinstated, as corner-anchored section auras.**
Supersedes the "ambient background glow — removed" entry below, but only
half of it. First used on rodneyhu.com (gtm-portfolio).

The original rejection was correct about *what was tried*: three
full-page radial glows in three different hues read as "the background
is tinted." The complaint that brought it back was equally real, though
— on a long scrolling page, flat `--sumi` end to end reads bland, and
there is nothing to mark section transitions.

What's allowed now, and why it doesn't repeat the failure:
- **One hue only** (fire), never three.
- **Anchored to a section's top corner**, pushed ~45% off the horizontal
  edge, with `transparent 68%` falloff — so it dies before the reading
  column. The centre of every section stays true `--sumi`.
- **Alpha capped at 0.055** (0.085 for a hero). Above that it tints.
- **Not every section gets one**, and they alternate sides. The untinted
  stretches are the point: they're what makes it read as rhythm while
  scrolling instead of a wash. Two adjacent auras is the mistake.
- **Static only.** The "background does not *animate*" half of the
  foundations rule still stands — no keyframes, no scroll listener.

Tokens: `--aura-fire`, `--aura-fire-strong`, `--aura-size`. The `.aura`
/ `.aura-l` / `.aura-r` / `.aura-strong` geometry lives with them.
If a future project wants this and it reads as a tint, the alpha is
wrong or two auras are adjacent — check those before widening the rule.

---

**Uppercase micro-labels are allowed for eyebrow labels only.**
foundations.md says uppercase is reserved for the brush wordmark. That
holds for headings and body copy, but a small uppercase mono eyebrow
("CASE STUDIES", "HOW I WORK") is a label, not a heading, and it carries
the technical register the system wants. Allowed under three conditions,
learned the hard way on rodneyhu.com where all three were violated:
- **13px floor.** Below that, uppercase plus letter-spacing destroys
  word-shape recognition — this was the single biggest driver of a
  "text is hard to read" complaint, despite AAA contrast.
- **`--tracking-label` (0.1em), not wider.** An earlier version had five
  competing values from 0.12em to 0.18em doing the same job.
- **Never on something that is actually a heading.** The tell: if it
  labels a block of content and would be an `<h2>`/`<h3>` in the markup,
  it needs `--font-head` at a real size, not a mono label. A whole page
  of section headings had been rendered as 12px mono labels.

---

**A type scale exists now — use it instead of arbitrary sizes.**
The system shipped with tokens for colour, space, radius and motion but
*none* for type, so every project invented its own sizes inline. On
rodneyhu.com that produced 11 distinct sizes below 24px and 8 arbitrary
heading values — three different `<h2>` sizes on one site.

`--text-2xs` … `--text-4xl` plus `--leading-*` and `--tracking-*` are
defined in tokens.css. Sizes below 20px are fixed; display sizes are
fluid `clamp()` so one definition covers every viewport and no `sm:`
heading variants are needed. Body copy is `--text-base` (17px).

**Not yet ported into this repo's own tokens.css** — it currently lives
in gtm-portfolio's copy. Port it here so the next project inherits it,
along with the `--*-rgb` channel-triplet fix (see the entry on Tailwind
opacity modifiers).

---

**Semantic colours need `-text` variants; the base values fail as text.**
`--semantic-error` (`#AA0000`) is **2.43:1** on `--sumi` — far below the
4.5:1 floor and effectively invisible. It shipped that way and a real
form-validation message was unreadable on rodneyhu.com before anyone
measured it.

Base semantic values are for fills and borders only. Added
`--semantic-error-text` (#F87171, 6.81:1) and `--semantic-success-text`
(#4ADE80, 10.81:1). Same split as the element colours, where `--fire` is
the fill and `--fire-text` is the readable tint — that pattern was right,
it just hadn't been applied to the semantic axis.

`--fire-text` also moved from `#E2574A` to `#F0776A`: at 4.79:1 on
`--sumi-2` the original was marginal, and it was being used on small
labels. The new value sits level with `--water-text` (6.8:1) so the
accent tints are internally consistent.

Rule of thumb: any token that will ever be a glyph needs ≥4.5:1 against
both `--sumi` and `--sumi-2`, and ≥7:1 if it renders below 15px.

---

**`-webkit-font-smoothing: antialiased` — don't.**
It thins every glyph stem on macOS. On a dark background that reads as
"the text looks fine/small" even when contrast measures AAA, and it sent
a readability investigation chasing colour when the cause was rendering.
Leave the default subpixel antialiasing.

---

**Ambient background glow — removed.**
*(Superseded in part — see "Background glow — partially reinstated" above.)*
Early versions put three soft radial-gradient glows behind the whole
page (fire top-right, gold top-left, water lower-left). It read as "the
background is red-tinted" rather than "there's a subtle effect," and
fought the ink-black minimalism the system is supposed to hold. Glow now
only appears on things being directly interacted with (buttons, cards on
hover). Background is flat `--sumi`.

**Earth is green, not brown.**
Brown read as literal dirt. Green reads as *living* ground — cultivated,
growing, patient — which fits "grounded" as a character trait, not just
a color association.

**Air is gold; the separate "kintsugi" gold accent was merged into it.**
An earlier version had gold as a second, separate "premium/featured"
accent (framed around kintsugi, 金継ぎ — gold-seam pottery repair) sitting
alongside a 4-color elemental palette, for 5 accents total. That was one
accent too many. Air was formless/refined already — gold fit it
naturally, so kintsugi's role folded into Air rather than existing
separately. The result: exactly 4 element accents, not 5.

**Water moved from teal to blue.**
Original water tone was a muted teal (`#4C7A7E`). Moved to a clearer
blue (`#1E6FB8`) when the palette was restructured around exactly four
element colors — teal read as closer to earth's territory once green
entered the palette.

**Fire is matched to the real logo, not designed freely.**
`--fire: #AA0000` was sampled directly from Rodney's actual logo file,
not chosen aesthetically. Primary accent should never drift from this
without checking the logo first.

**Wordmark font is split into two font roles, not one.**
The brush wordmark uses Permanent Marker (Latin marker/paint-brush
style), referenced from a photo of hand-lettered signage Rodney liked.
It cannot render kanji — Google serves it Latin-only. Ma Shan Zheng
(East Asian ink-calligraphy brush) handles kanji marks separately. Using
one "brush" variable for both was the original approach and it silently
broke kanji rendering — hence the split into `--font-brush` /
`--font-kanji`.

**Fonts are self-hosted (subsetted, base64-embedded), not CDN-linked.**
Google Fonts links worked in some preview contexts and silently failed
in others (sandboxed HTML preview with no external network access),
making the wordmark and kanji marks fall back to system fonts with no
visible error. Fonts are now subset to only the characters actually used
on the page (fonttools `pyftsubset`) and embedded as base64 `@font-face`
data URIs — no runtime network dependency at all. Total cost: ~150KB
across all 5 font families, which is cheap insurance against a hard-to-
diagnose failure mode.

**Sharp corners, not rounded.**
The prior system (Elemental Aura) used soft rounded corners throughout
(8px+, "rounded-lg" register). Genso deliberately breaks from that —
2-3px radius, closer to architectural/shoji-screen precision. This is
the single biggest structural difference in "feel" between the two
systems, so it's called out explicitly rather than left implicit.

**Semantic color kept separate from element color, despite overlap.**
Red is both Fire (element) and Error (semantic). They're allowed to
share a hex value but not a variable — `--fire` and `--semantic-error`
are distinct tokens. Reasoning: element meaning and semantic meaning are
different axes and will eventually diverge (e.g. a future warning state
shouldn't accidentally inherit Fire's "primary action" weight just
because they're both red-adjacent).

**GitHub push deferred; repo built locally first.**
GitHub connector wasn't available when this repo was scaffolded (see
project history). Structure was built and organized locally so nothing
blocks on connector access — push happens whenever it's back up.
