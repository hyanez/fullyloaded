import type { Asset, EntryFieldTypes } from "contentful";

/**
 * Contentful content type: Event (id `event`, display field `title`).
 * Mirror of the model in Contentful; keep in sync when the content model changes.
 *
 * Every field is required in Contentful, so a published entry always has all of them.
 * (Drafts fetched through the Preview API can still be incomplete.)
 */
export const EVENT_CONTENT_TYPE = "event";

// Allowed values of the `amenities` field (validation: `in`).
export const EVENT_AMENITIES = [
  "Health Check",
  "Clothes Checkin",
  "Private Bathrooms",
  "Water",
  "Lube",
] as const;
export type EventAmenity = (typeof EVENT_AMENITIES)[number];

// A `type` (not an `interface`) so it satisfies getEntriesByType's Record<string, unknown> constraint.
export type EventFields = {
  /** Editor-assigned unique key for the event; use it as the React `key` and for lookups. */
  uniqueId: string;
  title: string;
  /**
   * ISO 8601 string with a UTC offset (Contentful "Date" field), e.g. "2026-10-11T00:00-04:00".
   * The offset is the editor's, so format dates in the event's timezone, not the viewer's,
   * or the day can shift.
   */
  date: string;
  /** Resolved asset (the client fetches with `include: 2`). Use `poster.fields.file?.url`. */
  poster: Asset;
  eventDetails: string;
  /** ISO 8601 date-time string with offset (Contentful "Date" field), same format as `date`. */
  startTime: string;
  /** ISO 8601 date-time string with offset; same format as `startTime`. May fall on the day after `date`. */
  endTime: string;
  /** Rich Text document with marks and nodes disabled; effectively plain paragraphs. */
  cost: EntryFieldTypes.RichText;
  amenities: EventAmenity[];
  location: string;
  /** Free-form list. Contentful default: Naked, Jock, Harness. */
  dressCode: string[];
};

/**
 * An Event as returned by `getEntriesByType<EventFields>("event")`: fields plus `id`, which is
 * Contentful's own entry id (sys.id), not the editor-assigned `uniqueId`.
 */
export type EventEntry = { id: string } & EventFields;
