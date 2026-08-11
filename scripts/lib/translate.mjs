/**
 * GENSO — TRANSLATE
 *
 * The mechanical half of remixing a pasted 21st.dev/shadcn-shaped block:
 * rewrite the classes that have a well-defined, unambiguous Genso
 * equivalent, and leave everything else alone for a human to judge.
 *
 * This is NOT the same job as `rules-usage.mjs`. That file says "this is a
 * violation." This file says "and here's what to replace it with" — for the
 * subset of violations where the replacement is mechanical rather than a
 * judgment call. Two things are deliberately left alone:
 *   · raw Tailwind palette colours (bg-white/5, text-gray-400, …) — there is
 *     no single principled Genso equivalent for an arbitrary gray step, so
 *     rewriting it would be a guess wearing an autofix's confidence.
 *   · anything genso-check doesn't already have a rule for.
 *
 * Used by `genso-check --translate` (bin/genso-check.mjs).
 */

import { classRanges, inRanges } from "./source.mjs";

/* — Shadcn semantic colour name → Genso token name —
   Longer names first in the alternation build below, so "card-foreground"
   matches before the "card" prefix of "card-foreground" would. */
const SHADCN_COLOR_MAP = {
  background: "void",
  foreground: "washi",
  "card-foreground": "washi",
  card: "sumi-2",
  "popover-foreground": "washi",
  popover: "sumi-2",
  "muted-foreground": "washi-dim",
  muted: "sumi",
  border: "line",
  input: "line-strong",
  ring: "fire",
  "primary-foreground": "on-fire",
  primary: "fire",
  "secondary-foreground": "washi",
  secondary: "sumi-2",
  "accent-foreground": "on-water",
  accent: "water",
  "destructive-foreground": "washi",
  destructive: "error",
};

const COLOR_NAMES = Object.keys(SHADCN_COLOR_MAP).sort(
  (a, b) => b.length - a.length,
);
const COLOR_UTILITIES =
  "bg|text|border|ring|from|to|via|decoration|divide|outline|fill|stroke";

const shadcnColorRegex = new RegExp(
  `\\b((?:[\\w-]+:)*)(${COLOR_UTILITIES})-(${COLOR_NAMES.join("|")})(\\/[\\w.\\[\\]%]+)?\\b`,
  "g",
);

/* — Duration: nearest of the three real durations, in ms — */
const DURATIONS = [
  { name: "fast", ms: 150 },
  { name: "DEFAULT", ms: 400 },
  { name: "slow", ms: 700 },
];
const nearestDuration = (ms) =>
  DURATIONS.reduce((best, d) =>
    Math.abs(d.ms - ms) < Math.abs(best.ms - ms) ? d : best,
  ).name;

/* Same table the preset's containment layer uses for named duration-N —
   kept in sync by hand (both are short and rarely change together). */
const NAMED_DURATION_BUCKET = {
  75: "fast",
  100: "fast",
  150: "fast",
  200: "fast",
  300: "DEFAULT",
  400: "DEFAULT",
  500: "DEFAULT",
  700: "slow",
  1000: "slow",
};

/* — Radius: nearest of the three real steps, in px — */
const RADII = [
  { name: "", px: 2 }, // `rounded`
  { name: "-md", px: 3 },
  { name: "-lg", px: 6 },
];
const nearestRadius = (px) =>
  RADII.reduce((best, r) =>
    Math.abs(r.px - px) < Math.abs(best.px - px) ? r : best,
  ).name;

/* — Type scale: fixed sizes only (2xl–4xl are fluid clamps and don't have a
   single px value to reverse-map from). — */
const TEXT_SCALE = [
  { name: "2xs", px: 13 },
  { name: "xs", px: 14 },
  { name: "sm", px: 15 },
  { name: "base", px: 17 },
  { name: "md", px: 18 },
  { name: "lg", px: 20 },
  { name: "xl", px: 24 },
];
const nearestText = (px) =>
  TEXT_SCALE.reduce((best, t) =>
    Math.abs(t.px - px) < Math.abs(best.px - px) ? t : best,
  ).name;

/* — Containers: nearest of the four page widths, in px — */
const CONTAINERS = [
  { name: "container-sm", px: 640 },
  { name: "container-md", px: 896 },
  { name: "container-lg", px: 1152 },
  { name: "container-xl", px: 1344 },
];
const nearestContainer = (px) =>
  CONTAINERS.reduce((best, c) =>
    Math.abs(c.px - px) < Math.abs(best.px - px) ? c : best,
  ).name;

const toPx = (num, unit) => {
  if (unit === "px") return num;
  if (unit === "rem" || unit === "em") return num * 16;
  return null;
};

/**
 * Run every mechanical rewrite over `src`. Returns the new source and a list
 * of `{ before, after }` pairs for a diff, in the order they were applied.
 */
export function translate(src) {
  const changes = [];
  let out = src;
  // `ease-out` / `ease-in` / `ease-in-out` are also ordinary English (see the
  // same guard in rules-usage.mjs) — computed once, up front, against the
  // ORIGINAL source. Every other rewrite here targets syntax that can't
  // collide with prose (a bracketed value, a `-N` suffix, a known token
  // name), so only that one rule needs the scope check.
  const easeClassRanges = classRanges(src);

  const rewrite = (regex, fn) => {
    out = out.replace(regex, (match, ...rest) => {
      const replacement = fn(match, ...rest);
      if (replacement === null || replacement === match) return match;
      changes.push({ before: match, after: replacement });
      return replacement;
    });
  };

  /* ease-out / ease-in / ease-in-out → ease-air (already CONTAINED by the
     preset; this is a readability rewrite). Runs FIRST, and checked against
     `easeClassRanges` (computed above, against the untouched source) —
     `out` is still character-for-character `src` at this point, so those
     offsets are still valid. Every rewrite below this one changes string
     length, which would desync a range check computed up front; ordering
     this one first is what keeps it correct rather than needing to
     recompute ranges after every step. */
  rewrite(/\bease-(?:in-out|in|out)\b/g, (match, ...rest) => {
    // String.replace's callback always ends (..., offset, fullString) —
    // there are no capture groups in this pattern, so offset is rest[0].
    const offset = rest[0];
    if (!inRanges(easeClassRanges, offset)) return null;
    return "ease-air";
  });

  /* shadcn semantic colours → Genso tokens */
  rewrite(shadcnColorRegex, (_match, prefix, util, name, alpha = "") => {
    const token = SHADCN_COLOR_MAP[name];
    if (!token) return null;
    return `${prefix}${util}-${token}${alpha}`;
  });

  /* rounded-xl/2xl/3xl → rounded-lg (already CONTAINED by the preset, so
     this is a readability rewrite, not a functional fix). */
  rewrite(/\brounded-(?:xl|2xl|3xl)\b/g, () => "rounded-lg");

  /* rounded-[Npx] → nearest real step */
  rewrite(/\brounded-\[(\d+(?:\.\d+)?)px\]/g, (_m, n) => {
    const step = nearestRadius(parseFloat(n));
    return `rounded${step}`;
  });

  /* ease-[cubic-bezier(...)] → ease-air */
  rewrite(/\bease-\[cubic-bezier\([^)]*\)\]/g, () => "ease-air");

  /* duration-N (named Tailwind scale) → the real name, so the file reads in
     Genso vocabulary even though the preset already made it WORK unrewritten. */
  rewrite(/\bduration-(\d+)\b/g, (_m, n) => {
    const bucket = NAMED_DURATION_BUCKET[n];
    if (!bucket) return null;
    return bucket === "DEFAULT" ? "duration" : `duration-${bucket}`;
  });

  /* duration-[Nms] / duration-[Ns] → nearest real duration */
  rewrite(/\bduration-\[(\d+(?:\.\d+)?)(ms|s)\]/g, (_m, n, unit) => {
    const ms = unit === "s" ? parseFloat(n) * 1000 : parseFloat(n);
    const name = nearestDuration(ms);
    return name === "DEFAULT" ? "duration" : `duration-${name}`;
  });

  /* text-[Npx] → nearest fixed step on the type scale. Sizes at or above
     20px are left alone — text-2xl/3xl/4xl are fluid clamps with no single
     px value to reverse-map to; a human picks the right display size. */
  rewrite(/\btext-\[(\d+(?:\.\d+)?)px\]/g, (_m, n) => {
    const px = parseFloat(n);
    if (px >= 22) return null;
    return `text-${nearestText(px)}`;
  });

  /* max-w-[Nch] → measure / measure-display */
  rewrite(/\bmax-w-\[(\d+(?:\.\d+)?)ch\]/g, (_m, n) => {
    const ch = parseFloat(n);
    return Math.abs(ch - 22) < Math.abs(ch - 68) ? "max-w-measure-display" : "max-w-measure";
  });

  /* max-w-[Npx|rem|em] → nearest sanctioned container */
  rewrite(/\bmax-w-\[(\d+(?:\.\d+)?)(px|rem|em)\]/g, (_m, n, unit) => {
    const px = toPx(parseFloat(n), unit);
    if (px === null) return null;
    return `max-w-${nearestContainer(px)}`;
  });

  return { output: out, changes };
}

/** A unified-diff-ish summary for terminal output — not a real patch format,
    just enough context to review before `--write`. */
export function formatChanges(changes) {
  if (!changes.length) return "  (no mechanical rewrites found)";
  return changes
    .map((c, i) => `  ${i + 1}. ${c.before}  →  ${c.after}`)
    .join("\n");
}
