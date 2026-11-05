import "server-only";
import { cache } from "react";
import { RULE_CONTENT_TYPE, type RuleEntry, type RuleFields } from "@/models";
import { getEntriesByType } from "./contentful";

/**
 * All rules, in the order they were created in Contentful (the model has no order field).
 * Entries without a title are skipped. Throws if Contentful can't be reached.
 * Cached per request, so the general and role-specific sections share one fetch.
 */
export const getRules = cache(async (): Promise<RuleEntry[]> => {
  const rules = await getEntriesByType<RuleFields>(RULE_CONTENT_TYPE, {
    query: { order: "sys.createdAt" },
  });
  return rules.filter((rule) => Boolean(rule.title));
});

/** House rules shown as rule cards (everything not flagged `roleSpecificRule`). */
export async function getGeneralRules(): Promise<RuleEntry[]> {
  return (await getRules()).filter((rule) => !rule.roleSpecificRule);
}

/** The design has room for two role cards; extra role-specific rules are ignored. */
const MAX_ROLE_RULES = 2;

/** Role-specific rules (Rules page, "Rules by roles"): the first two, in creation order. */
export async function getRoleRules(): Promise<RuleEntry[]> {
  return (await getRules()).filter((rule) => rule.roleSpecificRule).slice(0, MAX_ROLE_RULES);
}
