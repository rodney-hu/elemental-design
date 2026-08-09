import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * The showcase is a CONSUMER of this package, not part of it.
 *
 * It used to be a standalone HTML file with its own inlined copy of the
 * palette — a third place every colour lived, which silently fell two
 * versions behind and needed a dedicated drift check (old check #5) to
 * police. Building it as a real app removes that copy entirely: it imports
 * tokens.css, so it cannot drift by construction.
 *
 * Imports read exactly the way they will in a real project
 * (`elemental-design/primitives`), resolved through the package's own
 * `exports` map by Node's self-reference mechanism — a package may import
 * itself by name when it declares `name` and `exports`. That matters: the
 * showcase therefore exercises the REAL exports map, so a subpath that is
 * missing or misspelled there fails here rather than in someone's project.
 * An alias pointing at the repo root would have bypassed the map entirely and
 * tested nothing.
 */
export default defineConfig({
  plugins: [react()],
  root: __dirname,
  base: "./",
  resolve: {
    /* Without this, React resolves twice — once through the self-reference
       and once from the showcase — and hooks throw. */
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: resolve(__dirname, "..", "dist-showcase"),
    emptyOutDir: true,
  },
});
