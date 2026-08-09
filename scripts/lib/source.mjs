/**
 * GENSO — SOURCE SCANNING
 *
 * Shared plumbing for both rule sets: reading the package's own tokens,
 * walking a source tree, and the `genso-allow` suppression protocol.
 *
 * Zero dependencies, on purpose. This has to run in a consumer's build with
 * no install step beyond the package itself.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

/* The package root, resolved from THIS file rather than from cwd — so a
   consumer running `npx genso-check ./src` still reads the installed
   package's real tokens.css and preset, not something in their own tree. */
export const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const readPkg = (p) => readFileSync(join(PKG_ROOT, p), "utf8");

const SOURCE_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".html",
  ".vue",
  ".svelte",
  ".astro",
  ".mdx",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  "out",
]);

/** Recursively collect source files under a file or directory path. */
export function collectSources(target) {
  const out = [];
  const walk = (p) => {
    let st;
    try {
      st = statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      const base = p.split("/").pop();
      if (SKIP_DIRS.has(base)) return;
      for (const entry of readdirSync(p)) walk(join(p, entry));
    } else if (SOURCE_EXT.has(extname(p))) {
      out.push(p);
    }
  };
  walk(target);
  return out.sort();
}

/**
 * Strip comments so a doc-comment mentioning a hex, a banned class name, or
 * an example doesn't trip a rule. Replaces with same-length whitespace so
 * line numbers survive — a linter that reports the wrong line gets ignored.
 */
export function stripComments(src) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/^([ \t]*)\/\/.*$/gm, (m) => blank(m));
}

/**
 * The suppression protocol: `genso-allow: <rule> — <reason>`.
 *
 * A linter with no escape hatch gets switched off wholesale the first time
 * it's wrong, and then guards nothing. This one is deliberately narrow:
 *   · it names a specific rule, so it can't blanket-silence the file
 *   · it requires a reason, so the next reader knows whether it still holds
 *   · it applies to THAT LINE and the one after, not the rest of the file
 *
 * Must be parsed BEFORE stripComments, since it lives in a comment.
 */
export function collectAllowances(rawSrc) {
  /** Map<lineNumber, Set<ruleName>> */
  const allowed = new Map();
  const lines = rawSrc.split("\n");

  lines.forEach((line, i) => {
    for (const m of line.matchAll(/genso-allow:\s*([\w-]+)\s*[—-]\s*\S/g)) {
      const rule = m[1];
      // The line it's on, and the next line (comment above the code).
      for (const target of [i + 1, i + 2]) {
        if (!allowed.has(target)) allowed.set(target, new Set());
        allowed.get(target).add(rule);
      }
    }
  });

  return allowed;
}

/**
 * Character ranges that are class-attribute values — `class="…"`,
 * `className="…"`, `className={cx("…", "…")}` and template literals.
 *
 * Some Tailwind utilities are also ordinary English. `ease-out` is the one
 * that bites: a rule matching it anywhere fires on the sentence "a single
 * ease-out and three durations", and a linter that flags your prose is a
 * linter that gets switched off. Rules for utilities whose names collide with
 * normal writing check membership in these ranges instead of scanning raw
 * source.
 *
 * Utilities that can't collide (`duration-300`, `rounded-xl`, `text-[13px]`)
 * don't need this and keep scanning everything, so a value in a style object
 * or a stylesheet is still caught.
 */
export function classRanges(src) {
  const ranges = [];

  /* The attribute, then everything up to the balanced end of its value. Both
     the plain "…" form and the {…} expression form, which may contain several
     strings (cx("a", "b")) — taking the whole expression is close enough,
     since anything inside it is class-ish by construction. */
  for (const m of src.matchAll(/\bclass(?:Name)?=(?:"([^"]*)"|'([^']*)'|\{)/g)) {
    const start = m.index + m[0].length;
    if (m[1] !== undefined || m[2] !== undefined) {
      ranges.push([start - (m[1] ?? m[2]).length - 1, start]);
      continue;
    }
    /* Brace form: walk to the matching close brace. */
    let depth = 1;
    let i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    ranges.push([start, i]);
  }

  /* A CSS transition/animation shorthand is equally a real usage. */
  for (const m of src.matchAll(
    /(?:transition|animation)(?:-timing-function)?\s*:[^;\n}]*/g,
  )) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  return ranges;
}

/** True when `index` falls inside any range from `classRanges`. */
export function inRanges(ranges, index) {
  return ranges.some(([a, b]) => index >= a && index < b);
}

/** Line number (1-indexed) for a character offset. */
export function lineAt(src, index) {
  let line = 1;
  for (let i = 0; i < index && i < src.length; i++) {
    if (src[i] === "\n") line++;
  }
  return line;
}

/** A findings collector shared by both rule sets. */
export function createReport() {
  const findings = [];
  return {
    findings,
    add(rule, file, line, message) {
      findings.push({ rule, file, line, message });
    },
  };
}

/** Pretty relative path for output. */
export function display(p) {
  const rel = relative(process.cwd(), p);
  return rel.startsWith("..") ? p : rel;
}
