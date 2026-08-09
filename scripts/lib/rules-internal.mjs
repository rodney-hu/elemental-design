/**
 * GENSO — INTERNAL INTEGRITY RULES
 *
 * Checks that only make sense against THIS package: the token graph, the
 * CSS↔JS motion mirror, the alpha caps, contrast, and the element-mark
 * drawing rules. A consuming project has no tokens.css of its own to be
 * inconsistent with, so none of this applies downstream.
 *
 * The rules that DO apply downstream moved to rules-usage.mjs — see the
 * header there for why that split is the point of v0.7.
 *
 * Zero dependencies. Run via `npm run check`.
 */

import { readPkg } from "./source.mjs";

const tokensCss = readPkg("tokens/tokens.css");
const preset = readPkg("tokens/tailwind-preset.cjs");
const motionTs = readPkg("motion/motion.ts");

export function runInternalRules(report) {
  const fail = (check, msg) => report.add(check, check, 0, msg);

  /* ---- 1. Every --*-rgb the preset reads must exist in tokens.css -------- */
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
       never a derived hex var — that is the original opacity bug. */
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

  /* ---- 2. motion.ts must mirror tokens.css ------------------------------ */
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

  /* ---- 3. The preset must scan this package's own components ------------- */
  /* Without this, any utility used only inside components/ or layout/ is never
     generated in the consumer's stylesheet and silently resolves to nothing.
     Found in the wild: font-kanji, bg-earth-soft and shadow-glow-earth were
     all missing from the portfolio's CSS. */
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

  /* ---- 4. Contrast: every -text tint must clear AA on all three tiers ---- */
  /* The void stage makes this safety-critical. The `-text` tints all improve
     on pure black, but the BASE colours get worse: --fire is 2.7:1 and
     --water 4.0:1 on #000, so "base colours are fills only" stops being a
     style rule and becomes an accessibility one. */
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
      ["--void", triplet("void")],
      ["--sumi", triplet("sumi")],
      ["--sumi-2", triplet("sumi-2")],
    ];

    for (const m of tokensCss.matchAll(
      /--([\w-]+)-text-rgb:\s*(\d+)\s+(\d+)\s+(\d+)/g,
    )) {
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

  /* ---- 5. Alpha caps across the whole glow namespace --------------------- */
  /* Four tiers, each with a budget set by how much of the user's field of
     view it covers:
       aura   tints a BACKGROUND          ≤ 0.055 (0.085 hero)
       halo   sits BEHIND an object       ≤ 0.30  (air 0.24)
       sheen  lies ON a surface           ≤ 0.05
       edge   lies ON a 1px border        ≤ 0.55  (air 0.45)
     Without a numeric guard these are prose, and prose is how "just a subtle
     gradient" reintroduces the banned full-page wash one component at a
     time. */
  {
    const caps = { "aura-fire": 0.055, "aura-fire-strong": 0.085 };
    for (const el of ["fire", "water", "earth"]) caps[`halo-${el}`] = 0.3;
    caps["halo-air"] = 0.24;

    for (const [name, cap] of Object.entries(caps)) {
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

    /* Gradient tokens carry several stops, so the cap applies to the
       BRIGHTEST one rather than to a single value. */
    const gradientCaps = {
      sheen: 0.05,
      "edge-fire": 0.55,
      "edge-water": 0.55,
      "edge-earth": 0.55,
      "edge-air": 0.45,
      "divider-fire": 0.2,
    };

    for (const [name, cap] of Object.entries(gradientCaps)) {
      /* Capture the whole gradient value: everything up to the closing paren
         of the linear-gradient(...), across the newlines prettier inserts. */
      const m = tokensCss.match(
        new RegExp(`--${name}:\\s*linear-gradient\\(([\\s\\S]*?)\\);`),
      );
      if (!m) {
        fail("alpha-cap", `tokens.css does not define --${name}`);
        continue;
      }
      const alphas = [...m[1].matchAll(/\/\s*([\d.]+)\s*\)/g)].map((a) =>
        parseFloat(a[1]),
      );
      if (!alphas.length) continue; // no alpha stops (e.g. a var()-only gradient)
      const peak = Math.max(...alphas);
      if (peak > cap) {
        fail(
          "alpha-cap",
          `--${name} peaks at ${peak}, above its documented cap of ${cap}`,
        );
      }
    }
  }

  /* ---- 6. Element mark drawing rules ------------------------------------ */
  {
    const marks = readPkg("components/marks.tsx");
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
      fail(
        "marks",
        `marks must stroke currentColor so they inherit their element`,
      );
    }
    if (/<circle/.test(marks)) {
      fail(
        "marks",
        `no circle enclosure — that is the ATLA glyph structure this set deliberately avoids`,
      );
    }
  }

  /* ---- 7. Every element must have both halves of its behavior ----------- */
  /* philosophy.md gives each element a colour AND a behavior. Earth's — the
     rooting shadow — was described from v0.1 and had no token until v0.7,
     which is invisible unless something looks for it. */
  {
    for (const el of ["fire", "water", "earth", "air"]) {
      if (!new RegExp(`--${el}-rgb:`).test(tokensCss)) {
        fail("elements", `--${el}-rgb is not defined`);
      }
      if (!new RegExp(`--${el}-text-rgb:`).test(tokensCss)) {
        fail("elements", `--${el}-text-rgb is not defined — every element needs a text-safe tint`);
      }
      if (!new RegExp(`--halo-${el}:`).test(tokensCss)) {
        fail("elements", `--halo-${el} is not defined`);
      }
    }
    if (!/--shadow-root-earth:/.test(tokensCss)) {
      fail(
        "elements",
        "--shadow-root-earth is not defined — earth's behavior half (weight, not emission) has no token",
      );
    }
  }
}
