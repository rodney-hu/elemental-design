/**
 * GENSO — FORM FIELDS
 *
 * `Label`, `Input` and `ErrorText` have shipped since v0.1 as three unrelated
 * components. Nothing connected them: no `htmlFor`, no `aria-describedby`, no
 * `aria-invalid`. A screen-reader user got an unlabelled text box and never
 * heard the error at all — and the error itself had been literally invisible
 * until the contrast fix in v0.4 (docs/decisions.md).
 *
 * No single component can fix that, because the wiring lives BETWEEN them.
 * `FormField` is the composition that owns it: it generates the ids, connects
 * label → control → error → hint, and passes validity down.
 *
 * All controls sit on --sumi (recessed) per the elevation rule in
 * foundations.md, and share `controlBase` from primitives.tsx so they focus
 * identically.
 */

import * as React from "react";
import {
  cx,
  controlBase,
  controlValidity,
  Label,
  ErrorText,
} from "./primitives";

/* --------------------------------- FormField -------------------------------- */

export interface FormFieldProps {
  label: React.ReactNode;
  /** Validation message. Its presence is what puts the field in the error state. */
  error?: string;
  /** Helper text below the control. Announced with the field, before the error. */
  hint?: string;
  /** Marks the field required — visually and via `aria-required` on the control. */
  required?: boolean;
  /**
   * Receives the wiring to spread onto the control. Every prop here is one
   * that was missing before: id, aria-describedby, aria-invalid, aria-required.
   */
  children: (props: {
    id: string;
    invalid: boolean;
    "aria-describedby": string | undefined;
    "aria-required": true | undefined;
  }) => React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  /* useId, not a counter or a caller-supplied string: stable across SSR and
     hydration, and unique without the caller having to think about it. The
     old alternative — asking every call site to pass an id — is the reason
     none of them did. */
  const base = React.useId();
  const id = `${base}-control`;
  const errorId = `${base}-error`;
  const hintId = `${base}-hint`;

  const invalid = Boolean(error);

  /* Hint first, then error: a screen reader reads describedby in order, and
     "format is DD/MM/YYYY, that date is in the past" is the useful sequence. */
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cx("w-full", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-error-text ml-xs" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      {children({
        id,
        invalid,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}

      {hint && (
        <p id={hintId} className="text-xs text-washi-dim mt-1">
          {hint}
        </p>
      )}

      {/* role="alert" so a validation message that appears after submit is
          announced, not just silently linked. */}
      {error && (
        <ErrorText id={errorId} role="alert">
          {error}
        </ErrorText>
      )}
    </div>
  );
}

/* --------------------------------- Textarea --------------------------------- */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...rest }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cx(
        controlBase,
        controlValidity(invalid),
        "min-h-32 resize-y leading-relaxed",
        className,
      )}
      {...rest}
    />
  );
}

/* ---------------------------------- Select ---------------------------------- */
/* A native <select> with the platform chevron replaced.
 *
 * The chevron is a sibling SVG, not a background data: URI. A data URI cannot
 * read `currentColor` or a CSS variable, so that route forces the colour to be
 * re-authored as a literal — the exact second-representation problem the whole
 * token system exists to prevent, and genso-check would (correctly) fail it.
 * As a real element it inherits its colour the same way the element marks do.
 *
 * The wrapper is fine inside FormField: its render prop returns a ReactNode,
 * and the generated id lands on the <select> itself, which is what the label
 * and aria-describedby point at.
 *
 * Butt caps and miter joins, per the drawing rules in foundations.md. */

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, ...rest }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        aria-invalid={invalid || undefined}
        className={cx(
          controlBase,
          controlValidity(invalid),
          "appearance-none pr-10 cursor-pointer",
          className,
        )}
        {...rest}
      />
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-washi-dim"
      >
        <path d="M1 1.5 L6 6.5 L11 1.5" />
      </svg>
    </div>
  );
}

/* ----------------------------- Checkbox and Radio ---------------------------- */
/* `accent-color` styles the native control with one declaration and keeps
   every platform behaviour — keyboard, indeterminate state, form association —
   that a hand-rebuilt div would have to reimplement and usually gets wrong.
   Sharp corners on the checkbox; the radio stays round, because a square radio
   reads as a broken checkbox rather than as system character. */

const controlBox = cx(
  "w-4 h-4 shrink-0 bg-sumi border border-line-strong accent-fire cursor-pointer",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-sumi",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

export interface ChoiceProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
}

export function Checkbox({ label, className, id, ...rest }: ChoiceProps) {
  const generated = React.useId();
  const inputId = id ?? generated;
  return (
    <div className="flex items-center gap-sm">
      <input
        type="checkbox"
        id={inputId}
        className={cx(controlBox, "rounded", className)}
        {...rest}
      />
      <label
        htmlFor={inputId}
        className="text-sm font-body text-washi cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}

export function Radio({ label, className, id, ...rest }: ChoiceProps) {
  const generated = React.useId();
  const inputId = id ?? generated;
  return (
    <div className="flex items-center gap-sm">
      <input
        type="radio"
        id={inputId}
        className={cx(controlBox, "rounded-full", className)}
        {...rest}
      />
      <label
        htmlFor={inputId}
        className="text-sm font-body text-washi cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}

/* -------------------------------- RadioGroup -------------------------------- */
/* A set of radios is a single control to a screen reader, not N controls —
   which needs a fieldset with a legend. Doing it by hand is exactly the kind
   of markup that gets skipped. */

export interface RadioGroupProps {
  legend: React.ReactNode;
  name: string;
  options: Array<{ value: string; label: React.ReactNode; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
  className,
}: RadioGroupProps) {
  return (
    <fieldset className={cx("border-0 p-0 m-0", className)}>
      <legend className="text-sm font-mono text-washi-dim mb-2 block tracking-label uppercase">
        {legend}
      </legend>
      <div className="flex flex-col gap-sm">
        {options.map((opt) => (
          <Radio
            key={opt.value}
            name={name}
            value={opt.value}
            label={opt.label}
            disabled={opt.disabled}
            checked={value === undefined ? undefined : value === opt.value}
            onChange={onChange ? () => onChange(opt.value) : undefined}
          />
        ))}
      </div>
    </fieldset>
  );
}
