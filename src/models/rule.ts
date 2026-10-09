import type { Asset } from "contentful";

/**
 * Contentful content type: Rules (id `rules`, display field `title`). One entry per rule card.
 * Mirror of the model in Contentful; keep in sync when it changes.
 *
 * NOTE: every field is optional in Contentful. There is no order field, so card order is
 * whatever the query returns; add one (or sort by `sys.createdAt`) if order matters.
 */
export const RULE_CONTENT_TYPE = "rules";

// A `type` (not an `interface`) so it satisfies getEntriesByType's Record<string, unknown> constraint.
export type RuleFields = {
  /** Resolved asset (the client fetches with `include: 2`). Use `icon.fields.file?.url`. */
  icon?: Asset;
  title?: string;
  description?: string;
};

/** `id` is Contentful's own entry id (sys.id). */
export type RuleEntry = { id: string } & RuleFields;
