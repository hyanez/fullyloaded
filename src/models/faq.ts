import type { EntryFieldTypes } from "contentful";

/**
 * Contentful content type: FAQs (id `faqs`, display field `question`). One entry per question.
 * Mirror of the model in Contentful; keep in sync when it changes.
 *
 * NOTE: every field is optional in Contentful, so an entry can be published without an answer.
 * `faqType` is free text (no validation), so it is a plain string, not a union.
 */
export const FAQ_CONTENT_TYPE = "faqs";

// A `type` (not an `interface`) so it satisfies getEntriesByType's Record<string, unknown> constraint.
export type FaqFields = {
  question?: string;
  answer?: EntryFieldTypes.RichText;
  /** Category used to group questions. */
  faqType?: string;
};

/** `id` is Contentful's own entry id (sys.id). */
export type FaqEntry = { id: string } & FaqFields;
