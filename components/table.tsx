/**
 * GENSO — TABLE
 *
 * A styled wrapper around native `<table>` elements, not a div-grid
 * reimplementation. Native table semantics (row/column headers, scope) are
 * what give a screen reader "column 3 of 5, Status" for free — a div grid
 * has to reconstruct that with ARIA by hand, and usually doesn't.
 *
 * The wrapper handles the one thing a bare `<table>` gets wrong on a narrow
 * viewport: it doesn't shrink, it overflows the page. `Table` wraps itself in
 * a scroll container so the overflow is contained and scrollable rather than
 * blowing out the layout — see the artifact/page-design rule this system
 * already follows elsewhere (foundations.md's width section) applied to a
 * new case.
 */

import * as React from "react";
import { cx } from "./primitives";

/* ----------------------------------- Table ----------------------------------- */

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Keeps the header row visible while the body scrolls. Needs a bounded-height ancestor. */
  stickyHeader?: boolean;
}

export function Table({ stickyHeader, className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-line">
      <table
        className={cx(
          "w-full text-sm text-left border-collapse",
          stickyHeader && "[&_thead]:sticky [&_thead]:top-0",
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

/* ------------------------------- Head / Body / Row ----------------------------- */

export function TableHead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cx("bg-sumi-2 [&_th]:border-b [&_th]:border-line", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cx(
        "[&_tr]:border-b [&_tr]:border-line [&_tr:last-child]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Row-level hover affordance — only for rows that are actually interactive (e.g. wrapped in an onClick). */
  interactive?: boolean;
}

export function TableRow({ interactive, className, ...props }: TableRowProps) {
  return (
    <tr
      className={cx(
        interactive &&
          "cursor-pointer hover:bg-sumi transition-colors duration-fast",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------- Header / Cell -------------------------------- */

export function TableHeaderCell({
  className,
  scope = "col",
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cx(
        "px-4 py-3 font-mono text-2xs uppercase tracking-label text-washi-dim whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cx("px-4 py-3 text-washi align-top", className)} {...props} />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cx("text-left text-sm text-washi-dim mb-2 caption-top", className)}
      {...props}
    />
  );
}
