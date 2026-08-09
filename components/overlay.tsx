/**
 * GENSO — OVERLAY (Modal, Toast)
 *
 * Both float above content and both were on the "still to build" list since
 * v0.1. Grouped here because they share one real concern: what layer they
 * render in and how they get out of the way when dismissed.
 *
 * Neither reaches for a z-index token. Modal renders in the browser's native
 * top layer (see below) and needs none; Toast uses Tailwind's default
 * `z-50`, which is enough because nothing else in this system claims a
 * stacking context that high. Inventing a z-index scale for two components
 * is exactly the kind of token nobody would reach for correctly — see
 * foundations.md's bias against tokens with no second user.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { cx } from "./primitives";

/* ----------------------------------- Modal ----------------------------------- */
/**
 * Built on the native <dialog> element rather than a hand-rolled overlay div,
 * because <dialog>.showModal() gives three things for free that a div-based
 * modal has to reimplement and reliably gets wrong: a focus trap, Escape to
 * close, and rendering in the browser's top layer (so it's above everything
 * without a z-index war). The `native-dialog` allowance below documents the
 * trade — see the comment on the `<dialog>` element itself.
 *
 * React has no controlled prop for open/closed on <dialog>, so `open` is
 * synced imperatively: showModal() / close() run in an effect keyed on it.
 */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* Fires on Escape (the browser's own 'cancel' → 'close' sequence) and on
       a form[method=dialog] submit — both cases the caller's `open` state
       needs to follow, or the dialog closes visually while `open` stays
       true and a re-render reopens it. */
    const onNativeClose = () => onClose();
    el.addEventListener("close", onNativeClose);
    return () => el.removeEventListener("close", onNativeClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      /* genso-allow: native-dialog — <dialog> is exempt from the sharp-corner
         audit by convention, not this rule set; the panel classes below still
         use rounded-md like every other panel. This comment exists only so a
         future reviewer sees the exemption was considered, not missed. */
      className={cx(
        "bg-sumi-2 border border-line rounded-md p-0 m-auto max-w-container-sm w-[calc(100vw-2rem)]",
        "backdrop:bg-void/70",
        open && "rise",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-lg p-6 border-b border-line">
        <h2 id={titleId} className="font-head text-xl text-washi tracking-display">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={cx(
            "text-washi-dim hover:text-washi transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-sumi-2 rounded",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="butt" aria-hidden="true">
            <path d="M3 3 L15 15 M15 3 L3 15" />
          </svg>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}

/* ----------------------------------- Toast ----------------------------------- */
/**
 * A minimal, dependency-free toast stack. No animation library: entrance
 * reuses the system's own `.rise` utility (tokens.css), which is already
 * gated on `prefers-reduced-motion` — a second reduced-motion implementation
 * here would be the exact "the showcase needed its own guard" mistake this
 * system already paid for once (see docs/decisions.md).
 *
 *   const toast = useToast();
 *   toast.push({ tone: "success", message: "Saved." });
 *
 * `<ToastViewport />` renders the stack. Mount it once, near the app root —
 * NOT once per page, or toasts fire twice.
 */

type ToastTone = "error" | "warning" | "success" | "info";

/* Reuses Status's semantic tones and adds "info", mapped to water — water is
   philosophy.md's "secondary accent, info" element, not a new colour axis. */
const toastTone: Record<ToastTone, string> = {
  error: "border-error/30 text-error-text",
  warning: "border-warning/30 text-warning-text",
  success: "border-success/30 text-success-text",
  info: "border-water/30 text-water-text",
};

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: React.ReactNode;
}

interface ToastContextValue {
  push: (toast: { tone?: ToastTone; message: React.ReactNode; duration?: number }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let toastSeq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback<ToastContextValue["push"]>(
    ({ tone = "info", message, duration = 5000 }) => {
      const id = `toast-${++toastSeq}`;
      setToasts((cur) => [...cur, { id, tone, message }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be called inside a <ToastProvider>.");
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      /* One live region for the whole stack, not one per toast — a screen
         reader announces additions to it without needing every toast to
         re-declare aria-live. `role="status"` is polite by default, which
         is correct for the auto-dismiss case; a genuinely urgent message
         should still use tone="error" but is not interrupted more than any
         other toast — that's a deliberate choice against alarm fatigue. */
      role="status"
      aria-live="polite"
      className="fixed bottom-lg right-lg z-50 flex flex-col gap-sm w-full max-w-container-sm px-md sm:px-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "rise bg-sumi-2 border rounded-md shadow-lg px-4 py-3 flex items-start gap-3",
            toastTone[t.tone],
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 shrink-0" aria-hidden="true" />
          <p className="text-sm text-washi flex-1">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="text-washi-dim hover:text-washi transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire rounded"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="butt" aria-hidden="true">
              <path d="M2 2 L12 12 M12 2 L2 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
