import type { Asset, EntryFieldTypes } from "contentful";

/**
 * Contentful content type: Page (id `page`, display field `header`).
 * Copy for a main page: a header, intro, up to two optional content sections and a closing
 * call-to-action section. Mirror of the model in Contentful; keep in sync when it changes.
 *
 * NOTE: the model has no slug / page key, so there is no field to say which page an entry
 * is for (landing, events, rules, FAQ). Add one in Contentful before fetching by page.
 */
export const PAGE_CONTENT_TYPE = "page";

// A `type` (not an `interface`) so it satisfies getEntriesByType's Record<string, unknown> constraint.
export type PageFields = {
  header: string;
  /** Hero background photo. Resolved asset (the client fetches with `include: 2`); use `heroImageUrl`. */
  heroImage?: Asset;
  description: EntryFieldTypes.RichText;
  sectionOneHeader?: string;
  sectionOneSubhead?: string;
  sectionOneDescription?: string;
  sectionTwoHeader?: string;
  sectionTwoSubhead?: string;
  sectionTwoDescription?: string;
  actionSectionHeader: string;
  actionSectionSubhead: string;
  actionSectionDescription: string;
  /** Label of the call-to-action button. */
  actionSectionButton: string;
};

/** `id` is Contentful's own entry id (sys.id). */
export type PageEntry = { id: string } & PageFields;
