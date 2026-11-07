import Image from "next/image";
import type { CalendarEvent } from "@/lib/events";

// Pieces shared by the desktop card and the mobile accordion card. No server-only imports,
// so both Server and Client Components can use them.

/**
 * Red date badge. `action-aa`, not `accent`: the guide's contrast audit has ivory on accent at
 * 3.72:1 (small-text fail) and ivory on action-aa at 5.61:1 (AA).
 */
export function DateBadge({ date, size }: { date: CalendarEvent["date"]; size: "sm" | "lg" }) {
  return (
    <time
      dateTime={date.dateTime}
      className={
        size === "lg"
          ? "flex size-24 shrink-0 flex-col items-center justify-center rounded-modal bg-action-aa text-text"
          : "flex size-14 shrink-0 flex-col items-center justify-center rounded-small bg-action-aa text-text"
      }
    >
      <span className="sr-only">{date.long}</span>
      <span aria-hidden="true" className="text-kicker font-bold uppercase">
        {date.month}
      </span>
      <span
        aria-hidden="true"
        className={`font-display leading-none ${size === "lg" ? "text-title" : "text-legal"}`}
      >
        {date.day}
      </span>
    </time>
  );
}

/** Poster at its native 2:3 ratio. `sizes` is the rendered width for next/image. */
export function EventPoster({
  poster,
  sizes,
  className = "",
}: {
  poster: CalendarEvent["poster"];
  sizes: string;
  className?: string;
}) {
  if (!poster) return null;
  return (
    <div className={`relative aspect-2/3 shrink-0 overflow-hidden bg-bg ${className}`}>
      <Image src={poster.url} alt={poster.alt} fill sizes={sizes} quality={90} className="object-cover" />
    </div>
  );
}

/** "9:00 PM • Midtown Manhattan" */
export function EventMeta({ event }: { event: CalendarEvent }) {
  return (
    <>
      <time dateTime={event.startTime.dateTime}>{event.startTime.text}</time>
      {event.location && (
        <>
          <span aria-hidden="true"> • </span>
          <span className="sr-only">, </span>
          {event.location}
        </>
      )}
    </>
  );
}

export function DressCodeChips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label="Dress code" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-pill border border-accent-emphasis bg-bg px-3 py-1 text-kicker font-bold uppercase text-accent"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
