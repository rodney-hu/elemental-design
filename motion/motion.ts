/**
 * GENSO — MOTION CONSTANTS (JS)
 *
 * The CSS half of the motion system lives in `tokens/tokens.css`
 * (`--ease-air`, `--duration-fast/default/slow`). JS-driven animation —
 * framer-motion, GSAP, Web Animations API — cannot read a CSS variable, so
 * without this file every JS consumer hand-types the bezier and invents its
 * own duration. That is exactly how a second easing curve and a fourth
 * duration got into production undetected; see docs/decisions.md.
 *
 * Import from here. Never hand-type `[0.16, 1, 0.3, 1]` again.
 *
 *   import { easeAir, duration, riseIn } from "elemental-design/motion";
 *
 *   <motion.div {...riseIn} />
 *   <motion.div transition={{ duration: duration.default, ease: easeAir }} />
 *
 * These values MUST stay identical to their CSS counterparts in tokens.css.
 * `npm run check` asserts that they are — run it after touching either file.
 */

/**
 * The system's one easing curve — an ease-out. Mirrors `--ease-air`.
 * Introducing a second curve requires a logged reason in docs/decisions.md.
 */
export const easeAir = [0.16, 1, 0.3, 1] as const;

/**
 * The three sanctioned durations, in SECONDS (framer-motion's unit).
 * Mirrors `--duration-fast` / `--duration-default` / `--duration-slow`.
 * If a value you want isn't one of these three, the answer is one of these
 * three — not a fourth value.
 */
export const duration = {
  fast: 0.15, //  150ms — micro-interactions, button press
  default: 0.4, //  400ms — standard hover/transition
  slow: 0.7, //  700ms — entrances
} as const;

/** Same three durations in MILLISECONDS, for APIs that want ms. */
export const durationMs = {
  fast: 150,
  default: 400,
  slow: 700,
} as const;

/** The system default transition. Spread into any `transition` prop. */
export const transitionDefault = {
  duration: duration.default,
  ease: easeAir,
} as const;

/** Fast variant — presses and other micro-interactions. */
export const transitionFast = {
  duration: duration.fast,
  ease: easeAir,
} as const;

/**
 * The Air entrance — fade + rise. The JS twin of the `.rise` CSS utility in
 * tokens.css, for cases that need scroll-triggering or orchestration that CSS
 * can't express. Nothing bounces, nothing overshoots.
 *
 *   <motion.div {...riseIn} />
 */
export const riseIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.slow, ease: easeAir },
} as const;

/** Scroll-triggered variant of `riseIn` — fires once, when 30% is in view. */
export const riseInOnScroll = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: duration.slow, ease: easeAir },
} as const;

/**
 * Stagger delays matching the `.rise-d1`–`.rise-d4` CSS utilities, in seconds.
 * Index into it for a group entering together: `riseDelay[i]`.
 */
export const riseDelay = [0, 0.05, 0.18, 0.3, 0.42] as const;

/* --------------------------- Element motion signatures --------------------------- */
/**
 * As of v2.0, motion is the ONLY thing the four elements bind. Colour is
 * free — any accent may lead any component — but when a thing animates, it
 * animates in its element's character.
 *
 * Fire is not "the CTA colour". Fire is the colour that strikes.
 *
 *   <motion.div {...elementMotion.fire} />
 *
 * The JS twin of the `.motion-*` classes in tokens.css. Same reason
 * `easeAir` exists at all: framer-motion cannot read a CSS variable, and a
 * hand-typed copy is how a second easing curve reached production once
 * before (docs/decisions.md).
 *
 * All four use the single `easeAir` curve. The characters come from the
 * keyframe shape, not from four different beziers — introducing a second
 * curve is still forbidden, and it turns out not to be necessary.
 */
export const elementMotion = {
  /** 火 Strike — committed and fast, with a small overshoot, then it holds. */
  fire: {
    initial: { opacity: 0, y: 14, scale: 0.96 },
    animate: { opacity: 1, y: [14, -2, 0], scale: [0.96, 1.01, 1] },
    transition: { duration: duration.default, ease: easeAir },
  },
  /** 水 Flow — enters off-axis and eases across. No hard start or stop. */
  water: {
    initial: { opacity: 0, x: -14, y: 6 },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { duration: duration.slow, ease: easeAir },
  },
  /** 土 Settle — arrives from above and lands heavy. Overshoots down, never up. */
  earth: {
    initial: { opacity: 0, y: -16 },
    animate: { opacity: 1, y: [-16, 2, 0] },
    transition: { duration: duration.default, ease: easeAir },
  },
  /** 風 Drift — the lightest and slowest to commit. Seems to arrive from nowhere. */
  air: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: duration.slow, ease: easeAir },
  },
} as const;

export type ElementMotionName = keyof typeof elementMotion;

/**
 * True when the user has asked for reduced motion. Every entrance in this
 * system is decorative — gate JS animation on this the way tokens.css gates
 * the CSS half. SSR-safe (returns false when there's no `window`).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
