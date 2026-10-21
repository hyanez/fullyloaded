import type { EventsStatus } from "@/components/apply/apply-form";
import { SectionHeader, type SectionCopy } from "@/components/section-header";
import { getUpcomingEvents, toCalendarEvent, type CalendarEvent } from "@/lib/events";
import { EventAccordionCard } from "./event-accordion-card";
import { EventCard } from "./event-card";
import { EventDetailCard } from "./event-detail-card";

type EventCalendarProps = {
  /** Section heading copy from Contentful. Without it the section falls back to an aria-label. */
  copy?: SectionCopy | null;
  /** Show at most this many events (soonest first). All upcoming events when omitted. */
  limit?: number;
  /** Section heading id, unique per page if the calendar is used more than once. */
  headingId?: string;
  /**
   * `compact` (home, Figma 204:116): summary cards, accordion rows on mobile.
   * `detailed` (Events page, Figma 279:260): big date, poster and an "Event details" accordion.
   */
  variant?: "compact" | "detailed";
};

/**
 * Calendar Module (Figma 204:116): upcoming Contentful events as a list of event cards.
 * Async Server Component that fetches its own events, so any page can drop it in; the
 * page passes the heading copy. Set `revalidate` on the page to control freshness. If
 * Contentful is down or there are no events, the section still renders with a message.
 */
export async function EventCalendar({
  copy,
  limit,
  headingId = "event-calendar-heading",
  variant = "compact",
}: EventCalendarProps) {
  let events: CalendarEvent[] = [];
  let status: EventsStatus = "ok";
  try {
    events = (await getUpcomingEvents()).slice(0, limit).map(toCalendarEvent);
    if (events.length === 0) status = "empty";
  } catch (error) {
    console.error("[calendar] Could not load events from Contentful:", error);
    status = "error";
  }

  return (
    <section
      aria-labelledby={copy ? headingId : undefined}
      aria-label={copy ? undefined : "Event calendar"}
      className="border-t border-line py-14 md:py-20"
    >
      <div className="container flex flex-col gap-6 md:gap-8">
        {copy && <SectionHeader copy={copy} headingId={headingId} />}

        {status === "ok" ? (
          <ul className={`flex flex-col md:gap-6 ${variant === "detailed" ? "gap-5" : "gap-3"}`}>
            {events.map((event, index) => (
              <li key={event.id}>
                {variant === "detailed" ? (
                  <EventDetailCard event={event} defaultOpen={index === 0} />
                ) : (
                  <>
                    {/* One layout per breakpoint; the hidden one is display:none, so out of the a11y tree. */}
                    <div className="md:hidden">
                      <EventAccordionCard event={event} defaultOpen={index === 0} />
                    </div>
                    <div className="hidden md:block">
                      <EventCard event={event} />
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-panel border border-line-strong p-6 text-body text-muted">
            {status === "error"
              ? "We couldn't load upcoming dates. Please try again later."
              : "There are no upcoming dates right now. Check back on the 1st."}
          </p>
        )}
      </div>
    </section>
  );
}
