/**
 * GENSO — REVEAL
 *
 * Scroll-triggered entrance. The CSS `.rise` utility fires on load, which is
 * right for a hero and wrong for everything below the fold — by the time the
 * user scrolls to it the animation has long finished, so the section just
 * appears with no sense of arrival.
 *
 * `motion/motion.ts` already exports `riseInOnScroll` for framer-motion
 * consumers. This is the same behaviour with no dependency, for projects that
 * don't carry an animation library — which, given the system's whole
 * three-durations-and-one-curve position, is most of them.
 *
 *   <Reveal><Section>…</Section></Reveal>
 *   <Reveal delay={1}>…</Reveal>          // stagger, matching .rise-d1
 *
 * Uses IntersectionObserver, fires once, and never runs at all under
 * `prefers-reduced-motion` — the CSS in tokens.css lands `.reveal` in its
 * final state there, so content is visible even if this component never
 * mounts an observer.
 */

import * as React from "react";

/** Matches the `.rise-d1`–`.rise-d4` stagger delays, in ms. */
const DELAYS = [0, 50, 180, 300, 420] as const;

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger step 0–4, mirroring the `.rise-d*` utilities. */
  delay?: 0 | 1 | 2 | 3 | 4;
  /** Fraction of the element that must be visible before it fires. */
  threshold?: number;
  /** Render as a different element — useful to avoid an extra wrapper div. */
  as?: "div" | "section" | "li" | "article";
}

export function Reveal({
  delay = 0,
  threshold = 0.15,
  as: Tag = "div",
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    /* Two escape hatches before observing. Reduced motion is the documented
       one; missing IntersectionObserver covers old browsers and any SSR
       snapshot — in both cases the honest fallback is "show the content",
       never "leave it at opacity 0". */
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    /* If the element is already in view on mount — a page loaded partway
       down, or a short page where everything fits — the observer fires
       immediately, which is the behaviour we want. */
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [shown, threshold]);

  /* Widened to ElementType so the four allowed tags don't intersect their
     ref types into something no single ref can satisfy. The `as` union on
     RevealProps is what actually constrains the caller. */
  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref}
      className={["reveal", shown && "reveal-in", className]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionDelay: `${DELAYS[delay]}ms`, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}
