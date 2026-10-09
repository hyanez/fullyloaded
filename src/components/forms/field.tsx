import type { ReactNode } from "react";

// Shared look for text inputs and selects: 48px, 8px radius, functional boundary = muted
// (hairlines are decorative). Hover = 40% red border; invalid = ivory border + message below.
export const controlClass =
  "h-12 w-full scroll-mt-24 rounded-input border border-muted bg-input px-4 text-body text-text placeholder:text-muted hover:border-accent-emphasis aria-invalid:border-text disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-muted";

export function errorId(id: string) {
  return `${id}-error`;
}

export function hintId(id: string) {
  return `${id}-hint`;
}

/** Space-separated aria-describedby for a control, or undefined when there is nothing to describe. */
export function describedBy(id: string, { hint, error }: { hint?: boolean; error?: boolean }) {
  const ids = [hint && hintId(id), error && errorId(id)].filter(Boolean).join(" ");
  return ids || undefined;
}

/** Visible label + control + optional hint + error ("!" + reason, never color alone). */
export function Field({
  id,
  label,
  hint,
  error,
  gap = "gap-2",
  children,
}: {
  /** id of the control; the label points at it. */
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  gap?: "gap-2" | "gap-3";
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col ${gap}`}>
      <label htmlFor={id} className="text-label font-bold uppercase text-muted">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId(id)} className="text-small text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={id} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId(id)} className="flex gap-2 text-small text-error">
      <span aria-hidden="true" className="font-bold">
        !
      </span>
      {error}
    </p>
  );
}
