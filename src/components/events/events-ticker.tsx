import { getUpcomingEvents, toCalendarEvent } from "@/lib/events";
import { TickerTrack, type TickerItem } from "./ticker-track";

/**
 * Upcoming Events Ticker (Figma 302:352): a 56px strip above the home hero that scrolls the
 * upcoming Contentful events (date, title, start time). Same layout at every breakpoint.
 * Async Server Component; renders nothing if Contentful is down or there are no events, since
 * the calendar below already explains that state.
 *
 * Deviations from the Figma frame (guide wins):
 * - Border is `accent-emphasis` (red 40%); Figma uses red 50%, which isn't a token.
 * - Date uses the kicker role (+1.8px) instead of 12px +1.2px; title uses the utility role
 *   (+1px) instead of 13px +0.8px; time uses the kicker size (12/16) in muted, not uppercase.
 * - Adds a Pause/Play button (not in Figma) so the motion can be stopped (WCAG 2.2.2).
 */
export async function EventsTicker() {
  let items: TickerItem[] = [];
  try {
    items = (await getUpcomingEvents()).map((entry, index) => {
      const event = toCalendarEvent(entry, index);
      return {
        id: event.id,
        title: event.title,
        date: { text: `${event.date.month} ${event.date.day}`, dateTime: event.date.dateTime },
        startTime: event.startTime,
      };
    });
  } catch (error) {
    console.error("[ticker] Could not load events from Contentful:", error);
  }
  if (items.length === 0) return null;

  return (
    <section aria-label="Upcoming events" className="border-y border-accent-emphasis bg-surface">
      <TickerTrack items={items} />
    </section>
  );
}
