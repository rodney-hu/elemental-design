#!/usr/bin/env node
/**
 * GENSO — genso-check
 *
 *   npx genso-check ./src            lint a consuming project
 *   npm run check                    lint this package (internal + usage)
 *   npx genso-check --rules          list every rule and what it guards
 *   npx genso-check --translate f    fix the mechanical subset of shadcn/
 *                                    21st.dev vocabulary in a pasted file
 *
 * The point of this command existing: every rule this system has is a
 * judgment call logged in docs/decisions.md after something broke — and
 * every one of those things broke in a CONSUMING PROJECT, not in the system
 * repo. A checker that only ran here was guarding the code that had never
 * broken a rule. See the header of scripts/lib/rules-usage.mjs.
 *
 * Exit code 1 on any finding, so it can sit in a build script.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { runUsageRules, ruleDocs } from "../scripts/lib/rules-usage.mjs";
import { runInternalRules } from "../scripts/lib/rules-internal.mjs";
import { collectSources, createReport, display, PKG_ROOT } from "../scripts/lib/source.mjs";
import { translate, formatChanges } from "../scripts/lib/translate.mjs";

const argv = process.argv.slice(2);

/* ------------------------------- --translate --------------------------------- */
/* The other half of remixing a pasted block: genso-check finds the
   violations, --translate fixes the mechanical subset of them. See
   scripts/lib/translate.mjs and docs/remixing.md for the full workflow —
   paste, translate, review the diff, loosen with genso-allow where the
   block is intentionally breaking a rule, integrate. */
if (argv.includes("--translate")) {
  const write = argv.includes("--write");
  const files = argv.filter((a) => !a.startsWith("-"));

  if (!files.length) {
    console.log("genso-check --translate <file...> [--write]\n");
    console.log(
      "  Rewrites the mechanical subset of shadcn/21st.dev vocabulary onto\n" +
        "  Genso tokens (rounded-2xl → rounded-lg, duration-300 → duration,\n" +
        "  ease-out → ease-air, bg-background → bg-void, text-[13px] → text-2xs,\n" +
        "  max-w-[42rem] → max-w-container-sm, …). Prints a diff by default;\n" +
        "  pass --write to apply it. Raw Tailwind palette colours (bg-white/5,\n" +
        "  text-gray-400) have no principled single mapping and are left for\n" +
        "  you to judge — see docs/remixing.md.\n",
    );
    process.exit(1);
  }

  let anyChanges = false;
  for (const file of files) {
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch (err) {
      console.error(`  ✕ can't read ${file}: ${err.message}`);
      continue;
    }
    const { output, changes } = translate(src);
    console.log(`\n  ${file}  (${changes.length} rewrite${changes.length === 1 ? "" : "s"})`);
    console.log(formatChanges(changes));
    if (changes.length) {
      anyChanges = true;
      if (write) writeFileSync(file, output, "utf8");
    }
  }
  console.log(
    write
      ? "\n  Written. Run `genso-check` on the file(s) next — anything left is a\n  judgment call, not a mechanical fix.\n"
      : "\n  Dry run — pass --write to apply.\n",
  );
  process.exit(anyChanges && !write ? 0 : 0);
}

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

  --rules              List every rule and what it guards.
  --translate <file>   Fix the mechanical subset of pasted shadcn/21st.dev
                        vocabulary. Add --write to apply (default: dry run).
  --help               This.
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
