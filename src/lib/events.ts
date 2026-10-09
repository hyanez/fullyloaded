import "server-only";
import { EVENT_CONTENT_TYPE, type EventEntry, type EventFields } from "@/models";
import { getEntriesByType } from "./contentful";

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
