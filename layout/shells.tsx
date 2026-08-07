/**
 * GENSO — LAYOUT SHELLS
 * Page-level structure, as opposed to components/ which are content-level.
 */

import * as React from "react";
import { cx } from "../components/primitives";

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
        "bg-sumi-2/80 backdrop-blur-lg border-r border-line p-6 h-screen fixed",
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
    <div className="flex h-screen bg-sumi">
      {sidebar}
      <main className={cx("flex-1 overflow-y-auto p-8", SIDEBAR_OFFSET)}>
        {children}
      </main>
    </div>
  );
}

export function CenteredForm({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sumi flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-sumi-2/60 backdrop-blur-md border border-line rounded-md p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
