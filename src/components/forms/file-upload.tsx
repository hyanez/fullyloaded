"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { describedBy, Field } from "./field";

// Single-image picker. The native <input type="file"> stays the source of truth (it is what a
// form submit reads); the dashed 140px box is its label. Keyboard focus shows on the box.
export function FileUpload({
  id,
  name,
  label,
  error,
  onFileChange,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  /** Called with the chosen file, or undefined when it is removed. */
  onFileChange?: (file: File | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name);
    onFileChange?.(file);
  }

  function remove() {
    if (inputRef.current) inputRef.current.value = "";
    setFileName(undefined);
    onFileChange?.(undefined);
    inputRef.current?.focus();
  }

  return (
    <Field id={id} label={label} error={error} gap="gap-3">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept="image/jpeg,image/png"
          required
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { error: Boolean(error) })}
          onChange={handleChange}
          className="peer absolute inset-0 size-full cursor-pointer opacity-0"
        />
        <div
          className={`flex h-35 items-center gap-3 rounded-input border border-dashed bg-input p-6 peer-hover:border-accent-emphasis peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-focus ${
            error ? "border-text" : "border-muted"
          }`}
        >
          <Image src="/icons/upload.svg" alt="" width={24} height={24} className="shrink-0" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate text-small font-semibold text-text">
              {fileName ?? "Click to upload"}
            </p>
            <p className="text-small text-muted">
              {fileName ? "Click to replace" : "JPG or PNG"}
            </p>
          </div>
        </div>
      </div>
      {fileName ? (
        <button
          type="button"
          onClick={remove}
          className="self-start text-small font-medium text-text underline hover:text-accent"
        >
          Remove {label.toLowerCase()}
        </button>
      ) : null}
    </Field>
  );
}
