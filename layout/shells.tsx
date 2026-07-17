/**
 * GENSO — LAYOUT SHELLS
 * Page-level structure, as opposed to components/ which are content-level.
 */

import * as React from "react";
import { cx } from "../components/primitives"; // if cx isn't exported yet, copy the helper — see note below

/* ----------------------------- Sidebar Navigation ----------------------------- */

export function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cx(
        "w-64 bg-sumi-2/80 backdrop-blur-lg border-r border-white/10 p-6 h-screen fixed",
        className
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
      className={cx(
        "block px-4 py-2 rounded font-medium transition-all duration-default",
        active
          ? "bg-fire-soft text-fire-text shadow-glow-fire-soft"
          : "text-washi-dim hover:bg-white/5 hover:text-washi",
        className
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
      <main className="flex-1 overflow-y-auto p-8 ml-64">{children}</main>
    </div>
  );
}

export function CenteredForm({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sumi flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-sumi-2/60 backdrop-blur-md border border-white/10 rounded-md p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
