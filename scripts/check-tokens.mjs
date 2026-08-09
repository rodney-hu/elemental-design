#!/usr/bin/env node
/**
 * GENSO — SYSTEM INTEGRITY CHECK
 *
 * Zero dependencies. Run with `npm run check`.
 *
 * Guards the failure modes that actually bit this system, so they can't come
 * back silently:
 *
 *   1. A Tailwind colour points at an `--x-rgb` triplet that tokens.css
 *      doesn't define  →  the class resolves to nothing, silently.
 *   2. motion.ts drifts from tokens.css  →  JS and CSS animate differently.
 *   3. A component hand-types a hex code or a `white/xx` literal instead of
 *      using a token  →  the exact rule foundations.md sets, unenforced.
 *   4. A component uses an opacity modifier (`bg-air/10`) on a colour that
 *      isn't alpha-composable  →  the original portfolio bug.
 *   5. showcase/index.html's inlined palette drifts from tokens.css.
 *   6. A `-text` tint fails WCAG AA, or a base colour gets used as a glyph.
 *   7. An aura or halo exceeds its documented alpha cap.
 *   8. An element mark breaks the drawing rules (round caps, wrong grid).
 *   9. A kanji character outside the font subset  →  silent fallback.
 *  10. `.halo` on a section/main  →  the banned full-page wash, renamed.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);

const tokensCss = read("tokens/tokens.css");
const preset = read("tokens/tailwind-preset.cjs");
const motionTs = read("motion/motion.ts");

/* Strip comments so doc-comments mentioning a hex don't trip the linter. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/* ---- 1. Every --*-rgb the preset reads must exist in tokens.css ---------- */
{
  const defined = new Set(
    [...tokensCss.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]),
  );
  const used = new Set(
    [...preset.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]),
  );
  for (const v of used) {
    if (!defined.has(v)) {
      fail("tailwind-preset", `reads ${v}, which tokens.css does not define`);
    }
  }

  /* Any colour exposed with <alpha-value> must read a bare channel triplet,
     never a derived hex var — that is bug #1. */
  for (const [, name, value] of preset.matchAll(
    /"?([\w-]+)"?:\s*"([^"]*<alpha-value>[^"]*)"/g,
  )) {
    if (!/rgb\(var\(--[\w-]+-rgb\)\s*\/\s*<alpha-value>\)/.test(value)) {
      fail(
        "tailwind-preset",
        `colour "${name}" uses <alpha-value> but does not read an --*-rgb triplet: ${value}`,
      );
    }
  }
}

/* ---- 2. motion.ts must mirror tokens.css -------------------------------- */
{
  const cssEase = tokensCss.match(/--ease-air:\s*cubic-bezier\(([^)]+)\)/);
  const jsEase = motionTs.match(/export const easeAir = \[([^\]]+)\]/);

  if (!cssEase) fail("motion", "tokens.css does not define --ease-air");
  if (!jsEase) fail("motion", "motion.ts does not export easeAir");

  if (cssEase && jsEase) {
    const norm = (s) => s.split(",").map((n) => parseFloat(n.trim()));
    const a = norm(cssEase[1]);
    const b = norm(jsEase[1]);
    if (a.length !== b.length || a.some((n, i) => n !== b[i])) {
      fail(
        "motion",
        `easeAir [${b}] does not match --ease-air [${a}] in tokens.css`,
      );
    }
  }

  const durBlock = motionTs.match(
    /export const duration = \{([\s\S]*?)\} as const;/,
  );
  if (!durBlock) {
    fail("motion", "motion.ts does not export a `duration` object");
  } else {
    for (const key of ["fast", "default", "slow"]) {
      const cssMs = tokensCss.match(
        new RegExp(`--duration-${key}:\\s*(\\d+)ms`),
      );
      const jsS = durBlock[1].match(new RegExp(`${key}:\\s*([\\d.]+)`));
      if (!cssMs) {
        fail("motion", `tokens.css does not define --duration-${key}`);
      } else if (!jsS) {
        fail("motion", `motion.ts duration is missing "${key}"`);
      } else if (Math.round(parseFloat(jsS[1]) * 1000) !== Number(cssMs[1])) {
        fail(
          "motion",
          `duration.${key} is ${jsS[1]}s (${parseFloat(jsS[1]) * 1000}ms) but --duration-${key} is ${cssMs[1]}ms`,
        );
      }
    }
  }
}

/* ---- 3 & 4. Components must go through tokens ---------------------------- */
{
  const alphaComposable = new Set();
  for (const [, name, value] of preset.matchAll(
    /"?([\w-]+)"?:\s*"([^"]+)"/g,
  )) {
    if (value.includes("<alpha-value>")) alphaComposable.add(name);
  }

  const sources = [];
  for (const dir of ["components", "layout"]) {
    for (const f of readdirSync(join(ROOT, dir))) {
      if ([".tsx", ".ts", ".jsx", ".js"].includes(extname(f))) {
        sources.push(`${dir}/${f}`);
      }
    }
  }

  for (const file of sources) {
    const src = stripComments(read(file));

    for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      fail(file, `hand-typed hex "${m[0]}" — add it to tokens.css instead`);
    }

    for (const m of src.matchAll(/\b(?:bg|border|text|ring|from|to|via|decoration)-white\/[\w[\].]+/g)) {
      fail(file, `hardcoded "${m[0]}" — use the --line / washi tokens instead`);
    }

    /* Opacity modifier on a colour the preset can't compose alpha onto. */
    for (const m of src.matchAll(
      /\b(?:bg|border|text|ring|decoration|from|to|via)-([a-z][\w-]*?)\/(?:\[?[\d.]+%?\]?)/g,
    )) {
      const color = m[1];
      const known =
        alphaComposable.has(color) ||
        /^(?:black|white|current|transparent|inherit)$/.test(color) ||
        // Tailwind's own scales (slate-500 etc.) are always composable.
        /-\d{2,3}$/.test(color);
      if (!known) {
        fail(
          file,
          `"${m[0]}" applies an opacity modifier to "${color}", which the Tailwind preset does not expose as alpha-composable`,
        );
      }
    }
  }
}

/* ---- 5. The showcase's inlined palette must match tokens.css ------------- */
/* showcase/index.html is deliberately a standalone, network-free file, so it
   embeds its own copy of the palette rather than importing tokens.css. That
   copy is a third place a colour can live — and it silently fell two versions
   behind before this check existed. */
{
  const showcase = read("showcase/index.html");

  const triplets = new Map();
  for (const m of tokensCss.matchAll(
    /--([\w-]+)-rgb:\s*(\d+)\s+(\d+)\s+(\d+)/g,
  )) {
    const hex =
      "#" +
      [m[2], m[3], m[4]]
        .map((n) => Number(n).toString(16).padStart(2, "0"))
        .join("");
    triplets.set(m[1], hex.toLowerCase());
  }

  for (const m of showcase.matchAll(
    /--([\w-]+):\s*(#[0-9A-Fa-f]{6})\b/g,
  )) {
    const [, name, hex] = m;
    const canonical = triplets.get(name);
    if (canonical && canonical !== hex.toLowerCase()) {
      fail(
        "showcase",
        `--${name} is ${hex} but tokens.css defines ${canonical.toUpperCase()}`,
      );
    }
  }
}

/* ---- 5b. The preset must scan this package's own components -------------- */
/* Without this, any utility used only inside components/ or layout/ is never
   generated in the consumer's stylesheet and silently resolves to nothing —
   the same failure mode as the original opacity bug. Found in the wild:
   font-kanji, bg-earth-soft and shadow-glow-earth were all missing from the
   portfolio's CSS because its content globs only covered its own src/. */
{
  const dirs = ["components", "layout"];
  if (!/content:\s*\[/.test(preset)) {
    fail(
      "tailwind-preset",
      "declares no `content` — consumers will silently drop every class used only inside this package",
    );
  } else {
    for (const d of dirs) {
      if (!new RegExp(`["'\`]${d}["'\`]`).test(preset)) {
        fail(
          "tailwind-preset",
          `content does not cover ${d}/ — classes used only there will not be generated downstream`,
        );
      }
    }
    if (!preset.includes("__dirname")) {
      fail(
        "tailwind-preset",
        "content paths must be absolute (derived from __dirname), or they resolve against the consumer's cwd",
      );
    }
  }
}

/* ---- 6. Contrast: every -text tint must clear AA on ink AND void --------- */
/* The void stage makes this safety-critical. The `-text` tints all improve on
   pure black, but the BASE colours get worse: --fire is 2.7:1 and --water
   4.0:1 on #000, so "base colours are fills only" stops being a style rule
   and becomes an accessibility one. */
{
  const srgb = (c) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  const lum = ([r, g, b]) =>
    0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const triplet = (name) => {
    const m = tokensCss.match(
      new RegExp(`--${name}-rgb:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)`),
    );
    return m ? [+m[1], +m[2], +m[3]] : null;
  };

  const backdrops = [
    ["--sumi", triplet("sumi")],
    ["--void", triplet("void")],
  ];

  for (const m of tokensCss.matchAll(/--([\w-]+)-text-rgb:\s*(\d+)\s+(\d+)\s+(\d+)/g)) {
    const fg = [+m[2], +m[3], +m[4]];
    for (const [bgName, bg] of backdrops) {
      if (!bg) continue;
      const r = ratio(fg, bg);
      if (r < 4.5) {
        fail(
          "contrast",
          `--${m[1]}-text is ${r.toFixed(2)}:1 on ${bgName} — below the 4.5:1 floor for text`,
        );
      }
    }
  }
}

/* ---- 7. Alpha caps for aura and halo ------------------------------------ */
/* The caps lived only in prose. An aura tints a background (≤0.055, 0.085 on
   a hero); a halo is bound to an object (≤0.30, air ≤0.24). */
{
  const caps = { "aura-fire": 0.055, "aura-fire-strong": 0.085 };
  for (const el of ["fire", "water", "earth"]) caps[`halo-${el}`] = 0.3;
  caps["halo-air"] = 0.24;

  for (const [name, cap] of Object.entries(caps)) {
    /* Note the nested parens: the value is `rgb(var(--x-rgb) / 0.055)`, so a
       naive [^)]* stops inside var(...). \s spans newlines too, because
       prettier wraps the longer declarations. */
    const m = tokensCss.match(
      new RegExp(
        `--${name}:\\s*rgb\\(\\s*var\\(--[\\w-]+\\)\\s*/\\s*([\\d.]+)`,
      ),
    );
    if (!m) {
      fail("alpha-cap", `tokens.css does not define --${name}`);
    } else if (parseFloat(m[1]) > cap) {
      fail(
        "alpha-cap",
        `--${name} is ${m[1]}, above its documented cap of ${cap}`,
      );
    }
  }
}

/* ---- 8. Element mark drawing rules -------------------------------------- */
{
  const marks = read("components/marks.tsx");
  if (/strokeLinecap=["'{]?\s*["']?round/.test(marks)) {
    fail("marks", `round line caps contradict the sharp-corner rule`);
  }
  if (/strokeLinejoin=["'{]?\s*["']?round/.test(marks)) {
    fail("marks", `round line joins contradict the sharp-corner rule`);
  }
  if (!marks.includes('viewBox="0 0 24 24"')) {
    fail("marks", `marks must share the 24x24 grid`);
  }
  if (!marks.includes('stroke="currentColor"')) {
    fail("marks", `marks must stroke currentColor so they inherit their element`);
  }
  if (/<circle/.test(marks)) {
    fail(
      "marks",
      `no circle enclosure — that is the ATLA glyph structure this set deliberately avoids`,
    );
  }
}

/* ---- 9. Kanji must stay inside the font subset --------------------------- */
/* The fonts are subset to exactly these glyphs. Anything else silently falls
   back to a system font with no visible error — see assets/fonts/README.md. */
{
  /* Verified empirically against mashan400.woff2, not taken from the README:
     render each glyph at 100px in the kanji font vs. a fallback and compare
     widths — identical width means it fell back. (`document.fonts.check()`
     is NOT usable here; it returns true for glyphs the font doesn't have.)
     流 is present, from the 流れるように sample. 氷 is not — a useful probe. */
  const SUBSET = new Set([..."元素墨紙朱金水土風火流"]);
  const CJK = /[㐀-䶿一-鿿]/gu;
  const scan = [
    ...readdirSync(join(ROOT, "components")).map((f) => `components/${f}`),
    ...readdirSync(join(ROOT, "layout")).map((f) => `layout/${f}`),
    "showcase/index.html",
  ].filter((p) => /\.(tsx?|jsx?|html)$/.test(p));

  for (const file of scan) {
    for (const m of read(file).matchAll(CJK)) {
      if (!SUBSET.has(m[0])) {
        fail(
          file,
          `kanji "${m[0]}" is outside the font subset — it will silently fall back. Re-subset first (assets/fonts/README.md)`,
        );
      }
    }
  }
}

/* ---- 10. A halo must never be applied to a page-level element ------------ */
/* This is the one that stops halo creep from quietly recreating the banned
   full-page background glow under a new name. */
{
  for (const dir of ["components", "layout"]) {
    for (const f of readdirSync(join(ROOT, dir))) {
      if (!/\.(tsx?|jsx?)$/.test(f)) continue;
      const src = stripComments(read(`${dir}/${f}`));
      for (const m of src.matchAll(
        /<(section|main|body)\b[^>]*className={?["'`][^"'`]*\bhalo\b/g,
      )) {
        fail(
          `${dir}/${f}`,
          `halo applied to <${m[1]}> — halos bind to objects, not pages (foundations.md)`,
        );
      }
    }
  }
  const showcase10 = read("showcase/index.html");
  for (const m of showcase10.matchAll(
    /<(section|main|body)\b[^>]*class=["'][^"']*\bhalo\b/g,
  )) {
    fail(
      "showcase",
      `halo applied to <${m[1]}> — halos bind to objects, not pages`,
    );
  }
}

/* ------------------------------- Report ---------------------------------- */
if (failures.length) {
  console.error(`\n✕ Genso integrity check — ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  • ${f}`);
  console.error("");
  process.exit(1);
}

console.log("✓ Genso integrity check passed");
