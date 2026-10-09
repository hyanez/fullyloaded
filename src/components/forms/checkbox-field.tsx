import type { ReactNode } from "react";
import { describedBy, FieldError } from "./field";

// Native checkbox, never preselected. `label` is the control's accessible name (and clickable);
// `children` is supporting copy announced as its description. The 20px box follows Figma 771:776.
export function CheckboxField({
  id,
  name,
  label,
  error,
  onChange,
  children,
}: {
  id: string;
  name: string;
  label: ReactNode;
  error?: string;
  onChange?: () => void;
  children?: ReactNode;
}) {
  const descriptionId = `${id}-description`;
  const describedByIds = [children ? descriptionId : undefined, error ? describedBy(id, { error: true }) : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 size-5 shrink-0">
          <input
            id={id}
            name={name}
            type="checkbox"
            required
            aria-required="true"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedByIds || undefined}
            onChange={onChange}
            className="peer size-5 scroll-mt-24 appearance-none rounded-checkbox border border-muted bg-input checked:border-action-aa checked:bg-action-aa hover:border-accent-emphasis aria-invalid:border-text"
          />
          {/* Check mark: 2px round-cap stroke. TODO: swap for the guide's consent check artwork once exported. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            width="12"
            height="12"
            fill="none"
            className="pointer-events-none absolute left-1 top-1 hidden peer-checked:block"
          >
            <path d="M2 6.5L5 9.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text" />
          </svg>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-3 text-small text-muted">
          <label htmlFor={id}>{label}</label>
          {children ? <div id={descriptionId} className="flex flex-col gap-3">{children}</div> : null}
        </div>
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
}
