/**
 * GENSO — TABS
 *
 * Roving tabindex, per the WAI-ARIA tabs pattern: only the selected tab is
 * in the Tab order (tabIndex 0), the rest are tabIndex -1 and reachable by
 * arrow keys. Skipping this is the single most common accessibility bug in
 * hand-rolled tab components — every inactive tab becomes a stop on the Tab
 * key, so keyboard users tab through N stops to reach content that a mouse
 * user reaches in one click.
 *
 *   const [tab, setTab] = React.useState("overview");
 *   <Tabs value={tab} onChange={setTab}>
 *     <TabList>
 *       <Tab value="overview">Overview</Tab>
 *       <Tab value="usage">Usage</Tab>
 *     </TabList>
 *     <TabPanel value="overview">…</TabPanel>
 *     <TabPanel value="usage">…</TabPanel>
 *   </Tabs>
 *
 * Uncontrolled usage (no `value`/`onChange`) is supported via `defaultValue`.
 */

import * as React from "react";
import { cx } from "./primitives";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  }
  return ctx;
}

export interface TabsProps {
  /** Controlled selection. Omit and use `defaultValue` for uncontrolled. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  value: controlled,
  defaultValue,
  onChange,
  children,
  className,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const value = controlled ?? uncontrolled;
  const baseId = React.useId();

  const setValue = React.useCallback(
    (v: string) => {
      if (controlled === undefined) setUncontrolled(v);
      onChange?.(v);
    },
    [controlled, onChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ---------------------------------- TabList ---------------------------------- */

export function TabList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const listRef = React.useRef<HTMLDivElement>(null);

  /* Arrow/Home/End move focus AND selection together — the ARIA "automatic
     activation" model, appropriate here because switching panels is cheap.
     Looks up tabs by DOM order rather than tracking an array in context, so
     the list stays correct if a caller conditionally renders a Tab. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    if (!tabs.length) return;
    const current = tabs.findIndex((t) => t === document.activeElement);

    let next = -1;
    if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;

    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cx(
        "flex gap-1 border-b border-line",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------ Tab ------------------------------------ */

export interface TabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

export function Tab({ value, className, ...props }: TabProps) {
  const { value: active, setValue, baseId } = useTabsContext("Tab");
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setValue(value)}
      className={cx(
        "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-default ease-air",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-sumi rounded-t",
        selected
          ? "border-fire text-washi"
          : "border-transparent text-washi-dim hover:text-washi hover:border-line-strong",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------- TabPanel ---------------------------------- */

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep panels mounted while hidden (form state, scroll position). Default unmounts. */
  keepMounted?: boolean;
}

export function TabPanel({
  value,
  keepMounted = false,
  className,
  children,
  ...props
}: TabPanelProps) {
  const { value: active, baseId } = useTabsContext("TabPanel");
  const selected = active === value;

  if (!selected && !keepMounted) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!selected}
      tabIndex={0}
      className={cx("pt-4 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
