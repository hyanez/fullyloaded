import "server-only";
import { RULE_CONTENT_TYPE, type RuleEntry, type RuleFields } from "@/models";
import { getEntriesByType } from "./contentful";

/**
 * All rules, in the order they were created in Contentful (the model has no order field).
 * Entries without a title are skipped. Throws if Contentful can't be reached.
 */
export async function getRules(): Promise<RuleEntry[]> {
  const rules = await getEntriesByType<RuleFields>(RULE_CONTENT_TYPE, {
    query: { order: "sys.createdAt" },
  });
  return rules.filter((rule) => Boolean(rule.title));
}
