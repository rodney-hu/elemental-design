# Decisions

A running log of judgment calls and why they were made. Newest first.
When you settle something non-obvious, add it here — the point is that
nobody (including future-you) has to re-derive it from scratch.

---

**The Tailwind preset declares its own content globs.**
Found the first time a packaged component was actually rendered downstream:
the kanji register came out in the body font. Cause — the consumer's
`content` only covered its own `src/`, so every utility appearing *only*
inside this package's components was never generated. `font-kanji`,
`bg-earth-soft` and `shadow-glow-earth` were all silently missing, which
meant `Badge tone="earth"` had no background and `Card accent="earth"` had no
glow. `hover:border-water/40` survived purely by coincidence, because the
consuming project happened to use the same class in its own source.

This is the same failure mode as the original opacity-modifier bug — a class
that reads correctly in the component and resolves to nothing in the browser —
and the README was actively teaching it, by showing a `content` array with
only the project's own files.

The first attempt at a fix was wrong, and the wrong version is worth recording
because it is the intuitive one: **Tailwind does not merge a preset's
`content`.** Declaring globs in the preset and expecting them to combine with
the project's array does nothing — the project's array replaces the preset's
outright. Verified with `resolveConfig` on 3.4.19: with a project `content`
present, only the project's files survive; the preset's apply *only* if the
project omits `content` entirely, which no real project does. The build stayed
byte-identical, which is what gave it away.

What actually works: the preset still declares its own absolute globs (via
`__dirname`, so they resolve wherever the package is installed), but as
something the consumer **spreads in** —
`content: [...genso.content, "./src/**/*.{ts,tsx}"]`. `npm run check` fails if
the preset ever stops exporting them, though it cannot verify a given consumer
spreads them; the README carries that.

Two lessons worth keeping. **A design system distributed as source must tell
the consumer's build where its source is** — nothing else in the toolchain
notices that it didn't. And **a config fix isn't verified until you diff the
output**: an unchanged build artifact is evidence, not a coincidence.

**Void is the page. Content lives on ink panels.** *(supersedes "Pure black is
a stage, not a background", below.)*
The earlier call was made on reasoning; this one was made after looking at it.
Once the Fourfold shipped on a real void section, the verdict was immediate:
black reads better as the page, and panels raised off it are both easier to
read and more present as objects. The numbers agreed — a card separates from
its background at **1.09:1 on void** versus **1.04:1 on ink**, and going solid
takes it to **1.19:1**. On ink, panels had been very nearly invisible.

So the relationship is reversed, and the neutrals become a real elevation
scale rather than a page colour plus a panel colour:

| Tier | Token | Role |
|---|---|---|
| Page | `--void` | the stage; nothing else sits here |
| Recessed | `--sumi` | inputs, wells, code blocks |
| Raised | `--sumi-2` | cards, modals, anything holding content |

Consequences that had to move with it:

- **Hairlines default to 0.14 / 0.24**, up from 0.09 / 0.18. Those were tuned
  when the page was ink; against black a 0.09 border dissolves and a card
  loses its edge.
- **Cards are solid, not translucent.** `bg-sumi-2/60` composited to
  `rgb(16 14 13)` on black — barely a surface. The `backdrop-blur` went with
  it: on a flat page there was nothing behind it to blur, so it was pure cost.
- **The `.void` utility is gone.** It existed to opt *into* black; a class that
  paints a section black on top of a black page is a no-op. `.ink` and
  `.panel` replace it for the rarer case of deliberately raising or recessing
  a region.
- **Water's "glassmorphism" is now the hover morph, not the glass tint** — the
  lift and the pooling glow. `philosophy.md` updated; the behaviour survives,
  the implementation of it doesn't.
- The contrast check now measures every `-text` tint against **all three**
  tiers, not just ink and void.

The one thing kept from the old rule: **long prose still belongs on a panel,
not directly on the void.** Short passages on black are fine and look good;
sustained reading on pure black is not, and that half of the original argument
was right.

**Pure black is a stage, not a background.** *(superseded — see above. Kept
because the reasoning is still sound for the half that survived: sustained
reading belongs on a panel, not on raw black.)*
The reference material that prompted v0.5 is all on `#000000`, and the
temptation was to move `--sumi` there. Rejected: ink/paper is the metaphor
the whole system is built on, and long reading passages on true black are
harsher. Instead `--void` is opt-in via a `.void` class, for the moments
where a mark, silhouette or Fourfold has to carry — everything else stays on
ink. Verified while deciding: the four `-text` tints all *gain* contrast on
black (fire 7.5:1, water 7.5:1, earth 9.2:1, air 10.9:1), so the stage costs
nothing in legibility. The base colours get worse, though — `--fire` is
2.7:1 and `--water` 4.0:1 on `#000` — which is why "base colours are fills
only" stopped being a style rule and became a guarded one. `--line` also
re-binds inside `.void` (0.09 → 0.14): a hairline at ink strength starts
dissolving on black, and cards lose their edge.

**Object glow ("halo") is a separate namespace from background glow ("aura").**
The wanted look — a glowing element mark on black — reads like a direct
contradiction of "the page background does not glow." It isn't, and the
distinction is worth naming precisely because it's the thing most likely to
be eroded later. An *aura* tints a background: one hue, corner-anchored,
alpha ≤0.055, because at that scale anything more reads as "the background
is tinted." A *halo* is bound to an object's own box, so it can go to 0.30
without ever washing a page. Same physics, different budget, enforced
numerically by `npm run check` — and applying `.halo` to a `<section>` or
`<main>` is a hard failure, because that is exactly how the banned full-page
wash would come back wearing a new name.

**The Fourfold rule — how "master of all four elements" survives contact
with "one accent leads per screen."**
These two genuinely conflict, and the resolution came from the reference
images: they never mix four accents inside one object. They show four
*panels*, one element each, that read as a set. So mastery is expressed as
composition, not saturation — a Fourfold is four peers of equal size, weight
and glow, and it is a claim about range. Everywhere outside it, one accent
still leads. The rule has five conditions (see `foundations.md`) and the
`Fourfold` component enforces the two most breakable ones — arity and
canonical order — in the type system rather than in prose. The failure mode
being ruled out is the tempting one: sprinkling all four accents across a
page because the palette has four colours. That reads as indecision, not
range.

**Element marks are original, and structured to be unlike the obvious source.**
The v0.5 direction was prompted by Avatar: The Last Airbender. That series is
Nickelodeon/Paramount IP and this system runs a commercial site, so its
element symbols are not usable — and copying them would also make the system
someone else's rather than Rodney's. The marks in `components/marks.tsx` are
drawn from Genso's own vocabulary instead: the shoji grid, sharp corners,
single-weight line. Every ATLA glyph is circle-enclosed and spiral-based;
none of these is, and `npm run check` fails on a `<circle>` in the mark file
to keep it that way. Each mark is *open* in the way its element is open —
fire's apex is cut with the stroke still travelling through it, air is only
the four corners of a square with the edges never drawn. **Do not "improve" a
mark back toward the source.** Known and accepted: air's four-corner form is
close to the common "fullscreen/scan" UI idiom, which is tolerable because
element marks always appear in element contexts with a label.

**The showcase needed its own reduced-motion guard.**
`tokens.css` gates every entrance on `prefers-reduced-motion`, but
`showcase/index.html` inlines its own CSS rather than importing tokens, so it
never inherited that block and had been animating regardless of the setting.
Fixed by duplicating the guard there. This is the recurring cost of the
showcase being deliberately standalone — the same reason its palette needs
check #5.

**`document.fonts.check()` cannot verify glyph coverage.**
Worth recording because it looks like the right API and is confidently wrong:
it reports whether a matching font *face* is loaded, not whether that face
contains the glyph, so it returned `true` for 氷 — a character definitely not
in the subset. Measure rendered width against a fallback instead. This came
up verifying that 流 (in the 流れるように sample) really is in the Ma Shan
Zheng subset; it is, and `assets/fonts/README.md` had understated the subset
as "hiragana in 流れるように" when the kanji is included too.

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

Ported into this repo's `tokens.css` in v0.4, along with the channel-triplet
fix — see the entries below.

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

`--semantic-warning-text` also exists, deliberately identical to its base —
`#EAB308` already clears AA as a glyph. It's there so every Status tone uses
the same `-text` suffix instead of one tone breaking the pattern.

Rule of thumb: any token that will ever be a glyph needs ≥4.5:1 against
both `--sumi` and `--sumi-2`, and ≥7:1 if it renders below 15px.

---

**`-webkit-font-smoothing: antialiased` — don't.**
It thins every glyph stem on macOS. On a dark background that reads as
"the text looks fine/small" even when contrast measures AAA, and it sent
a readability investigation chasing colour when the cause was rendering.
Leave the default subpixel antialiasing.

---

**The system is installed as a package, not copied file-by-file.**
The original quick-start said "copy `tokens.css` and `tailwind.config.js`
into the project." That is what broke it. Building `gtm-portfolio` surfaced
three real bugs (see the three entries below); all three were fixed *in the
portfolio* and none flowed back, so within one project cycle the "source of
truth" was the more broken, less accessible, less complete copy. Copying has
no path back upstream, so drift is guaranteed the first time anyone patches a
bug under deadline pressure — which is exactly what happened. The system now
ships a `package.json` with an exports map, and the Tailwind config is a
*preset* (Tailwind's own mechanism for shared config that consumers extend
rather than duplicate). One copy of every value, everywhere.

**Colors are authored once, as RGB channel triplets.**
Tailwind opacity modifiers (`bg-air/10`, `border-water/40`) cannot compose an
alpha channel onto an opaque `var(--fire)` hex value — the class silently
resolves to nothing. `primitives.tsx` had been using those modifiers since
v0.2 against a config that could not satisfy them. The portfolio's fix was to
add a parallel set of `--fire-rgb` triplets *alongside* the hex values, which
worked but created a second problem: two representations of every color to
keep in sync by hand, forever. Resolved by making the triplet the only
authored value and deriving everything else from it —
`--fire: rgb(var(--fire-rgb))`, `--fire-soft: rgb(var(--fire-rgb) / 0.18)`.
One number per color, and both plain CSS and Tailwind alpha work.

**`--line` / `--line-strong` are wired into Tailwind, not just defined.**
Both tokens existed from v0.1 but were never added to the Tailwind config, so
every component reaching for a hairline border hand-typed
`border-white/[0.18]` instead — violating the system's own "never hand-type a
color" rule in three primitives and two shells. Now exposed as `border-line`
and `border-line-strong`, and `npm run check` fails on a `white/xx` literal.

**JS animation gets its own constants file, mirrored from the CSS tokens.**
`--ease-air` is unreachable from framer-motion, GSAP, or the Web Animations
API — none of them can read a CSS variable. The result in production: one
component hand-typed the bezier as a magic `[0.16, 1, 0.3, 1]` array, another
used `ease: "easeInOut"` (a second easing curve, which `foundations.md`
explicitly forbids), and three components invented durations — 0.3s and 0.45s
— that matched none of the three sanctioned values. None of it was visible in
review. `motion/motion.ts` now exports `easeAir`, `duration`, and ready-made
`riseIn` / `riseInOnScroll` transitions, and `npm run check` asserts the JS
values still equal the CSS ones.

**Reduced motion is honored at the system level, not per project.**
Every entrance in this system is decorative, so there was no reason to make
each project remember to gate it. `tokens.css` now zeroes animation and
transition durations under `prefers-reduced-motion: reduce`, and
`motion.ts` exports a `prefersReducedMotion()` helper for the JS side.

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
