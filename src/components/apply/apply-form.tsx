"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  formatDobInput,
  validateConsent,
  validateDob,
  validateEmail,
  validateEvent,
  validateName,
  validatePhotos,
} from "@/lib/apply-validation";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { controlClass, describedBy, Field } from "@/components/forms/field";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { CONTACT_EMAIL } from "@/lib/site-links";

export type EventOption = { value: string; label: string };
export type EventsStatus = "ok" | "empty" | "error";

type FieldKey = "name" | "email" | "dob" | "event" | "photos" | "consent";
type Errors = Partial<Record<FieldKey, string>>;

const fieldId = (key: FieldKey) => `apply-${key}`;
const FIELD_ORDER: FieldKey[] = ["name", "email", "dob", "event", "photos", "consent"];

function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  // New tab so a half-filled form isn't lost while someone reads the policy.
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-text">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </Link>
  );
}

export function ApplyForm({
  events,
  eventsStatus,
}: {
  events: EventOption[];
  eventsStatus: EventsStatus;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [dob, setDob] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosBusy, setPhotosBusy] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "failed" | "done">("idle");
  const successRef = useRef<HTMLHeadingElement>(null);
  const eventsReady = eventsStatus === "ok";

  function setError(key: FieldKey, message: string | undefined) {
    setErrors((current) => ({ ...current, [key]: message }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "submitting") return;
    const data = new FormData(event.currentTarget);
    const next: Errors = {
      name: validateName(String(data.get("name") ?? "")),
      email: validateEmail(String(data.get("email") ?? "")),
      dob: validateDob(dob),
      // With no events to choose from the select is disabled; that is reported separately below.
      event: eventsReady ? validateEvent(String(data.get("event") ?? "")) : undefined,
      photos: photosBusy ? "Your photos are still being prepared. Try again in a moment." : validatePhotos(photos),
      consent: validateConsent(data.get("consent") === "on"),
    };
    setErrors(next);

    const firstInvalid = FIELD_ORDER.find((key) => next[key]);
    if (firstInvalid) {
      setSubmitState("idle");
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    // The photo input has no name (it is only a picker); send the compressed files instead.
    photos.forEach((file) => data.append("photos", file));
    setSubmitState("submitting");
    try {
      const response = await fetch("/api/apply", { method: "POST", body: data });
      if (!response.ok) throw new Error(`Apply failed with ${response.status}`);
      setSubmitState("done");
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (error) {
      console.error("[apply]", error);
      setSubmitState("failed");
    }
  }

  if (submitState === "done") {
    return (
      <div className="flex w-full flex-col gap-4 rounded-panel border border-line bg-surface p-6 shadow-panel md:p-8 lg:w-145 lg:shrink-0">
        {/* TODO: guide calls for a check icon with success text; none is exported yet. */}
        <h2 ref={successRef} tabIndex={-1} className="font-display text-card text-text">
          Application received
        </h2>
        <p className="text-body text-muted">
          Thanks for applying. You&apos;ll get an email about the party once your application is processed.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-5 rounded-panel border border-line bg-surface p-6 shadow-panel md:gap-6 md:p-8 lg:w-145 lg:shrink-0"
    >
      <Field id={fieldId("name")} label="Name" error={errors.name}>
        <input
          id={fieldId("name")}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Alex Thorne"
          required
          aria-required="true"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy(fieldId("name"), { error: Boolean(errors.name) })}
          onChange={() => setError("name", undefined)}
          className={controlClass}
        />
      </Field>

      <Field id={fieldId("email")} label="Email Address" error={errors.email}>
        <input
          id={fieldId("email")}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="alex@example.com"
          required
          aria-required="true"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy(fieldId("email"), { error: Boolean(errors.email) })}
          onChange={() => setError("email", undefined)}
          className={controlClass}
        />
      </Field>

      <Field id={fieldId("dob")} label="Date of Birth" error={errors.dob}>
        <input
          id={fieldId("dob")}
          name="dob"
          type="text"
          inputMode="numeric"
          placeholder="00/00/0000"
          maxLength={10}
          value={dob}
          required
          aria-required="true"
          aria-invalid={errors.dob ? true : undefined}
          aria-describedby={describedBy(fieldId("dob"), { error: Boolean(errors.dob) })}
          onChange={(e) => {
            setDob(formatDobInput(e.target.value));
            setError("dob", undefined);
          }}
          className={controlClass}
        />
      </Field>

      <Field
        id={fieldId("event")}
        label="Event"
        error={errors.event}
        hint={
          eventsStatus === "error"
            ? "We couldn't load the event list. Please try again later."
            : eventsStatus === "empty"
              ? "There are no upcoming events open for applications right now."
              : undefined
        }
      >
        <div className="relative">
          <select
            id={fieldId("event")}
            name="event"
            defaultValue=""
            disabled={!eventsReady}
            required
            aria-required="true"
            aria-invalid={errors.event ? true : undefined}
            aria-describedby={describedBy(fieldId("event"), {
              hint: !eventsReady,
              error: Boolean(errors.event),
            })}
            onChange={() => setError("event", undefined)}
            className={`${controlClass} appearance-none pr-10`}
          >
            <option value="" disabled className="bg-input text-muted">
              Select event
            </option>
            {events.map((option) => (
              <option key={option.value} value={option.value} className="bg-input text-text">
                {option.label}
              </option>
            ))}
          </select>
          <Image
            src="/icons/chevron-down.svg"
            alt=""
            width={16}
            height={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
          />
        </div>
      </Field>

      <PhotoUpload
        id={fieldId("photos")}
        label="Photos"
        hint="Include a clear photo of your face and a shirtless photo."
        error={errors.photos}
        onChange={(files) => {
          setPhotos(files);
          if (files.length) setError("photos", undefined);
        }}
        onProblem={(message) => setError("photos", message)}
        onBusyChange={setPhotosBusy}
      />

      <CheckboxField
        id={fieldId("consent")}
        name="consent"
        error={errors.consent}
        onChange={() => setError("consent", undefined)}
        label={
          <>
            By signing I have read the <LegalLink href="/waiver">waiver and release of liability</LegalLink> and
            fully understand its terms and voluntarily agree to be bound by it.
          </>
        }
      >
        <p>
          This signature also serves as agreement to our{" "}
          <LegalLink href="/privacy-policy">data privacy policy</LegalLink> and{" "}
          <LegalLink href="/terms-of-service">terms of service</LegalLink>.
        </p>
        <p>By submitting this application, you agree that:</p>
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>Your information will be used to assess eligibility for Fully Loaded membership and events</li>
          <li>We may process your data, including images and preferences, for curation and access purposes</li>
          <li>
            Your data will be handled in accordance with our{" "}
            <LegalLink href="/privacy-policy">Privacy Policy</LegalLink>
          </li>
          <li>You may withdraw your consent at any time by contacting us</li>
        </ol>
      </CheckboxField>

      {submitState === "failed" ? (
        <p role="alert" className="flex gap-2 text-small text-error">
          <span aria-hidden="true" className="font-bold">
            !
          </span>
          <span>
            We couldn&apos;t send your application. Please try again, or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            .
          </span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitState === "submitting"}
        className="flex min-h-14 w-full items-center justify-center rounded-pill border border-action-aa bg-action-aa px-6 font-body text-utility font-bold uppercase text-text hover:border-accent-emphasis hover:bg-surface hover:underline disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-action-aa disabled:hover:bg-action-aa disabled:hover:no-underline"
      >
        {submitState === "submitting" ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
