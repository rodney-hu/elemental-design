/**
 * GENSO — ELEMENT MARKS
 *
 * One line glyph per element, plus the kanji register.
 *
 * — Why these are original —
 * These are NOT the Avatar: The Last Airbender element symbols. That series
 * is Nickelodeon/Paramount IP and this system runs a commercial site. The
 * reference was the *structure* of that idea — one simple, contained line
 * glyph per element — not the artwork. Every ATLA glyph is circle-enclosed
 * and spiral-based; none of these is. Don't "improve" one back toward the
 * source. See docs/decisions.md.
 *
 * — The drawing rules — (enforced by `npm run check`)
 *   · one 24×24 grid, built on 4-unit modules (the shoji grid)
 *   · stroke-width 1.5, stroke="currentColor" — colour comes from the
 *     parent's text colour, so a mark inherits its element automatically
 *   · butt caps, miter joins — round caps would contradict the sharp-corner
 *     rule in foundations.md
 *   · no fills, no circle enclosure
 *
 * Each mark is "open" in a way that encodes its element's trait. The gap is
 * the point in every one of them — see the comment on each.
 */

import * as React from "react";
import { cx } from "./primitives";

export type Element = "fire" | "water" | "earth" | "air";

type MarkProps = React.SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, className, children, ...rest }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

/* 火 FIRE — bold. An upward triangle whose apex is cut away, with a stroke
   rising from the base, through the gap, and past it. The committed strike:
   decisive, and still travelling. */
export function FireMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M12 20 H4 L9.5 8" />
      <path d="M14.5 8 L20 20 H12" />
      <path d="M12 20 V3" />
    </Svg>
  );
}

/* 水 WATER — fluid. Three horizontals, each shorter and offset half a module
   from the one below. Fluidity as displacement rather than decoration — a
   current expressed on the grid, not a sine wave laid over it. */
export function WaterMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M2 18 H18" />
      <path d="M4 12 H16" />
      <path d="M6 6 H14" />
    </Svg>
  );
}

/* 土 EARTH — grounded. A square whose base extends past both sides: a form
   sitting on ground wider than itself. The only mark that touches its own
   floor, because earth is the stance you strike from. */
export function EarthMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M6 6 H18 V18 H6 Z" />
      <path d="M2 18 H22" />
    </Svg>
  );
}

/* 風 AIR — formless. Only the four corners of a square; the edges are never
   drawn. The boundary is inferred rather than stated — breath and spirit,
   mushin. The most restrained mark in the set, on purpose. */
export function AirMark(props: MarkProps) {
  return (
    <Svg {...props}>
      <path d="M4 9 V4 H9" />
      <path d="M15 4 H20 V9" />
      <path d="M20 15 V20 H15" />
      <path d="M9 20 H4 V15" />
    </Svg>
  );
}

const geometric: Record<Element, (p: MarkProps) => React.JSX.Element> = {
  fire: FireMark,
  water: WaterMark,
  earth: EarthMark,
  air: AirMark,
};

/* The kanji register. These four glyphs are already in the subsetted fonts
   (see assets/fonts/README.md) — do NOT swap in a different character
   without re-subsetting, or it will silently fall back to a system font. */
const kanjiGlyph: Record<Element, string> = {
  fire: "火",
  water: "水",
  earth: "土",
  air: "風",
};

const elementText: Record<Element, string> = {
  fire: "text-fire-text",
  water: "text-water-text",
  earth: "text-earth-text",
  air: "text-air-text",
};

const haloClass: Record<Element, string> = {
  fire: "halo halo-fire",
  water: "halo halo-water",
  earth: "halo halo-earth",
  air: "halo halo-air",
};

const elementLabel: Record<Element, string> = {
  fire: "Fire",
  water: "Water",
  earth: "Earth",
  air: "Air",
};

export interface ElementMarkProps {
  element: Element;
  /** Pixel size of the glyph. Kanji renders at the same optical size. */
  size?: number;
  /** Wrap in the element's contained halo. Reads hardest on a `.void` stage. */
  halo?: boolean;
  /** Render the kanji register (火水土風) instead of the line mark. */
  kanji?: boolean;
  /**
   * Accessible name. Defaults to the element's English name. Pass `null` for
   * a purely decorative mark that sits beside its own text label — which is
   * the common case inside a Fourfold cell.
   */
  label?: string | null;
  className?: string;
}

/**
 * The one component for both registers.
 *
 *   <ElementMark element="fire" />                 // line mark
 *   <ElementMark element="fire" kanji halo />      // 火 with a contained halo
 *
 * Colour is never passed in: the element decides it, via `text-*-text`, and
 * the SVG inherits through `currentColor`.
 */
export function ElementMark({
  element,
  size = 24,
  halo = false,
  kanji = false,
  label,
  className,
}: ElementMarkProps) {
  const Glyph = geometric[element];
  const name = label === undefined ? elementLabel[element] : label;

  const inner = kanji ? (
    <span
      className="font-kanji leading-none"
      style={{ fontSize: `${size}px` }}
      aria-hidden="true"
    >
      {kanjiGlyph[element]}
    </span>
  ) : (
    <Glyph size={size} />
  );

  return (
    <span
      className={cx(
        "inline-flex items-center justify-center",
        elementText[element],
        halo && haloClass[element],
        className,
      )}
      style={halo ? { inlineSize: size * 3, blockSize: size * 3 } : undefined}
      role={name ? "img" : undefined}
      aria-label={name ?? undefined}
    >
      {inner}
    </span>
  );
}

/**
 * A figure rendered flat black on a void stage, read entirely by the halo
 * behind it. Pass an SVG path/shape as children, or an <img> — anything
 * inside is forced to pure black by `fill: var(--void)`.
 *
 * Colour here is never the only carrier of meaning: whatever this illustrates
 * still needs a text label nearby.
 */
export interface SilhouetteProps {
  element: Element;
  size?: number;
  children: React.ReactNode;
  className?: string;
}

export function Silhouette({
  element,
  size = 96,
  children,
  className,
}: SilhouetteProps) {
  return (
    <span
      className={cx(haloClass[element], className)}
      style={{ inlineSize: size, blockSize: size }}
    >
      <span
        className="relative z-10 inline-flex items-center justify-center [&_*]:fill-void [&_img]:brightness-0"
        style={{ inlineSize: size, blockSize: size }}
      >
        {children}
      </span>
    </span>
  );
}
