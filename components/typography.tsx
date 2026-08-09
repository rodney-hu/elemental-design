/**
 * GENSO — TYPOGRAPHY
 *
 * The type scale has existed since v0.4 and drift kept happening anyway. A
 * token is only a suggestion at the call site: `text-lg` and `text-[19px]`
 * are equally easy to type, so "use the scale" stayed a rule someone had to
 * remember. These components make the right value the ONLY one — the same
 * technique `Fourfold` uses for arity, applied to type.
 *
 * The failures being closed, all recorded in docs/decisions.md:
 *   · three different `<h2>` sizes on one site   → `Heading` has one size per level
 *   · 11 distinct type sizes below 24px          → no size prop takes a number
 *   · five competing letter-spacing values       → tracking is never a caller's choice
 *   · section headings as 12px mono labels       → `Eyebrow` cannot render an <h*>
 *   · prose with no line-length limit            → `Prose` is capped at --measure
 *
 * See docs/foundations.md for the rules these encode.
 */

import * as React from "react";
import { cx } from "./primitives";

/* ---------------------------------- Heading --------------------------------- */
/* One size per level, permanently. The visual level and the semantic tag are
   separable via `as` — a page's second <h2> sometimes needs to look like an h3
   without lying about document structure — but you cannot invent a size that
   isn't one of the four. */

type HeadingLevel = 1 | 2 | 3 | 4;
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div";

/* Each level carries its own leading. Display sizes are fluid clamp()s (see
   tokens.css), so none of these needs a responsive variant — that's the whole
   reason the scale is built that way. */
const headingStyles: Record<HeadingLevel, string> = {
  1: "text-4xl leading-display",
  2: "text-2xl leading-tight",
  3: "text-xl leading-tight",
  4: "text-lg leading-snug",
};

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Visual level. 1 = hero, 2 = section, 3 = sub-heading, 4 = card title. */
  level?: HeadingLevel;
  /** Semantic tag, when it must differ from the visual level. Defaults to `h{level}`. */
  as?: HeadingTag;
}

export function Heading({
  level = 2,
  as,
  className,
  ...props
}: HeadingProps) {
  const Tag = (as ?? (`h${level}` as const)) as React.ElementType;
  return (
    <Tag
      className={cx(
        "font-head text-washi tracking-display",
        headingStyles[level],
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------- Eyebrow --------------------------------- */
/* The uppercase mono micro-label ("CASE STUDIES", "HOW I WORK").
   decisions.md allows it under exactly three conditions, all of which were
   violated at once on rodneyhu.com. All three are structural here:

     1. 13px floor        → text-2xs, and there is no size prop
     2. --tracking-label  → tracking-label, and there is no tracking prop
     3. never a heading   → the `as` union admits no h1-h6

   Condition 3 is the one worth being strict about. An eyebrow that labels a
   block of content and would be an <h2> in markup is a heading, and needs
   `Heading` at a real size. A whole page of section headings once shipped as
   12px mono labels. */

export interface EyebrowProps extends React.HTMLAttributes<HTMLElement> {
  /** Deliberately excludes every heading tag — see above. */
  as?: "p" | "span" | "div";
  /** Element tint for the label. Defaults to the muted neutral. */
  tone?: "muted" | "fire" | "water" | "earth" | "air";
}

const eyebrowTone: Record<NonNullable<EyebrowProps["tone"]>, string> = {
  muted: "text-washi-dim",
  fire: "text-fire-text",
  water: "text-water-text",
  earth: "text-earth-text",
  air: "text-air-text",
};

export function Eyebrow({
  as: Tag = "p",
  tone = "muted",
  className,
  ...props
}: EyebrowProps) {
  return (
    <Tag
      className={cx(
        "font-mono text-2xs uppercase tracking-label",
        eyebrowTone[tone],
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------- Text ----------------------------------- */
/* Non-prose copy — a caption, a card body, a meta line. Sizes come from the
   scale by name; there is no numeric escape hatch. */

type TextSize = "2xs" | "xs" | "sm" | "base" | "md";
type TextTone = "default" | "muted" | "fire" | "water" | "earth" | "air";

const textSize: Record<TextSize, string> = {
  "2xs": "text-2xs",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  md: "text-md",
};

const textTone: Record<TextTone, string> = {
  default: "text-washi",
  /* Secondary text only — meta, captions, chips, nav. Never body copy;
     see the note on --washi-dim in tokens.css. */
  muted: "text-washi-dim",
  fire: "text-fire-text",
  water: "text-water-text",
  earth: "text-earth-text",
  air: "text-air-text",
};

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "div" | "li";
  size?: TextSize;
  tone?: TextTone;
}

export function Text({
  as: Tag = "p",
  size = "base",
  tone = "default",
  className,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cx("font-body", textSize[size], textTone[tone], className)}
      {...props}
    />
  );
}

/* ----------------------------------- Prose ---------------------------------- */
/* Sustained body copy. Two rules travel with it, and both are easy to forget
   when hand-assembling classes:

   1. Line length is capped at --measure (68ch). The system discussed prose
      readability from v0.1 and never actually set a measure until v0.7.
   2. Sustained prose belongs on a PANEL, not directly on the void.
      foundations.md: short passages on black read well, multi-paragraph
      blocks do not. `surface` defaults to "panel" so the safe case is the
      default and putting long copy on black is the deliberate act.

   Descendant selectors handle raw markup (markdown output, a CMS body), so
   this works without every child being a Genso component. */

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * "panel" wraps the copy in a raised --sumi-2 surface (the default, and
   * what sustained reading needs). "bare" emits no surface — correct when the
   * copy is ALREADY inside a Card or panel, or when it's genuinely short.
   */
  surface?: "panel" | "bare";
}

export function Prose({
  surface = "panel",
  className,
  ...props
}: ProseProps) {
  return (
    <div
      className={cx(
        "font-body text-base leading-relaxed text-washi max-w-measure",
        // Vertical rhythm for raw markup. Genso components passed as children
        // bring their own spacing and are unaffected by the `p + *` selectors.
        "[&>p]:mb-md [&>p:last-child]:mb-0",
        "[&>ul]:mb-md [&>ol]:mb-md [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:pl-lg [&>ol]:pl-lg",
        "[&>li]:mb-xs",
        surface === "panel" && "bg-sumi-2 border border-line rounded-md p-6",
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------- Link ----------------------------------- */
/* The anchor style the system never shipped, so every project invented one.
   underline-offset keeps the rule off the glyph descenders; the focus-visible
   ring matches Button and NavLink so keyboard focus looks like one system. */

type LinkTone = "fire" | "water" | "earth" | "air" | "inherit";

const linkTone: Record<LinkTone, string> = {
  fire: "text-fire-text focus-visible:ring-fire",
  water: "text-water-text focus-visible:ring-water",
  earth: "text-earth-text focus-visible:ring-earth",
  air: "text-air-text focus-visible:ring-air",
  /* Inherits the surrounding text colour — for a link inside a paragraph that
     shouldn't pull the eye out of the sentence. */
  inherit: "text-inherit focus-visible:ring-washi/30",
};

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  tone?: LinkTone;
}

export function Link({ tone = "fire", className, ...props }: LinkProps) {
  return (
    <a
      className={cx(
        "underline underline-offset-4 decoration-1",
        "hover:decoration-2 transition-all duration-default ease-air",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sumi rounded",
        linkTone[tone],
        className,
      )}
      {...props}
    />
  );
}
