# Remixing external code

Genso is built to be the destination you paste *into*, not a museum you
rebuild from scratch every time something on 21st.dev (or anywhere
shadcn-shaped) looks good. This is the practical protocol — see
`docs/foundations.md`'s "Remixing external code" for the summary and
`docs/decisions.md` for why it's shaped this way.

## Why a paste used to need rework

A component prompt from 21st.dev comes back in shadcn's dialect:
`bg-background`, `text-muted-foreground`, `rounded-2xl`, `duration-300`,
`ease-out`, `cn(...)`, `<Button variant="default" size="lg">`,
`lucide-react` icons. None of that vocabulary existed in Genso before v2.1,
so every paste failed on three fronts at once — the token names didn't
resolve, the structural defaults (soft radii, extra durations, a second
curve) were exactly what `genso-check` bans, and the component API
disagreed (`variant`/`size` vs. `accent`/`shape`).

v2.1 doesn't change what Genso *is* — the philosophy, the restraint rules,
the glow budget are all untouched. It adds a translation layer on top.

## The workflow

**1. Paste the file in.**

Nothing special yet — just drop the pasted `.tsx` wherever it's going to
live.

**2. Run the mechanical fixer.**

```bash
npx genso-check --translate ./src/PricingCard.tsx
```

Dry-run by default — it prints a diff of every rewrite it's confident
about:

```
  ./src/PricingCard.tsx  (7 rewrites)
  1. ease-out  →  ease-air
  2. bg-card  →  bg-sumi-2
  3. text-card-foreground  →  text-washi
  4. text-muted-foreground  →  text-washi-dim
  5. bg-primary  →  bg-fire
  6. rounded-2xl  →  rounded-lg
  7. duration-300  →  duration
```

Add `--write` once you've read it:

```bash
npx genso-check --translate --write ./src/PricingCard.tsx
```

It handles: shadcn's semantic color names, `rounded-xl/2xl/3xl` and
`rounded-[…]`, `duration-N` and `duration-[…]`, `ease-out/in/in-out` and a
hand-typed `ease-[cubic-bezier(...)]`, `text-[…px]` below the display
range, and `max-w-[…]`. It deliberately does **not** touch raw Tailwind
palette colors (`bg-white/5`, `text-gray-400`, `border-neutral-800`) —
there's no single principled Genso equivalent for an arbitrary gray step,
so guessing one would be an autofix wearing false confidence. Swap those by
hand, or leave them and see step 4.

**3. Even without `--translate`, most of it already renders.**

`tokens/tailwind-preset.cjs` aliases shadcn's color names onto Genso tokens
and **contains** the structural Tailwind keys a shadcn block assumes
(`rounded-xl/2xl/3xl` → the sharp scale, `duration-N` → the three real
durations, `ease-out/in/in-out` → the one curve). So a component that
imports the real `Button`/`Card` and uses `cn()` from
`elemental-design/primitives` will look right even before `--translate`
touches it — `--translate` exists to make the *source* read in Genso's own
vocabulary, not to make it work. Working and reading-correctly are
separate, and the preset only guarantees the first one.

**4. Run `genso-check` and read what's left.**

```bash
npx genso-check ./src/PricingCard.tsx
```

Anything that survives step 2 is a judgment call, not a mechanical fix —
usually a raw palette color, or a genuinely new visual effect (a mesh
gradient, a noise texture) that doesn't map onto an existing Genso token at
all. Two ways to resolve it:

- **Fix it properly** — pick the Genso token that means what the pasted
  color was trying to say (`bg-white/5` on a panel is almost always
  `bg-sumi` or a `sheen`; `text-gray-400` is almost always
  `text-washi-dim`).
- **Loosen the rule, deliberately** — if the block is doing something
  genuinely outside the system (a background effect that doesn't fit the
  five-tier glow namespace, for instance) and you want to keep it as-is:

  ```tsx
  {/* genso-allow: raw-neutral — remix: 21st.dev "aurora" hero, keeping the
      exact gradient stops rather than forcing them onto aura/halo/sheen */}
  <div className="bg-gradient-to-br from-white/10 to-transparent">
  ```

  For a fresh paste tripping several rules before you've decided what to
  keep, suppress the whole file instead of commenting every line:

  ```tsx
  /* genso-allow-file: previewing a pasted 21st.dev pricing block before
     deciding what to keep */
  ```

  Narrow it back to per-line `genso-allow`s (or delete it) once the block
  is actually going to ship — a whole-file exemption is for previewing,
  not a permanent state.

**5. Swap component APIs where it's cheap, keep the shim where it isn't.**

`Button` accepts `variant`/`size` (shadcn's names) as a compatibility shim
— `variant="default"` → `accent="fire" shape="solid"`, `variant="outline"`
→ `shape="outline"`, `variant="secondary"`/`"ghost"` → `shape="quiet"`,
`variant="link"` → an underlined, unpadded quiet button,
`variant="destructive"` → the semantic error tokens (not an element — see
`docs/decisions.md` on why destructive isn't a fifth accent). `size`
(`sm`/`lg`/`icon`) maps to a padding override. This works as-is; there's no
obligation to rewrite it to `accent`/`shape` immediately. Do rewrite it
when you're touching the file for another reason anyway — `accent`/`shape`
is the real, documented API and the one every other Genso doc assumes.

`Card` needs no shim: it already accepts an arbitrary `className`, and
`cn()` (not the internal `cx()`) is what makes a pasted background/gradient
className actually override the base instead of colliding with it.

`lucide-react` icons need no shim either — allowed unconstrained. See
`docs/decisions.md` for why a stroke-language wrapper wasn't built.

## What this doesn't cover

- **New component shapes** (an Accordion, a Tooltip, a pricing table
  Genso has no primitive for) aren't translated — they're new components.
  Build them the normal way (`docs/foundations.md`, "Adding something
  new"), reusing `cn()`/`cx()`, the token scale, and the element motion
  signatures as the pasted block's own styling gets replaced piece by
  piece.
- **A genuinely new visual effect** — a mesh gradient, a noise texture, an
  animated blob — doesn't need to be forced into the five-tier glow
  namespace (`aura`/`halo`/`sheen`/`edge`/`wash`) just because it's the
  closest thing that exists. Use `genso-allow` and keep it scoped to the
  one component; don't retroactively invent a sixth glow tier for a single
  use, and don't let it leak onto a `<section>`/`<main>`/the shell (still
  the banned full-page wash, whatever it's called).
- **Per-project re-theming** (a client's own accent palette) is a separate
  concern from remixing a *component* — see "Per-project theme" in
  `docs/foundations.md`.
