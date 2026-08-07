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

/**
 * True when the user has asked for reduced motion. Every entrance in this
 * system is decorative — gate JS animation on this the way tokens.css gates
 * the CSS half. SSR-safe (returns false when there's no `window`).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
