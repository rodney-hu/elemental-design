/**
 * GENSO — CORE COMPONENTS
 * Requires tokens/tokens.css imported globally and tokens/tailwind-preset.cjs
 * registered in the project's `presets` array.
 * See docs/foundations.md before adding a new variant.
 */

import * as React from "react";
import { twMerge } from "tailwind-merge";

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------ cn ------------------------------------ */
/* `cx` above is a plain filter+join — fine for this package's own components,
   where every class list is authored once and never needs to resolve a
   conflict. Pasted shadcn-shaped code assumes something stronger: `cn(base,
   className)` where a passed className should WIN over a colliding utility
   in `base` (e.g. base has `p-6`, the caller passes `className="p-8"` and
   expects `p-8` to apply) rather than both existing and cascade order in the
   generated stylesheet silently deciding which one does.

   `cx` can't do that — string concatenation has no idea `p-6` and `p-8` are
   the same property. `cn` wraps it with `tailwind-merge`, which does, so a
   remixed component's `cn(buttonVariants(...), className)` pattern works
   exactly as it did wherever it was copied from. Reach for `cn` on anything
   accepting an external className that should be allowed to override the
   base; keep `cx` for this package's own internal composition, which never
   needs conflict resolution and shouldn't carry the extra dependency weight
   conceptually. See docs/remixing.md. */
export function cn(...inputs: Array<string | false | undefined>) {
  return twMerge(cx(...inputs));
}

/* ---------------------------------- Button --------------------------------- */
/* Every element, plus two neutral registers.
 *
 * Until v2.0 this component encoded a colour-to-role binding: `primary` WAS
 * fire, air was "the featured variant", and a water or earth button needed a
 * justification. That is gone. Colour is free — an accent is a colour that
 * complements the neutrals, not a job title. Lead a page with earth if earth
 * is what the page wants.
 *
 * What the elements still bind is MOTION, not role. See the `.motion-*`
 * signatures in tokens.css.
 *
 * `solid` and `outline` are the two shapes a button comes in; `accent` picks
 * the colour. That split is deliberate: with the old scheme, wanting an
 * outlined fire button meant there was no variant for it. */

type ButtonAccent = "fire" | "water" | "earth" | "air";
type ButtonShape = "solid" | "outline" | "quiet";

/* shadcn's vocabulary, for the compat shim below. Not exported as a type
   name elsewhere in the system — `accent`/`shape` stay the one real API. */
type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  accent?: ButtonAccent;
  shape?: ButtonShape;
  /**
   * Compatibility shim for pasted shadcn-shaped code — `variant` and `size`
   * below. **Not the canonical API.** New Genso code should use
   * `accent`/`shape`, which this maps onto internally; this exists so a
   * component copied from 21st.dev renders correctly without a rewrite pass
   * first. When both are given, `accent`/`shape` win.
   *
   * `variant="destructive"` is the one case with no `accent` equivalent —
   * fire/water/earth/air are elements, not semantics, and "destructive" is
   * a semantic (see foundations.md on why --semantic-error and --fire stay
   * separate tokens). It renders with the semantic error tokens directly,
   * same tier as `Status tone="error"`.
   */
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BUTTON_BASE =
  "px-6 py-3 rounded font-medium transition-all duration-default ease-air " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sumi " +
  "active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

/* Solid fills take their foreground from `--on-{element}`, NOT from a fixed
   --washi. That matters: --washi on --earth is 3.67:1 and fails AA outright,
   and on --air it is 2.09:1. Both need --void instead. Nobody had hit this
   before v2.0 because only fire was ever allowed to be a solid CTA, so the
   pairing was never computed for the other three.

   Outline uses the `-text` tint, because the base colours are unreadable as
   glyphs on a dark page (--fire is 2.7:1 on void). Both splits are
   accessibility rules, not style ones — `npm run check` verifies all of them. */
const buttonSolid: Record<ButtonAccent, string> = {
  fire: "bg-fire text-on-fire shadow-glow-fire-soft hover:shadow-glow-fire focus-visible:ring-fire",
  water:
    "bg-water text-on-water shadow-glow-water-soft hover:shadow-glow-water focus-visible:ring-water",
  earth:
    "bg-earth text-on-earth shadow-glow-earth-soft hover:shadow-glow-earth focus-visible:ring-earth",
  air: "bg-air text-on-air shadow-glow-air-soft hover:shadow-glow-air focus-visible:ring-air",
};

const buttonOutline: Record<ButtonAccent, string> = {
  fire: "bg-transparent border-[1.5px] border-fire text-fire-text shadow-glow-fire-soft hover:shadow-glow-fire hover:bg-fire/10 focus-visible:ring-fire",
  water:
    "bg-transparent border-[1.5px] border-water text-water-text shadow-glow-water-soft hover:shadow-glow-water hover:bg-water/10 focus-visible:ring-water",
  earth:
    "bg-transparent border-[1.5px] border-earth text-earth-text shadow-glow-earth-soft hover:shadow-glow-earth hover:bg-earth/10 focus-visible:ring-earth",
  air: "bg-transparent border-[1.5px] border-air text-air-text shadow-glow-air-soft hover:shadow-glow-air hover:bg-air/10 focus-visible:ring-air",
};

/* The neutral register — no accent at all. Kept because a page full of
   coloured buttons has no hierarchy left, which is a composition problem
   rather than a colour rule. */
const BUTTON_QUIET =
  "bg-transparent border border-line-strong text-washi hover:border-washi-dim focus-visible:ring-washi/30";

/* Destructive is semantic, not elemental — it reaches for --semantic-error
   directly rather than routing through an accent, the same split
   foundations.md draws for Status. --semantic-error and --fire happen to
   share a hex value; they don't share a variable, and this is why: a
   destructive button must stay correct even if fire's triplet ever moves. */
const BUTTON_DESTRUCTIVE =
  "bg-error text-washi shadow-glow-fire-soft hover:shadow-glow-fire hover:bg-error/90 focus-visible:ring-error";

/* variant → { accent, shape } for the four that map onto the real system.
   `ghost` and `secondary` both land on `quiet` — Genso doesn't distinguish
   a bordered vs. borderless neutral button, so this is an approximation,
   not a promise of a pixel match to shadcn's own ghost. `link` adds an
   underline and strips the button padding via `cn`, since a link-styled
   button keeps its inline flow. */
const VARIANT_MAP: Record<
  Exclude<ButtonVariant, "destructive">,
  { accent: ButtonAccent; shape: ButtonShape; extra?: string }
> = {
  default: { accent: "fire", shape: "solid" },
  outline: { accent: "fire", shape: "outline" },
  secondary: { accent: "fire", shape: "quiet" },
  ghost: { accent: "fire", shape: "quiet" },
  link: {
    accent: "fire",
    shape: "quiet",
    extra:
      "border-none p-0 h-auto underline underline-offset-4 hover:no-underline shadow-none",
  },
};

/* size → a padding/type override, merged via `cn` so it actually wins over
   BUTTON_BASE's `px-6 py-3` instead of both existing in the class list.
   Genso's own components don't need a size axis — one button size, set by
   context — so this stays scoped to the compat shim. */
const SIZE_MAP: Record<ButtonSize, string> = {
  default: "",
  sm: "px-4 py-2 text-sm",
  lg: "px-8 py-4 text-md",
  icon: "p-3 aspect-square",
};

export function Button({
  accent,
  shape,
  variant,
  size = "default",
  className,
  ...props
}: ButtonProps) {
  // accent/shape are the canonical API and win when given; `variant` is the
  // compat path, and only consulted when they're absent.
  let look: string;
  let extra: string | undefined;

  if (variant === "destructive") {
    look = BUTTON_DESTRUCTIVE;
  } else if (accent || shape) {
    const resolvedAccent = accent ?? "fire";
    const resolvedShape = shape ?? "solid";
    look =
      resolvedShape === "quiet"
        ? BUTTON_QUIET
        : resolvedShape === "outline"
          ? buttonOutline[resolvedAccent]
          : buttonSolid[resolvedAccent];
  } else if (variant) {
    const mapped = VARIANT_MAP[variant];
    look =
      mapped.shape === "quiet"
        ? BUTTON_QUIET
        : mapped.shape === "outline"
          ? buttonOutline[mapped.accent]
          : buttonSolid[mapped.accent];
    extra = mapped.extra;
  } else {
    look = buttonSolid.fire;
  }

  return (
    <button
      className={cn(BUTTON_BASE, look, extra, SIZE_MAP[size], className)}
      {...props}
    />
  );
}

/* ----------------------------------- Card ----------------------------------- */
/* A raised panel on the void. Solid --sumi-2, not a translucent tint: the page
   is pure black, so a 60%-opacity panel composited to rgb(16 14 13) — a 1.09:1
   separation that barely read as a surface. Solid gives 1.19:1 and the module
   actually looks like an object. It also drops a backdrop-blur that had nothing
   behind it to blur.

   The "Water" behavior still lives here — it's the hover morph (lift + pooling
   glow), not the glass tint. Pass accent to change which element leads. */

type CardAccent = "fire" | "water" | "earth" | "air";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The hover morph — lift + pooling glow. **Visual only.** It does not make
   * the card clickable, focusable, or announced as a control.
   *
   * Defaults to `false` as of v0.7. It used to default to `true`, which gave
   * every card `cursor-pointer` and a lift while providing no focus ring, no
   * role and no keyboard path — an affordance that lied to a mouse user and
   * did not exist for a keyboard one. If you want a clickable card, use
   * `CardLink`: activation is the element's job, not a styling prop's.
   */
  interactive?: boolean;
  /* All four elements, so a Fourfold cell can carry its own accent. Water
     stays the default — the glass/pooling behaviour is water's by rights. */
  accent?: CardAccent;
  /**
   * How the card sits on the page.
   *
   *   "raised"  the default neutral drop shadow
   *   "rooted"  earth's behaviour — offset down and tightly spread, so it
   *             reads as weight rather than emission (foundations.md)
   *   "none"    flat; for a card inside another surface
   *
   * This is a prop rather than something you pass via className because
   * `shadow-lg` used to be hardcoded into the base classes: passing
   * `className="shadow-root-earth"` produced two box-shadow utilities at the
   * same specificity, and which one won came down to their order in the
   * generated stylesheet — so the override silently did nothing. Found by
   * rendering it in the showcase, which is the reason the showcase renders
   * real components now.
   */
  elevation?: "raised" | "rooted" | "none";
  /**
   * A light fall across the panel's surface, capped at 0.04 alpha and dying
   * above the midpoint so long content never sits on a gradient. See the
   * four-tier glow namespace in tokens.css (aura / halo / sheen / edge).
   */
  sheen?: boolean;
  /**
   * A gradient border lit from the top-left corner, in an element's colour.
   * Brighter than a sheen is allowed to be, because it is a 1px line rather
   * than a reading surface. Defaults to the card's `accent`.
   */
  edge?: CardAccent | false;
  /**
   * Make the card read AS its element — a diagonal wash of the element's
   * colour across the whole surface, not just light caught on it.
   *
   * **Only for a card carrying a label and a short title.** A tinted ground
   * costs reading comfort, and two or three words can afford that where two
   * or three paragraphs cannot — the same reasoning that keeps prose off the
   * void. If the card holds sustained content, use `sheen` instead.
   *
   * Named `wash`, not `fill`: Tailwind already generates `fill-{color}`
   * utilities for the SVG `fill` property, so a `.fill-fire` class would
   * collide with one of its own and quietly set `fill` on every SVG child
   * that hadn't declared its own.
   */
  wash?: CardAccent | false;
}

const cardWash: Record<CardAccent, string> = {
  fire: "wash-fire",
  water: "wash-water",
  earth: "wash-earth",
  air: "wash-air",
};

const cardEdge: Record<CardAccent, string> = {
  fire: "edge edge-fire",
  water: "edge edge-water",
  earth: "edge edge-earth",
  air: "edge edge-air",
};

const cardElevation: Record<
  NonNullable<CardProps["elevation"]>,
  string
> = {
  raised: "shadow-lg",
  rooted: "shadow-root-earth",
  none: "",
};

const cardGlow: Record<CardAccent, string> = {
  fire: "hover:shadow-glow-fire",
  water: "hover:shadow-glow-water",
  earth: "hover:shadow-glow-earth",
  air: "hover:shadow-glow-air",
};

const cardBorder: Record<CardAccent, string> = {
  fire: "hover:border-fire/40",
  water: "hover:border-water/40",
  earth: "hover:border-earth/40",
  air: "hover:border-air/40",
};

const cardRing: Record<CardAccent, string> = {
  fire: "focus-visible:ring-fire",
  water: "focus-visible:ring-water",
  earth: "focus-visible:ring-earth",
  air: "focus-visible:ring-air",
};

/* No shadow here — elevation is a prop, see the note on CardProps.elevation. */
const CARD_BASE = "bg-sumi-2 border border-line rounded-md p-6";

/* The hover morph, shared by Card (opt-in) and CardLink (always on). No
   `cursor-pointer` here — that belongs to the thing that is actually
   clickable, which is CardLink. */
function cardMorph(accent: CardAccent) {
  return cx(
    cardBorder[accent],
    cardGlow[accent],
    "hover:-translate-y-1 transition-all duration-default ease-air",
  );
}

export function Card({
  interactive = false,
  accent = "water",
  elevation = "raised",
  sheen = false,
  edge = false,
  wash = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cx(
        CARD_BASE,
        cardElevation[elevation],
        sheen && "sheen",
        wash && cardWash[wash],
        edge && cardEdge[edge],
        interactive && cardMorph(accent),
        className,
      )}
      {...props}
    />
  );
}

/* --------------------------- CardLink / CardButton --------------------------- */
/* Card's clickable twins. They render a real <a> / <button>, so they are
   focusable, keyboard-activatable and correctly announced — none of which a
   <div> with `cursor-pointer` ever was. The focus ring matches Button,
   NavLink and Link, so keyboard focus looks like one system everywhere.
   Ring offset is --void, since a card sits on the page rather than on a panel.

   Two components rather than one polymorphic `as` prop on purpose: navigating
   and acting are different things, and the split keeps each one exactly typed
   (an <a> has href, a <button> has type) instead of unioning them into
   something that accepts both and validates neither. */

const cardClickable = (accent: CardAccent) =>
  cx(
    CARD_BASE,
    "shadow-lg block text-left cursor-pointer",
    cardMorph(accent),
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-void",
    cardRing[accent],
  );

export interface CardLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  accent?: CardAccent;
}

export function CardLink({
  accent = "water",
  className,
  ...props
}: CardLinkProps) {
  return <a className={cx(cardClickable(accent), className)} {...props} />;
}

export interface CardButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  accent?: CardAccent;
}

export function CardButton({
  accent = "water",
  type = "button",
  className,
  ...props
}: CardButtonProps) {
  return (
    <button
      type={type}
      className={cx(cardClickable(accent), "w-full", className)}
      {...props}
    />
  );
}

/* --------------------------------- Input/Label -------------------------------- */
/* `controlBase` is shared by Input, Textarea and Select (components/forms.tsx)
   so all three sit at the same elevation tier and focus identically. An input
   is a RECESSED surface — bg-sumi, not sumi-2 — because it usually sits on a
   sumi-2 panel, and matching the panel would flatten it (foundations.md). */

export const controlBase = cx(
  "bg-sumi border text-washi px-4 py-3 rounded w-full",
  "focus:outline-none transition-all duration-default",
  "placeholder:text-washi-dim",
  // Disabled had no visual at all before v0.7 — a disabled field looked
  // identical to an editable one.
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

/* Border + focus treatment by validity. An invalid field also looked
   identical to a valid one until v0.7; colour is not the only carrier here,
   since FormField renders ErrorText alongside it. */
export function controlValidity(invalid?: boolean) {
  return invalid
    ? "border-error/60 focus:border-error-text focus:shadow-glow-fire-soft"
    : "border-line-strong focus:border-fire focus:shadow-glow-fire-soft";
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Renders the error treatment and sets `aria-invalid`. `FormField` wires this for you. */
  invalid?: boolean;
}

export function Input({ invalid, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cx(controlBase, controlValidity(invalid), className)}
      {...rest}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cx(
        "text-sm font-mono text-washi-dim mb-2 block tracking-label uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function ErrorText({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  // text-error-text, not text-error: the base --semantic-error (#AA0000) is
  // 2.43:1 on ink and effectively invisible as a glyph.
  return (
    <p className={cx("text-sm text-error-text mt-1", className)} {...props} />
  );
}

/* ----------------------------------- Badge ----------------------------------- */
/* Element badges — one per element, for tagging content by its elemental role. */

type BadgeTone = "fire" | "water" | "earth" | "air";

const badgeTone: Record<BadgeTone, string> = {
  fire: "bg-fire-soft text-fire-text",
  water: "bg-water-soft text-water-text",
  earth: "bg-earth-soft text-earth-text",
  air: "bg-air-soft text-air-text",
};

export function Badge({
  tone = "fire",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono tracking-label",
        badgeTone[tone],
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------- Status ---------------------------------- */
/* Semantic status pills — separate axis from element Badges. See
   foundations.md on why --fire and --semantic-error are distinct tokens
   even though they share a hex value.

   Every tone uses its `-text` token for the glyph. The base semantic colors
   are fills and borders only — see the note in tokens.css. */

type StatusTone = "error" | "warning" | "success";

const statusTone: Record<StatusTone, string> = {
  error: "bg-error/[0.14] text-error-text border-error/30",
  warning: "bg-warning/[0.14] text-warning-text border-warning/30",
  success: "bg-success/[0.14] text-success-text border-success/30",
};

export function Status({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono tracking-label border",
        statusTone[tone],
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/* --------------------------------- Compare row -------------------------------- */
/* Old-way / new-way comparison row — red strike-through vs green confirm. */

export function CompareRow({
  state,
  children,
}: {
  state: "old" | "new";
  children: React.ReactNode;
}) {
  const isOld = state === "old";
  return (
    <div
      className={cx(
        "flex items-center gap-3 text-sm px-3.5 py-2.5 rounded-md border border-line",
        isOld
          ? "text-washi-dim line-through decoration-error/50"
          : "text-washi",
      )}
    >
      <span
        className={cx(
          "font-mono text-sm w-4 flex-shrink-0",
          isOld ? "text-error-text" : "text-success-text",
        )}
        aria-hidden="true"
      >
        {isOld ? "✕" : "✓"}
      </span>
      {children}
    </div>
  );
}
