import "server-only";
import { EVENT_CONTENT_TYPE, type EventEntry, type EventFields } from "@/models";
import { getEntriesByType } from "./contentful";
import { richTextParagraphs } from "./text";

// TODO: confirm the timezone events run in. Contentful dates carry the editor's UTC offset, so
// dates are formatted in one fixed timezone instead of the viewer's to avoid the day shifting.
export const EVENT_TIMEZONE = "America/New_York";

/** "2026-10-11" style day key for an ISO date-time, in the event timezone. */
function dayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TIMEZONE }).format(new Date(iso));
}

/** "Sun, Oct 11" */
export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

/**
 * Events happening today or later, soonest first. Throws if Contentful can't be reached;
 * callers decide how to degrade.
 */
export async function getUpcomingEvents(): Promise<EventEntry[]> {
  const events = await getEntriesByType<EventFields>(EVENT_CONTENT_TYPE, {
    query: { order: "fields.date" },
  });
  const today = dayKey(new Date().toISOString());
  return (
    events
      // Fields are required in the model, but a published entry can predate that rule: skip
      // anything without the two fields we need rather than rendering a broken option.
      .filter((event) => Boolean(event.uniqueId && event.date))
      .filter((event) => dayKey(event.date) >= today)
  );
}

/** "10:00 PM" */
function formatEventTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** English ordinal suffix: 1 → "st", 2 → "nd", 11 → "th", 24 → "th". */
function ordinalSuffix(n: number): string {
  const rules = new Intl.PluralRules("en-US", { type: "ordinal" });
  return ({ one: "st", two: "nd", few: "rd" } as Record<string, string>)[rules.select(n)] ?? "th";
}

/**
 * Date pieces for badges and headings, e.g. `{ month: "Oct", day: "24", long: "Saturday, October 24",
 * dateTime: "2026-10-24", weekday: "Sat", weekdayLong: "Saturday", monthLong: "October",
 * dayNumber: "24", ordinal: "th" }`.
 */
function eventDateParts(iso: string) {
  const date = new Date(iso);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TIMEZONE, ...options }).format(date);
  const dayNumber = part({ day: "numeric" });
  return {
    month: part({ month: "short" }),
    day: part({ day: "2-digit" }),
    long: part({ weekday: "long", month: "long", day: "numeric" }),
    dateTime: dayKey(iso),
    weekday: part({ weekday: "short" }),
    weekdayLong: part({ weekday: "long" }),
    monthLong: part({ month: "long" }),
    dayNumber,
    ordinal: ordinalSuffix(Number(dayNumber)),
  };
}

/**
 * Relative kicker for an upcoming event ("Up next", "This week", …). `index` is the event's
 * position in the soonest-first list; the first one is always "Up next".
 */
function eventRelativeLabel(iso: string, index: number): string {
  if (index === 0) return "Up next";
  const today = dayKey(new Date().toISOString());
  const day = dayKey(iso);
  const daysAway = (Date.parse(day) - Date.parse(today)) / 86_400_000;
  if (daysAway < 7) return "This week";
  if (daysAway < 14) return "Next week";
  if (day.slice(0, 7) === today.slice(0, 7)) return "Later this month";
  return "Coming up";
}

/**
 * An event formatted for the calendar cards: plain, serializable values only, so it can be
 * passed to Client Components (which must not import this server-only module, except types).
 */
export type CalendarEvent = {
  id: string;
  title: string;
  /** Relative kicker, e.g. "Up next". */
  label: string;
  date: ReturnType<typeof eventDateParts>;
  startTime: { text: string; dateTime: string };
  /** "9:00 PM – 12:00 AM" */
  schedule: string;
  /** Cost lines (Contentful rich text, flattened to plain paragraphs). */
  cost: string[];
  location: string;
  details: string;
  dressCode: string[];
  /** Amenities except "Health Check", which is surfaced separately as `healthCheck`. */
  amenities: string[];
  healthCheck: boolean;
  poster: { url: string; alt: string } | null;
};

const HEALTH_CHECK_AMENITY = "Health Check";

/** `index` is the event's position in the soonest-first list (drives the relative label). */
export function toCalendarEvent(event: EventEntry, index: number): CalendarEvent {
  const file = event.poster?.fields?.file;
  const posterUrl = typeof file?.url === "string" ? file.url : null;
  const posterAlt = event.poster?.fields?.description;
  return {
    id: event.uniqueId,
    title: event.title,
    label: eventRelativeLabel(event.date, index),
    date: eventDateParts(event.date),
    startTime: { text: formatEventTime(event.startTime), dateTime: event.startTime },
    schedule: event.endTime
      ? `${formatEventTime(event.startTime)} – ${formatEventTime(event.endTime)}`
      : formatEventTime(event.startTime),
    cost: richTextParagraphs(event.cost),
    location: event.location ?? "",
    details: event.eventDetails ?? "",
    dressCode: event.dressCode ?? [],
    amenities: (event.amenities ?? []).filter((item) => item !== HEALTH_CHECK_AMENITY),
    healthCheck: (event.amenities ?? []).includes(HEALTH_CHECK_AMENITY),
    poster: posterUrl
      ? { url: `https:${posterUrl}`, alt: typeof posterAlt === "string" ? posterAlt : "" }
      : null,
  };
}
