import type { CalendarEvent } from "@/lib/events";
import { DateBadge, DressCodeChips, EventMeta, EventPoster } from "./event-card-parts";

/**
 * Desktop/tablet calendar card (Figma "Event Card" 204:117): 2:3 poster, relative kicker,
 * title, time + location, dress-code chips and a date badge. Display only for now: no link.
 * Below 768px the calendar uses `EventAccordionCard` instead (Figma 413:596).
 */
export function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <article className="flex items-center gap-6 rounded-panel border border-line-strong bg-bg p-6 shadow-card">
      <EventPoster poster={event.poster} sizes="160px" className="w-40 rounded-panel" />

      <div className="flex min-w-0 flex-1 flex-col gap-2 self-start">
        <p className="text-kicker font-bold uppercase text-accent">{event.label}</p>
        <h3 className="font-display text-title text-text">{event.title}</h3>
        <p className="text-small font-medium text-muted">
          <EventMeta event={event} />
        </p>
        <DressCodeChips items={event.dressCode} />
      </div>

      <DateBadge date={event.date} size="lg" />
    </article>
  );
}
