"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MAX_PHOTOS, validateSourceImage } from "@/lib/apply-validation";
import { compressImage } from "@/lib/compress-image";
import { describedBy, Field } from "./field";

type Photo = { id: string; file: File; url: string; name: string };

// Multi-photo picker with previews. Picked photos are compressed right away, so the thumbnails
// show exactly what will be uploaded. The native input is only a picker (cleared after each pick
// so photos can be added a few at a time); the compressed files are reported through onChange
// and the parent appends them on submit. The dashed 140px box is the input's visible target.
export function PhotoUpload({
  id,
  label,
  hint,
  error,
  onChange,
  onProblem,
  onBusyChange,
}: {
  id: string;
  label: string;
  hint: string;
  error?: string;
  /** Called with the compressed files whenever the set changes. */
  onChange: (files: File[]) => void;
  /** Called with a reason when picked files were skipped, or undefined when a pick was clean. */
  onProblem: (message: string | undefined) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<Photo[]>([]);
  // Keys for the thumbnail list. (crypto.randomUUID only exists on HTTPS/localhost, so not that.)
  const nextId = useRef(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const full = photos.length >= MAX_PHOTOS;

  // Release preview memory when the form goes away.
  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  function commit(next: Photo[]) {
    photosRef.current = next;
    setPhotos(next);
    onChange(next.map((photo) => photo.file));
  }

  function setBusyState(value: boolean) {
    setBusy(value);
    onBusyChange?.(value);
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;

    const problems: string[] = [];
    let accepted = picked.filter((file) => {
      const problem = validateSourceImage(file);
      if (problem) problems.push(problem);
      return !problem;
    });
    const room = MAX_PHOTOS - photosRef.current.length;
    if (accepted.length > room) {
      const skipped = accepted.length - room;
      problems.push(
        `You can upload up to ${MAX_PHOTOS} photos, so ${skipped} ${skipped === 1 ? "wasn't" : "weren't"} added.`,
      );
      accepted = accepted.slice(0, room);
    }

    setBusyState(true);
    // One at a time: decoding several full-size phone photos at once can run iOS out of memory.
    const added: Photo[] = [];
    for (const file of accepted) {
      try {
        const compressed = await compressImage(file);
        added.push({ id: String(nextId.current++), file: compressed, url: URL.createObjectURL(compressed), name: file.name });
      } catch (error) {
        console.error("[photo-upload]", file.name, error);
        problems.push(`${file.name} couldn't be read. Try a different photo.`);
      }
    }
    commit([...photosRef.current, ...added]);
    setBusyState(false);
    onProblem(problems.length ? problems.join(" ") : undefined);
  }

  function remove(photo: Photo) {
    URL.revokeObjectURL(photo.url);
    commit(photosRef.current.filter((p) => p.id !== photo.id));
    onProblem(undefined);
    // The input is enabled again on the next render; put focus somewhere predictable.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const status = busy
    ? "Preparing photos…"
    : full
      ? `${MAX_PHOTOS} of ${MAX_PHOTOS} photos added. Remove one to add another.`
      : photos.length
        ? `${photos.length} of ${MAX_PHOTOS} photos added. Click to add more.`
        : `JPG, PNG or HEIC, up to ${MAX_PHOTOS} photos`;

  return (
    <Field id={id} label={label} hint={hint} error={error} gap="gap-3">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
          multiple
          disabled={busy || full}
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint: true, error: Boolean(error) })}
          onChange={handleChange}
          className="peer absolute inset-0 size-full scroll-mt-24 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <div
          className={`flex h-35 items-center gap-3 rounded-input border border-dashed bg-input p-6 peer-hover:border-accent-emphasis peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-focus peer-disabled:opacity-45 peer-disabled:peer-hover:border-muted ${
            error ? "border-text" : "border-muted"
          }`}
        >
          <Image src="/icons/upload.svg" alt="" width={24} height={24} className="shrink-0" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-small font-semibold text-text">
              {photos.length ? "Add more photos" : "Click to upload"}
            </p>
            <p className="text-small text-muted">{status}</p>
          </div>
        </div>
      </div>

      {/* Announces additions/removals; the visible status line above is not live. */}
      <p aria-live="polite" className="sr-only">
        {busy ? "Preparing photos…" : `${photos.length} of ${MAX_PHOTOS} photos added.`}
      </p>

      {photos.length ? (
        <ul aria-label="Photos to upload" className="grid grid-cols-3 gap-3 md:grid-cols-5">
          {photos.map((photo, index) => (
            <li key={photo.id} className="flex flex-col gap-2">
              {/* Blob URLs can't go through next/image's optimizer. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Photo ${index + 1}: ${photo.name}`}
                className="aspect-square w-full rounded-small border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => remove(photo)}
                aria-label={`Remove photo ${index + 1}, ${photo.name}`}
                className="self-start py-1 text-small font-medium text-text underline hover:text-accent"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Field>
  );
}
