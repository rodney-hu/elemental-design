/**
 * GENSO — LAYOUT SHELLS
 * Page-level structure, as opposed to components/ which are content-level.
 */

import * as React from "react";
import { Card, cx } from "../components/primitives";
import { ElementMark, type Element } from "../components/marks";

/* ---------------------------------- Fourfold ---------------------------------- */
/* The one place all four accents are allowed to coexist — the Avatar
   principle made structural. See docs/philosophy.md and the Fourfold Rule in
   docs/foundations.md before using it.

   Mastery is the SET, not the mix: four peers, one element each, read as a
   claim about range. It is not four accents competing inside one object,
   which is still banned.

   The 4-tuple type is deliberate — arity is the rule most likely to be
   broken by accident, so the compiler enforces it rather than a doc. */

export interface FourfoldCell {
  /* Canonical order is fixed by the component, not the caller — pass cells
     in any order and they render Fire → Water → Earth → Air. */
  element: Element;
  title: string;
  children?: React.ReactNode;
}

export type FourfoldCells = [
  FourfoldCell,
  FourfoldCell,
  FourfoldCell,
  FourfoldCell,
];

const CANONICAL: Element[] = ["fire", "water", "earth", "air"];

export function Fourfold({
  cells,
  kanji = false,
  className,
}: {
  cells: FourfoldCells;
  /** Render the kanji register in each cell instead of the line marks. */
  kanji?: boolean;
  className?: string;
}) {
  const ordered = CANONICAL.map((el) =>
    cells.find((c) => c.element === el),
  ).filter(Boolean) as FourfoldCell[];

  if (ordered.length !== 4) {
    throw new Error(
      "Fourfold requires exactly one cell per element (fire, water, earth, air).",
    );
  }

  return (
    <div className={cx("grid gap-5 sm:grid-cols-2", className)}>
      {ordered.map((cell, i) => (
        <Card
          key={cell.element}
          accent={cell.element}
          interactive={false}
          /* Peers: same size, same weight, same glow. Emphasising one turns
             the set back into four competing accents. */
          className={cx("flex h-full flex-col items-start gap-4 rise", `rise-d${i + 1}`)}
        >
          <ElementMark element={cell.element} kanji={kanji} halo label={null} />
          <h3 className="font-head text-lg leading-snug text-washi">
            {cell.title}
          </h3>
          {cell.children}
        </Card>
      ))}
    </div>
  );
}

/* ----------------------------- Sidebar Navigation ----------------------------- */

/* NOTE: Sidebar's width and DashboardShell's matching offset are one value in
   two places (`w-64` / `ml-64`). Change one and you must change the other. */
const SIDEBAR_W = "w-64";
const SIDEBAR_OFFSET = "ml-64";

export function Sidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cx(
        SIDEBAR_W,
        "bg-sumi-2 border-r border-line p-6 h-screen fixed",
        className,
      )}
      {...props}
    />
  );
}

export function NavLink({
  active,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }) {
  return (
    <a
      aria-current={active ? "page" : undefined}
      className={cx(
        "block px-4 py-2 rounded font-medium transition-all duration-default ease-air",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-sumi",
        active
          ? "bg-fire-soft text-fire-text shadow-glow-fire-soft"
          : "text-washi-dim hover:bg-washi/5 hover:text-washi",
        className,
      )}
      {...props}
    />
  );
}

/* --------------------------------- Page Shells -------------------------------- */

export function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-void">
      {sidebar}
      <main className={cx("flex-1 overflow-y-auto p-8", SIDEBAR_OFFSET)}>
        {children}
      </main>
    </div>
  );
}

export function CenteredForm({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-sumi-2 border border-line rounded-md p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
