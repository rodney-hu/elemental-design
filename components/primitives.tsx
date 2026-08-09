/**
 * GENSO — CORE COMPONENTS
 * Requires tokens/tokens.css imported globally and tokens/tailwind-preset.cjs
 * registered in the project's `presets` array.
 * See docs/foundations.md before adding a new variant.
 */

import * as React from "react";

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ---------------------------------- Button --------------------------------- */
/* Primary = fire only. Air = the "featured/elevated" variant. Secondary =
   neutral outline. Don't add a water/earth button variant without a real
   reason — see foundations.md on one accent leading per screen. */

type ButtonVariant = "primary" | "air" | "secondary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-fire text-washi px-6 py-3 rounded font-medium shadow-glow-fire-soft " +
    "hover:shadow-glow-fire transition-shadow duration-default ease-air " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-sumi " +
    "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
  air:
    "bg-transparent border-[1.5px] border-air text-air-text px-6 py-3 rounded font-medium " +
    "shadow-glow-air-soft hover:shadow-glow-air hover:bg-air/10 transition-all duration-default ease-air " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-air focus-visible:ring-offset-2 focus-visible:ring-offset-sumi " +
    "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "bg-transparent border border-line-strong text-washi px-6 py-3 rounded font-medium " +
    "hover:border-washi-dim transition-colors duration-default " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-washi/30 " +
    "disabled:opacity-50 disabled:pointer-events-none",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return <button className={cx(buttonStyles[variant], className)} {...props} />;
}

/* ----------------------------------- Card ----------------------------------- */
/* A raised panel on the void. Solid --sumi-2, not a translucent tint: the page
   is pure black, so a 60%-opacity panel composited to rgb(16 14 13) — a 1.09:1
   separation that barely read as a surface. Solid gives 1.19:1 and the module
   actually looks like an object. It also drops a backdrop-blur that had nothing
   behind it to blur.

   The "Water" behavior still lives here — it's the hover morph (lift + pooling
   glow), not the glass tint. Pass accent to change which element leads. */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  /* All four elements, so a Fourfold cell can carry its own accent. Water
     stays the default — the glass/pooling behaviour is water's by rights. */
  accent?: "fire" | "water" | "earth" | "air";
}

const cardGlow: Record<NonNullable<CardProps["accent"]>, string> = {
  fire: "hover:shadow-glow-fire",
  water: "hover:shadow-glow-water",
  earth: "hover:shadow-glow-earth",
  air: "hover:shadow-glow-air",
};

const cardBorder: Record<NonNullable<CardProps["accent"]>, string> = {
  fire: "hover:border-fire/40",
  water: "hover:border-water/40",
  earth: "hover:border-earth/40",
  air: "hover:border-air/40",
};

export function Card({
  interactive = true,
  accent = "water",
  className,
  ...props
}: CardProps) {
  const glow = cardGlow[accent];
  const border = cardBorder[accent];
  return (
    <div
      className={cx(
        "bg-sumi-2 border border-line rounded-md p-6 shadow-lg",
        interactive &&
          `${border} ${glow} hover:-translate-y-1 transition-all duration-default ease-air cursor-pointer`,
        className,
      )}
      {...props}
    />
  );
}

/* --------------------------------- Input/Label -------------------------------- */

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={cx(
        // bg-sumi, not sumi-2: an input is a recessed surface, and it usually
        // sits ON a sumi-2 panel. Matching the panel would flatten it.
        "bg-sumi border border-line-strong text-washi px-4 py-3 rounded w-full",
        "focus:border-fire focus:shadow-glow-fire-soft focus:outline-none transition-all duration-default",
        "placeholder:text-washi-dim",
        className,
      )}
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
