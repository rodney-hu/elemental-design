/**
 * GENSO — STRUCTURE
 *
 * The page-assembly layer: what a section is, how wide the content runs, how
 * things stack. `shells.tsx` is app chrome (sidebar, dashboard, the Fourfold);
 * this is what every page is built out of regardless of chrome.
 *
 * These exist because the alternative — hand-typing
 * `max-w-6xl mx-auto px-6 py-24` at every call site — is exactly how one site
 * ended up with three content widths across three page types and a section
 * rhythm that changed depending on who wrote the page. See docs/decisions.md.
 */

import * as React from "react";
import { cx } from "../components/primitives";

/* --------------------------------- Container -------------------------------- */
/* The four sanctioned page widths, by name. The gutter is part of the
   container, not the caller's problem — a container without one puts text
   against the viewport edge on mobile, which was the most common hand-rolled
   mistake. */

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

const containerSize: Record<ContainerSize, string> = {
  sm: "max-w-container-sm", // 640px  — a form, a single article
  md: "max-w-container-md", // 896px  — a reading page
  lg: "max-w-container-lg", // 1152px — the marketing default
  xl: "max-w-container-xl", // 1344px — a wide dashboard
  /* Escape hatch for a genuinely full-bleed band (a hero image, a marquee).
     It still applies the gutter, which is the part you actually never want to
     lose. */
  full: "max-w-none",
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

export function Container({
  size = "lg",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cx(
        "mx-auto w-full px-md sm:px-lg",
        containerSize[size],
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------- Section --------------------------------- */
/* Vertical rhythm plus the corner-aura geometry.
 *
 * The aura is opt-in and applied HERE rather than remembered at the call site,
 * because its rules are numerous and getting any one wrong reverts it to the
 * banned "background is red-tinted" failure (docs/decisions.md). What this
 * component can enforce: the correct class pairing, and the fact that it lands
 * on a <section> rather than being scattered onto arbitrary divs.
 *
 * What it CANNOT enforce, because a component cannot see its siblings:
 *   · not every section gets one
 *   · they alternate sides
 *   · two adjacent auras is the mistake
 * Those three stay in foundations.md and remain yours to hold. If a page ever
 * reads as tinted, check adjacency before touching the alpha.
 *
 * It renders a real <section>, which also means a `halo` can never end up on
 * it via this path — check #10 exists precisely because that's how the
 * full-page wash would return under a new name.
 */

type SectionRhythm = "tight" | "default" | "loose" | "none";

const sectionRhythm: Record<SectionRhythm, string> = {
  tight: "py-3xl", // 72px
  default: "py-4xl", // 96px
  loose: "py-5xl", // 144px — major break, hero
  none: "",
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  rhythm?: SectionRhythm;
  /**
   * Corner aura. "l" / "r" anchor it to the section's top-left / top-right;
   * "strong" is the heightened alpha reserved for a hero (and is left-anchored
   * — pass `aura="strong"` with `auraSide="r"` to flip it).
   */
  aura?: "l" | "r" | "strong" | false;
  auraSide?: "l" | "r";
  /**
   * Raise or recess the whole band off the void. Most sections want "none" —
   * the page is already the stage, and content is raised with Cards inside it.
   */
  surface?: "none" | "ink" | "panel";
}

const sectionSurface: Record<NonNullable<SectionProps["surface"]>, string> = {
  none: "",
  ink: "ink",
  panel: "panel",
};

export function Section({
  rhythm = "default",
  aura = false,
  auraSide = "l",
  surface = "none",
  className,
  ...props
}: SectionProps) {
  const auraClasses = aura
    ? aura === "strong"
      ? `aura aura-${auraSide} aura-strong`
      : `aura aura-${aura}`
    : undefined;

  return (
    <section
      className={cx(
        sectionRhythm[rhythm],
        sectionSurface[surface],
        auraClasses,
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------- Stack ---------------------------------- */
/* Flex, with the gap coming from the space scale by name. The point is that
   `gap` cannot be an arbitrary number. */

type Space = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const gapClass: Record<Space, string> = {
  xs: "gap-xs",
  sm: "gap-sm",
  md: "gap-md",
  lg: "gap-lg",
  xl: "gap-xl",
  "2xl": "gap-2xl",
  "3xl": "gap-3xl",
};

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal";
  gap?: Space;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  /** Wrap on overflow. Only meaningful when horizontal. */
  wrap?: boolean;
}

const alignClass = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifyClass = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

export function Stack({
  direction = "vertical",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cx(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapClass[gap],
        alignClass[align],
        justifyClass[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------- Grid ----------------------------------- */
/* Column counts are a fixed set, and each one carries its own responsive
   ramp — so a 3-column grid is single-column on mobile without the caller
   rebuilding the breakpoints every time. */

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: keyof typeof gridCols;
  gap?: Space;
}

export function Grid({
  cols = 3,
  gap = "lg",
  className,
  ...props
}: GridProps) {
  return (
    <div
      className={cx("grid", gridCols[cols], gapClass[gap], className)}
      {...props}
    />
  );
}
