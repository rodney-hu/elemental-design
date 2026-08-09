#!/usr/bin/env node
/**
 * GENSO — genso-check
 *
 *   npx genso-check ./src            lint a consuming project
 *   npm run check                    lint this package (internal + usage)
 *   npx genso-check --rules          list every rule and what it guards
 *
 * The point of this command existing: every rule this system has is a
 * judgment call logged in docs/decisions.md after something broke — and
 * every one of those things broke in a CONSUMING PROJECT, not in the system
 * repo. A checker that only ran here was guarding the code that had never
 * broken a rule. See the header of scripts/lib/rules-usage.mjs.
 *
 * Exit code 1 on any finding, so it can sit in a build script.
 */

import { readFileSync } from "node:fs";
import { runUsageRules, ruleDocs } from "../scripts/lib/rules-usage.mjs";
import { runInternalRules } from "../scripts/lib/rules-internal.mjs";
import { collectSources, createReport, display, PKG_ROOT } from "../scripts/lib/source.mjs";

const argv = process.argv.slice(2);

/* --------------------------------- --rules ---------------------------------- */
if (argv.includes("--rules") || argv.includes("-r")) {
  console.log("\nGenso usage rules — each one is a line from docs/decisions.md\n");
  for (const [name, doc] of Object.entries(ruleDocs)) {
    console.log(`  ${name}`);
    console.log(`    ${doc}\n`);
  }
  console.log(
    "Suppress with:  genso-allow: <rule-name> — <reason>\n" +
      "on the offending line or the line above it.\n",
  );
  process.exit(0);
}

if (argv.includes("--help") || argv.includes("-h")) {
  console.log(`
genso-check [paths...]

  paths     Files or directories to lint. Defaults to this package's own
            source plus its internal integrity checks.

  --rules   List every rule and what it guards.
  --help    This.
`);
  process.exit(0);
}

const paths = argv.filter((a) => !a.startsWith("-"));
const internal = paths.length === 0;

const report = createReport();

/* ------------------------------ Internal rules ------------------------------ */
/* Only meaningful against this package — a consumer has no tokens.css of its
   own to be inconsistent with. */
if (internal) {
  runInternalRules(report);
}

/* -------------------------------- Usage rules ------------------------------- */
const targets = internal
  ? ["components", "layout", "showcase"].map((d) => `${PKG_ROOT}/${d}`)
  : paths;

let scanned = 0;
for (const target of targets) {
  for (const file of collectSources(target)) {
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    scanned++;
    runUsageRules(src, file, report);
  }
}

/* --------------------------------- Report ---------------------------------- */
const { findings } = report;

if (!findings.length) {
  console.log(
    `✓ Genso check passed — ${scanned} file${scanned === 1 ? "" : "s"} scanned`,
  );
  process.exit(0);
}

/* Group by file so the output reads like a to-do list rather than a wall. */
const byFile = new Map();
for (const f of findings) {
  const key = f.line === 0 ? f.file : display(f.file);
  if (!byFile.has(key)) byFile.set(key, []);
  byFile.get(key).push(f);
}

console.error(
  `\n✕ Genso check — ${findings.length} problem${findings.length === 1 ? "" : "s"} in ${byFile.size} file${byFile.size === 1 ? "" : "s"}:\n`,
);

for (const [file, items] of byFile) {
  console.error(`  ${file}`);
  for (const f of items.sort((a, b) => a.line - b.line)) {
    const loc = f.line ? `:${f.line}` : "";
    console.error(`    ${loc.padEnd(6)} [${f.rule}] ${f.message}`);
  }
  console.error("");
}

/* Only mention suppression for rules that actually fired — otherwise it reads
   as an invitation to silence the whole thing. */
const fired = [...new Set(findings.map((f) => f.rule))].filter((r) => ruleDocs[r]);
if (fired.length) {
  console.error(
    `  Why these rules exist:  npx genso-check --rules\n` +
      `  Genuine exception:      /* genso-allow: ${fired[0]} — <reason> */\n`,
  );
}

process.exit(1);
