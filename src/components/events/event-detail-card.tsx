import type { CalendarEvent } from "@/lib/events";
import { EventDetailsAccordion } from "./event-details-accordion";
import { EventPoster } from "./event-card-parts";

/**
 * Events page card (Figma "Event Card" 279:260 desktop, 416:609 mobile): big date + 2:3
 * poster, kicker, title, time and cost, and an "Event details" accordion.
 */
export function EventDetailCard({ event, defaultOpen }: { event: CalendarEvent; defaultOpen?: boolean }) {
  const { date } = event;
  return (
    <article className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-4 shadow-card md:flex-row md:gap-6 md:border-line-strong md:bg-bg md:p-6 lg:justify-center lg:gap-8">
      <div className="flex shrink-0 flex-col gap-4 md:w-60 lg:w-70">
        {/* Desktop/tablet date heading; the mobile circle badge is below. */}
        <time
          dateTime={date.dateTime}
          className="hidden text-right font-display text-title text-accent md:block"
        >
          {date.weekdayLong},
          <br />
          {date.monthLong} {date.dayNumber}
          <sup className="text-small">{date.ordinal}</sup>
        </time>
        <EventPoster
          poster={event.poster}
          sizes="(min-width: 1200px) 280px, (min-width: 768px) 240px, 100vw"
          className="w-full rounded-small md:rounded-panel"
        />
      </div>

      {/* lg: capped at the accordion width so the pair can be centered in the card. */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 lg:max-w-modal">
        <div className="flex items-center gap-3">
          {/* Mobile date badge: 72px circle, always 1:1. */}
          <time
            dateTime={date.dateTime}
            className="flex aspect-square size-18 shrink-0 flex-col items-center justify-center rounded-pill bg-action-aa text-text md:hidden"
          >
            <span className="sr-only">{date.long}</span>
            <span aria-hidden="true" className="text-kicker font-bold uppercase">
              {date.weekday}
            </span>
            <span aria-hidden="true" className="font-display text-card leading-none">
              {date.dayNumber}
            </span>
            <span aria-hidden="true" className="text-kicker font-bold uppercase">
              {date.month}
            </span>
          </time>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-kicker font-bold uppercase text-accent">{event.label}</p>
            <h3 className="font-display text-card text-text md:text-title">{event.title}</h3>
            <p className="text-small font-medium text-muted">
              <time dateTime={event.startTime.dateTime}>{event.startTime.text}</time>
              {event.cost.length > 0 && (
                <>
                  <span aria-hidden="true"> • </span>
                  <span className="sr-only">, </span>
                  {event.cost.join(" / ")}
                </>
              )}
            </p>
          </div>
        </div>

        <EventDetailsAccordion event={event} defaultOpen={defaultOpen} />
      </div>
    </article>
  );
}
