# Decisions

A running log of judgment calls and why they were made. Newest first.
When you settle something non-obvious, add it here — the point is that
nobody (including future-you) has to re-derive it from scratch.

---

**Ambient background glow — removed.**
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
