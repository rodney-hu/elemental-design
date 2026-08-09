/**
 * GENSO — USAGE RULES
 *
 * Rules that are true of ANY source tree using this system, so they run both
 * here and in a consuming project via `npx genso-check ./src`.
 *
 * Every rule below is a line from docs/decisions.md made executable. None of
 * them is invented, and that matters: this system's whole method is that a
 * judgment call gets logged once and never re-litigated. A rule with no
 * incident behind it is a preference, and preferences don't belong in a
 * failing build.
 *
 * The reason this file exists at all: every failure in the decision log
 * happened DOWNSTREAM — 11 type sizes, three <h2> sizes, five tracking
 * values, a second easing curve, three invented durations, five hardcoded
 * hairlines. Not one was ever in this package's components/. The old checker
 * only looked here, so it was guarding the code that had never broken a rule.
 *
 * Suppress with `genso-allow: <rule-name> — <reason>` on the line or the one
 * above. Rule names are the `rule` field on each finding.
 */

import { readPkg, stripComments, collectAllowances, lineAt } from "./source.mjs";

/* ------------------------- Facts read from the package ------------------------ */

const tokensCss = readPkg("tokens/tokens.css");
const preset = readPkg("tokens/tailwind-preset.cjs");

/* Which Tailwind colours can take an opacity modifier. Read from the preset
   rather than hardcoded, so a consumer always gets the truth for the version
   they installed. */
const alphaComposable = new Set();
for (const [, name, value] of preset.matchAll(/"?([\w-]+)"?:\s*"([^"]+)"/g)) {
  if (value.includes("<alpha-value>")) alphaComposable.add(name);
}

/* The kanji the fonts are actually subset to. Anything else silently falls
   back to a system font with no visible error (assets/fonts/README.md). */
const KANJI_SUBSET = new Set([..."元素墨紙朱金水土風火流"]);
const CJK = /[㐀-䶿一-鿿]/gu;

/* ---------------------------------- Rules ----------------------------------- */
/* Each rule is { name, test(ctx) } where ctx = { src, file, report }.
   `src` is comment-stripped; line numbers are preserved. */

const rules = [
  /* — Colour — the original rule, and the one with the most incidents —— */
  {
    name: "hardcoded-color",
    doc: "Never hand-type a colour. Add it to tokens.css first (foundations.md).",
    test({ src, add }) {
      for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        add(m.index, `hand-typed hex "${m[0]}" — add it to tokens.css instead`);
      }
      /* rgb()/hsl() literals are the same violation wearing a different hat,
         and the old checker missed them entirely because it only looked for #. */
      for (const m of src.matchAll(
        /\b(?:rgba?|hsla?)\(\s*\d+[\s,]/g,
      )) {
        add(
          m.index,
          `hand-typed "${m[0].trim()}…" colour literal — use a token`,
        );
      }
    },
  },

  {
    name: "raw-neutral",
    doc: "The neutrals are --void / --sumi / --sumi-2 / --washi, never black or white.",
    test({ src, add }) {
      for (const m of src.matchAll(
        /\b(?:bg|text|border|ring|decoration|from|to|via)-(?:white|black)(?:\/[\w[\].%]+)?\b/g,
      )) {
        add(
          m.index,
          `"${m[0]}" — use the neutral tokens (bg-void / bg-sumi / bg-sumi-2 / text-washi / border-line)`,
        );
      }
    },
  },

  {
    name: "uncomposable-alpha",
    doc: "The original portfolio bug: an opacity modifier on a colour that cannot take one resolves to nothing.",
    test({ src, add }) {
      for (const m of src.matchAll(
        /\b(?:bg|border|text|ring|decoration|from|to|via|shadow)-([a-z][\w-]*?)\/(?:\[?[\d.]+%?\]?)/g,
      )) {
        const color = m[1];
        const known =
          alphaComposable.has(color) ||
          /^(?:black|white|current|transparent|inherit)$/.test(color) ||
          /-\d{2,3}$/.test(color); // Tailwind's own scales
        if (!known) {
          add(
            m.index,
            `"${m[0]}" applies an opacity modifier to "${color}", which the preset does not expose as alpha-composable — it will silently render as nothing`,
          );
        }
      }
    },
  },

  /* — Type — the largest cluster of logged failures —————————————————— */
  {
    name: "arbitrary-type",
    doc: "The type scale exists precisely because one site produced 11 distinct sizes below 24px and three <h2> sizes.",
    test({ src, add }) {
      for (const m of src.matchAll(
        /\b(?:text|leading|tracking)-\[[^\]]+\]/g,
      )) {
        // text-[#hex] is a colour, already reported by hardcoded-color.
        if (/text-\[#/.test(m[0])) continue;
        add(
          m.index,
          `"${m[0]}" — use the type scale (text-2xs…text-4xl, leading-*, tracking-label/display). Sizes below 20px are fixed; display sizes are fluid clamp()s and need no responsive variant`,
        );
      }
      /* Raw CSS in a style prop or stylesheet. */
      for (const m of src.matchAll(
        /(?:font-size|line-height|letter-spacing)\s*:\s*(?!var\()[^;"'}\n]+/gi,
      )) {
        add(m.index, `"${m[0].trim()}" — use a --text-* / --leading-* / --tracking-* token`);
      }
    },
  },

  {
    name: "uppercase-heading",
    doc: "A whole page of section headings once shipped as 12px uppercase mono labels (decisions.md).",
    test({ src, add }) {
      /* Uppercase on a real heading element. */
      for (const m of src.matchAll(
        /<h[1-3]\b[^>]*?\bclass(?:Name)?=\{?["'`][^"'`]*\buppercase\b/g,
      )) {
        add(
          m.index,
          `uppercase on <${m[0].slice(1, 3)}> — uppercase is for the brush wordmark and small mono eyebrow labels only. If it labels a block of content, it needs font-head at a real size (use <Heading>)`,
        );
      }
      /* Uppercase on the Heading component is the same mistake, later. */
      for (const m of src.matchAll(
        /<Heading\b[^>]*?\bclassName=\{?["'`][^"'`]*\buppercase\b/g,
      )) {
        add(m.index, `uppercase on <Heading> — use <Eyebrow> if it's a label, not a heading`);
      }
      /* An <h*> whose only styling is a mono label treatment. */
      for (const m of src.matchAll(
        /<h[1-3]\b[^>]*?\bclass(?:Name)?=\{?["'`][^"'`]*\bfont-mono\b[^"'`]*\btracking-label\b/g,
      )) {
        add(
          m.index,
          `<${m[0].slice(1, 3)}> styled as a mono eyebrow label — a heading gets font-head at a real size`,
        );
      }
    },
  },

  {
    name: "tiny-type",
    doc: "13px is the hard floor. Below it, uppercase + letter-spacing destroys word-shape recognition — the single biggest driver of a 'text is hard to read' complaint despite AAA contrast.",
    test({ src, add }) {
      for (const m of src.matchAll(/\btext-\[(\d+(?:\.\d+)?)px\]/g)) {
        if (parseFloat(m[1]) < 13) {
          add(m.index, `"${m[0]}" is below the 13px floor (--text-2xs)`);
        }
      }
      for (const m of src.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/gi)) {
        if (parseFloat(m[1]) < 13) {
          add(m.index, `"${m[0]}" is below the 13px floor (--text-2xs)`);
        }
      }
    },
  },

  /* — Motion — three components invented durations, one invented a curve —— */
  {
    name: "unsanctioned-duration",
    doc: "Three durations exist. If the value you want isn't one of the three, the answer is one of the three (foundations.md).",
    test({ src, add }) {
      for (const m of src.matchAll(/\bduration-(\d+|\[[^\]]+\])\b/g)) {
        add(
          m.index,
          `"${m[0]}" — the system has exactly three durations: duration-fast (150ms), duration-DEFAULT (400ms), duration-slow (700ms)`,
        );
      }
      /* The JS side: a raw seconds/ms literal on a transition. The lookbehind
         excludes the CSS properties `animation-duration` / `transition-duration`,
         which are how the reduced-motion guard is written. */
      for (const m of src.matchAll(
        /(?<![-\w])duration:\s*(\d*\.?\d+)\b/g,
      )) {
        const v = parseFloat(m[1]);
        const sanctioned = [0.15, 0.4, 0.7, 150, 400, 700];
        if (!sanctioned.includes(v)) {
          add(
            m.index,
            `duration ${m[1]} is not one of the three sanctioned values — import { duration } from "elemental-design/motion"`,
          );
        }
      }
    },
  },

  {
    name: "second-easing",
    doc: "One easing curve for the whole system. A second one reached production undetected as ease:'easeInOut' (decisions.md).",
    test({ src, add }) {
      for (const m of src.matchAll(
        /\bease-(?:in|out|in-out|linear)\b|\bease:\s*["'](?:easeIn|easeOut|easeInOut|linear|anticipate|backOut)["']/g,
      )) {
        add(
          m.index,
          `"${m[0]}" introduces a second easing curve — use ease-air, or import { easeAir } from "elemental-design/motion"`,
        );
      }
      /* The hand-typed bezier — right value, wrong mechanism. It stops being
         right the moment --ease-air changes, and nothing would catch it.
         The lookbehind exempts the token's own definition (`--ease-air:
         cubic-bezier(...)`), which is the one place the curve is authored. */
      for (const m of src.matchAll(
        /(?<!--ease-[\w-]{0,20}:\s{0,4})cubic-bezier\(\s*[\d.]+\s*,|\[\s*0\.16\s*,\s*1\s*,\s*0\.3\s*,\s*1\s*\]/g,
      )) {
        add(
          m.index,
          `hand-typed easing curve — import { easeAir } from "elemental-design/motion" so it tracks the token`,
        );
      }
    },
  },

  /* — Shape and space ——————————————————————————————————————————— */
  {
    name: "soft-radius",
    doc: "Sharp corners are the single biggest 'feel' difference between Genso and the archived Elemental Aura system (decisions.md).",
    test({ src, add }) {
      for (const m of src.matchAll(/\brounded-(?:xl|2xl|3xl)\b/g)) {
        add(
          m.index,
          `"${m[0]}" — radius stays sharp: rounded (2px) on controls, rounded-md (3px) on cards, rounded-lg (6px) at most. rounded-full is fine for pills and dots`,
        );
      }
      for (const m of src.matchAll(/\brounded-\[[^\]]+\]/g)) {
        add(m.index, `"${m[0]}" — use the radius scale`);
      }
    },
  },

  {
    name: "arbitrary-space",
    doc: "The space scale runs xs…5xl. A hand-typed value is how section rhythm ended up different per page.",
    test({ src, add }) {
      for (const m of src.matchAll(
        /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-\[[^\]]+\]/g,
      )) {
        add(m.index, `"${m[0]}" — use the space scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl)`);
      }
    },
  },

  {
    name: "arbitrary-width",
    doc: "Four container widths and one measure exist so a site can't end up with three content widths across three page types.",
    test({ src, add }) {
      for (const m of src.matchAll(/\bmax-w-\[[^\]]+\]/g)) {
        add(
          m.index,
          `"${m[0]}" — use max-w-measure for prose, or max-w-container-sm/md/lg/xl (or the <Container> component)`,
        );
      }
    },
  },

  /* — v0.6 / v0.7 patterns that are now dead ——————————————————————— */
  {
    name: "dead-pattern",
    doc: "Patterns removed by a version bump that still look plausible in older code.",
    test({ src, add }) {
      for (const m of src.matchAll(/\bbackdrop-blur(?:-\w+)?\b/g)) {
        add(
          m.index,
          `"${m[0]}" — panels are solid as of v0.6. On a flat black page there is nothing behind a panel to blur, so it is pure cost`,
        );
      }
      for (const m of src.matchAll(/\bbg-sumi(?:-2)?\/[\w[\].%]+/g)) {
        add(
          m.index,
          `"${m[0]}" — panels are solid. A translucent panel on the void composites to 1.09:1 against the page versus 1.19:1 solid (decisions.md)`,
        );
      }
      /* The lookbehind matters: `bg-void`, `fill-void` and
         `ring-offset-void` are all correct usage of the TOKEN. Only a bare
         `void` in a class list is the removed utility. */
      for (const m of src.matchAll(
        /\bclass(?:Name)?=\{?["'`][^"'`]*(?<![-\w])void(?![-\w])/g,
      )) {
        add(
          m.index,
          `the \`.void\` utility was removed in v0.6 — void is the page now. Set it once on <body>; use .panel or .ink to raise or recess a region`,
        );
      }
      for (const m of src.matchAll(/\bborder-line-void(?:-strong)?\b/g)) {
        add(m.index, `"${m[0]}" was removed in v0.7 — there is one hairline pair: border-line / border-line-strong`);
      }
    },
  },

  /* — Glow budget ————————————————————————————————————————————— */
  {
    name: "page-halo",
    doc: "A halo on a page-level element is the banned full-page wash under a new name (decisions.md).",
    test({ src, add }) {
      for (const m of src.matchAll(
        /<(section|main|body|Section)\b[^>]*?\bclass(?:Name)?=\{?["'`][^"'`]*\bhalo\b/g,
      )) {
        add(
          m.index,
          `halo applied to <${m[1]}> — halos bind to objects, not pages. A background is tinted by an aura (alpha ≤0.055), not lit by a halo (≤0.30)`,
        );
      }
    },
  },

  /* — Fonts ————————————————————————————————————————————————— */
  {
    name: "kanji-outside-subset",
    doc: "The fonts are subset. An unlisted glyph falls back to a system font with no visible error.",
    test({ src, add }) {
      for (const m of src.matchAll(CJK)) {
        if (!KANJI_SUBSET.has(m[0])) {
          add(
            m.index,
            `kanji "${m[0]}" is outside the font subset — it will silently fall back. Re-subset first (assets/fonts/README.md)`,
          );
        }
      }
    },
  },

  {
    name: "cdn-font",
    doc: "CDN font loading silently failed in a sandboxed preview once and broke every custom font with no visible error.",
    test({ src, add }) {
      for (const m of src.matchAll(/fonts\.(?:googleapis|gstatic)\.com/g)) {
        add(
          m.index,
          `"${m[0]}" — fonts are self-hosted and subsetted. Import "elemental-design/fonts.css" instead`,
        );
      }
    },
  },

  {
    name: "font-smoothing",
    doc: "It thins glyph stems on macOS and reads as 'the text is too small' even at AAA contrast (decisions.md).",
    test({ src, add }) {
      for (const m of src.matchAll(
        /-webkit-font-smoothing\s*:\s*antialiased|\bantialiased\b/g,
      )) {
        add(
          m.index,
          `"${m[0]}" — leave the default subpixel antialiasing. This sent a readability investigation chasing colour when the cause was rendering`,
        );
      }
    },
  },
];

/* ------------------------------- Entry point -------------------------------- */

export const usageRuleNames = rules.map((r) => r.name);

export function runUsageRules(rawSrc, file, report) {
  const allowed = collectAllowances(rawSrc);
  const src = stripComments(rawSrc);

  for (const rule of rules) {
    rule.test({
      src,
      file,
      add(index, message) {
        const line = lineAt(src, index);
        if (allowed.get(line)?.has(rule.name)) return;
        report.add(rule.name, file, line, message);
      },
    });
  }
}

export const ruleDocs = Object.fromEntries(rules.map((r) => [r.name, r.doc]));
