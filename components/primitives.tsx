/**
 * GENSO — CORE COMPONENTS
 * Requires tokens/tokens.css imported globally and tailwind.config.js merged.
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
    "focus:outline-none focus:ring-2 focus:ring-fire focus:ring-offset-2 focus:ring-offset-sumi " +
    "active:scale-95",
  air:
    "bg-transparent border-[1.5px] border-air text-air-text px-6 py-3 rounded font-medium " +
    "shadow-glow-air-soft hover:shadow-glow-air hover:bg-air/10 transition-all duration-default ease-air " +
    "focus:outline-none focus:ring-2 focus:ring-air focus:ring-offset-2 focus:ring-offset-sumi " +
    "active:scale-95",
  secondary:
    "bg-transparent border border-white/[0.18] text-washi px-6 py-3 rounded font-medium " +
    "hover:border-washi-dim transition-colors duration-default " +
    "focus:outline-none focus:ring-2 focus:ring-white/30",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={cx(buttonStyles[variant], className)} {...props} />;
}

/* ----------------------------------- Card ----------------------------------- */
/* The "Water" behavior lives here by default — fluid glass, morphs on hover.
   Pass accent="air" for the elevated/featured treatment instead. */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  accent?: "water" | "air";
}

export function Card({ interactive = true, accent = "water", className, ...props }: CardProps) {
  const glow = accent === "air" ? "hover:shadow-glow-air" : "hover:shadow-glow-water";
  const border = accent === "air" ? "hover:border-air/40" : "hover:border-water/40";
  return (
    <div
      className={cx(
        "bg-sumi-2/60 backdrop-blur-md border border-white/10 rounded-md p-6 shadow-lg",
        interactive &&
          `${border} ${glow} hover:-translate-y-1 transition-all duration-default ease-air cursor-pointer`,
        className
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
        "bg-sumi-2 border border-white/[0.18] text-washi px-4 py-3 rounded w-full",
        "focus:border-fire focus:shadow-glow-fire-soft focus:outline-none transition-all duration-default",
        "placeholder:text-washi-dim",
        className
      )}
      {...rest}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cx("text-sm font-mono text-washi-dim mb-2 block tracking-wide uppercase", className)}
      {...props}
    />
  );
}

export function ErrorText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("text-sm text-error mt-1", className)} {...props} />;
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono tracking-wide",
        badgeTone[tone],
        className
      )}
      {...props}
    />
  );
}

/* ---------------------------------- Status ---------------------------------- */
/* Semantic status pills — separate axis from element Badges. See
   foundations.md on why --fire and --semantic-error are distinct tokens
   even though they share a hex value. */

type StatusTone = "error" | "warning" | "success";

const statusTone: Record<StatusTone, string> = {
  error: "bg-error/[0.14] text-fire-text border-error/30",
  warning: "bg-warning/[0.14] text-warning border-warning/30",
  success: "bg-success/[0.14] text-[#4ADE80] border-success/30",
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
        "inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono tracking-wide border",
        statusTone[tone],
        className
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
        "flex items-center gap-3 text-sm px-3.5 py-2.5 rounded-md border border-white/10",
        isOld ? "text-washi-dim line-through decoration-error/50" : "text-washi"
      )}
    >
      <span className={cx("font-mono text-sm w-4 flex-shrink-0", isOld ? "text-error" : "text-success")}>
        {isOld ? "✕" : "✓"}
      </span>
      {children}
    </div>
  );
}
