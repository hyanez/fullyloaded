import type { EntryFields } from "contentful";

/**
 * Contentful content type: Secondary Pages (id `secondaryPages`, display field `header`).
 * Long-form reading pages: Privacy Policy, Terms of Service, Waiver.
 * Mirror of the model in Contentful; keep in sync when it changes.
 *
 * NOTE: the model has no slug, so the only way to tell the entries apart is `header`
 * (e.g. "Privacy Policy"). Add a slug field in Contentful before fetching by route.
 * Every field is required in Contentful, so a published entry always has all of them.
 * (Drafts fetched through the Preview API can still be incomplete.)
 */
export const SECONDARY_PAGE_CONTENT_TYPE = "secondaryPages";

// A `type` (not an `interface`) so it satisfies getEntriesByType's Record<string, unknown> constraint.
export type SecondaryPageFields = {
  header: string;
  subheader: string;
  /** Free text (a "Symbol", not a date type), shown as written. */
  lastUpdatedDate: string;
  /** Short summary. Candidate for the page's meta description. */
  pageDescription: string;
  pageBody: EntryFields.RichText;
};

/** `id` is Contentful's own entry id (sys.id). */
export type SecondaryPageEntry = { id: string } & SecondaryPageFields;
