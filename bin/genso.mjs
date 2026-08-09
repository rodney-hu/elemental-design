#!/usr/bin/env node
/**
 * GENSO — genso init
 *
 *   npx genso init [--force]
 *
 * Writes the wiring a project needs to consume this system. It exists because
 * that wiring has TWO documented ways to be silently wrong, both of which cost
 * real debugging time (docs/decisions.md):
 *
 *   1. Tailwind does not merge a preset's `content`. A project's array
 *      replaces the preset's outright, so omitting `...genso.content` means
 *      every class used only inside this package's components is never
 *      generated. `font-kanji`, `bg-earth-soft`, `shadow-glow-earth` all
 *      silently resolved to nothing in production. Nothing errors.
 *   2. The package ships raw .tsx (that is how the preset can scan it), so
 *      Next.js needs `transpilePackages`. Without it the build fails with a
 *      syntax error that never mentions this package.
 *
 * Both are handled here so nobody has to remember either one.
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const cmd = argv.find((a) => !a.startsWith("-"));
const force = argv.includes("--force");

if (cmd !== "init") {
  console.log(`
genso init [--force]

  Scaffolds this project to consume the Genso design system:
    · tailwind.config.js   with the preset's content globs already spread in
    · the CSS import block  (fonts, tokens, tailwind directives, void page)
    · next.config.js note   when Next.js is detected

  --force   overwrite files that already exist
`);
  process.exit(cmd ? 1 : 0);
}

const CWD = process.cwd();
const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* --------------------------- Detect the project ---------------------------- */

let pkg = {};
const pkgPath = join(CWD, "package.json");
if (existsSync(pkgPath)) {
  try {
    pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch {
    /* A malformed package.json shouldn't stop the scaffold; it only affects
       framework detection, which degrades to the Vite path. */
  }
}

const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const isNext = Boolean(deps.next);
const isEsm = pkg.type === "module";
/* An ESM package can't use `require`/`module.exports` in a .js config. */
const configExt = isEsm ? "cjs" : "js";

/* Find the entry stylesheet rather than guessing one path. */
const CSS_CANDIDATES = [
  "src/index.css",
  "src/main.css",
  "src/styles/globals.css",
  "app/globals.css",
  "styles/globals.css",
  "src/app/globals.css",
];
const existingCss = CSS_CANDIDATES.find((p) => existsSync(join(CWD, p)));
const cssPath = existingCss ?? (isNext ? "app/globals.css" : "src/index.css");

const written = [];
const skipped = [];

function write(relPath, contents) {
  const abs = join(CWD, relPath);
  if (existsSync(abs) && !force) {
    skipped.push(relPath);
    return;
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, contents, "utf8");
  written.push(relPath);
}

/* ------------------------------ tailwind.config ---------------------------- */

const tailwindConfig = `/**
 * Genso — Tailwind configuration.
 *
 * ⚠️ The \`...genso.content\` spread is load-bearing. Tailwind does NOT merge a
 * preset's \`content\`: this array replaces the preset's outright. Remove the
 * spread and every utility used only inside the design system's own
 * components (font-kanji, bg-earth-soft, shadow-glow-earth, …) is never
 * generated and silently renders as nothing. Nothing errors.
 *
 * Project-only additions go in \`theme.extend\`. Anything reusable belongs in
 * the design system itself, so every project gets it.
 */
const genso = require("elemental-design/tailwind");

module.exports = {
  presets: [genso],
  content: [
    ...genso.content,
${
  isNext
    ? `    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",`
    : `    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",`
}
  ],
  theme: { extend: {} },
};
`;

write(`tailwind.config.${configExt}`, tailwindConfig);

/* --------------------------------- PostCSS --------------------------------- */

write(
  `postcss.config.${configExt}`,
  `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
);

/* --------------------------------- The CSS --------------------------------- */
/* If the stylesheet already exists, don't clobber it — print the block to
   paste instead. Overwriting someone's global stylesheet is not a thing a
   scaffold should do quietly. */

const cssBlock = `/* Genso — fonts and tokens must come BEFORE the Tailwind directives. */
@import "elemental-design/fonts.css";
@import "elemental-design/tokens.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Void is the page — the bottom of the three-tier elevation scale.
   Content is raised off it on panels (--sumi-2); inputs and wells recess
   into --sumi. Set this once, here, and never paint a section black again. */
body {
  background-color: var(--void);
  color: var(--washi);
  font-family: var(--font-body);
}
`;

const cssAbs = join(CWD, cssPath);
const cssExists = existsSync(cssAbs);
let cssNeedsManualEdit = false;

if (!cssExists) {
  write(cssPath, cssBlock);
} else {
  const current = readFileSync(cssAbs, "utf8");
  if (current.includes("elemental-design/tokens.css")) {
    skipped.push(`${cssPath} (already wired)`);
  } else {
    cssNeedsManualEdit = true;
  }
}

/* ---------------------------------- Report --------------------------------- */

console.log("\nGenso — project scaffold\n");

if (written.length) {
  console.log("  Written:");
  for (const f of written) console.log(`    + ${f}`);
  console.log("");
}

if (skipped.length) {
  console.log("  Left alone (pass --force to overwrite):");
  for (const f of skipped) console.log(`    · ${f}`);
  console.log("");
}

if (cssNeedsManualEdit) {
  console.log(`  ⚠️  ${cssPath} already exists and isn't wired up.`);
  console.log("     Add this at the TOP of it:\n");
  console.log(
    cssBlock
      .split("\n")
      .map((l) => `       ${l}`)
      .join("\n"),
  );
}

if (isNext) {
  console.log(`  ⚠️  Next.js detected.

     This package ships raw .tsx source — that is what lets the Tailwind
     preset scan its components. Next must be told to transpile it:

       // next.config.js
       module.exports = { transpilePackages: ["elemental-design"] };

     Without it, the build fails on the first import with a syntax error
     that does not mention this package.
`);
}

/* Only suggest installing what's actually missing. */
const missing = ["tailwindcss", "postcss", "autoprefixer"].filter(
  (d) => !deps[d],
);
if (missing.length) {
  console.log(`  Install the build dependencies:\n`);
  console.log(`    npm install -D ${missing.join(" ")}\n`);
}
if (deps.tailwindcss && /^[~^]?4/.test(deps.tailwindcss)) {
  console.log(
    `  ⚠️  Tailwind ${deps.tailwindcss} detected. Genso targets Tailwind 3.x —
     v4 dropped the JS preset format this system is built on.\n`,
  );
}

console.log(`  Then lint your own source against the system's rules:

    npx genso-check ./src

  Every rule it enforces is a judgment call logged in docs/decisions.md
  after something broke — and all of them broke in a project like this one,
  not in the system repo. Wire it into your build script.
`);

/* Sanity note if the package isn't actually installed — the configs above
   reference it by name and will fail to resolve. */
const installed =
  existsSync(join(CWD, "node_modules", "elemental-design")) ||
  PKG_ROOT === CWD;
if (!installed) {
  console.log(
    `  ⚠️  elemental-design is not in node_modules yet:

       npm install github:rodney-hu/elemental-design#v0.7.0
`,
  );
}
