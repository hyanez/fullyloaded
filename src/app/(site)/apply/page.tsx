import type { Metadata } from "next";
import Image from "next/image";
import {
  ApplyForm,
  type EventOption,
  type EventsStatus,
} from "@/components/apply/apply-form";
import { formatEventDate, getUpcomingEvents } from "@/lib/events";
import { CONTACT_EMAIL } from "@/lib/site-links";

// TODO: confirm the description with the owner.
export const metadata: Metadata = {
  title: "Apply",
  description: "Join the Fully Loaded guestlist. Apply to an upcoming event.",
  alternates: { canonical: "/apply" },
};

// Refresh the event list from Contentful at most every 5 minutes.
export const revalidate = 300;

export default async function ApplyPage() {
  let events: EventOption[] = [];
  let eventsStatus: EventsStatus = "ok";
  try {
    events = (await getUpcomingEvents()).map((event) => ({
      value: event.uniqueId,
      label: `${event.title ?? event.uniqueId} — ${formatEventDate(event.date)}`,
    }));
    if (events.length === 0) eventsStatus = "empty";
  } catch (error) {
    // The page and form still render; the event select explains it is unavailable.
    console.error("[apply] Could not load events from Contentful:", error);
    eventsStatus = "error";
  }

  return (
    // TODO: page copy is hardcoded from Figma; move it to a Contentful `page` entry (needs a slug field).
    <main className="relative overflow-hidden">
      {/* Mobile stage glow (Figma 425:1230); decorative. */}
      <Image
        src="/brand/stage-glow.svg"
        alt=""
        width={390}
        height={320}
        className="pointer-events-none absolute left-0 top-0 w-full md:hidden"
      />

      <div className="container relative flex flex-col gap-8 py-10 md:gap-10 md:pb-30 md:pt-20 lg:flex-row lg:items-start lg:gap-20">
        <div className="flex flex-col gap-8 md:gap-10 lg:min-w-0 lg:flex-1">
          <div className="flex flex-col gap-4 md:gap-5">
            <p className="flex items-center gap-3 text-kicker font-bold uppercase text-accent">
              <span aria-hidden="true" className="h-0.75 w-11 bg-accent" />
              Apply
            </p>
            <h1 className="font-display text-hero-apply text-text">Join the guestlist</h1>
            <div className="flex flex-col gap-6 text-small text-muted md:text-body">
              <p>
                Please provide accurate details below. You will receive an email with information
                about the party you applied to once your application is processed.
              </p>
              <p>Make sure to review the rules and know what party you&apos;re applying to.</p>
              <p>By sharing your email you&apos;re agreeing to accept promotional emails.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-display text-kicker font-bold uppercase text-accent">Email</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="break-words font-display text-contact text-text hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <ApplyForm events={events} eventsStatus={eventsStatus} />
      </div>
    </main>
  );
}
