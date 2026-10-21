import "server-only";
import { FAQ_CONTENT_TYPE, type FaqFields } from "@/models";
import { getEntriesByType } from "./contentful";
import { richTextParagraphs } from "./text";

/**
 * FAQ groups in page order (Figma 404:474). `faqType` is free text in Contentful, so entries
 * are matched case- and spacing-insensitively; "&" and "and" are treated the same.
 * Types not listed here still render, after these, under the editor's own label.
 */
export const FAQ_GROUPS = ["General", "Application & Entry", "Night Of", "Cumdump"] as const;

/** A question formatted for the client accordion: plain, serializable values only. */
export type FaqItem = { id: string; question: string; answer: string[] };
export type FaqGroup = { label: string; items: FaqItem[] };

const normalize = (value: string) =>
  value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");

/** Published FAQs grouped by type, oldest first within a group. Empty groups are left out. */
export async function getFaqGroups(): Promise<FaqGroup[]> {
  const entries = await getEntriesByType<FaqFields>(FAQ_CONTENT_TYPE, {
    query: { order: "sys.createdAt" },
  });

  const groups = new Map<string, FaqGroup>(
    FAQ_GROUPS.map((label) => [normalize(label), { label, items: [] }]),
  );
  for (const entry of entries) {
    const answer = richTextParagraphs(entry.answer);
    // Skip incomplete entries (drafts via preview, or published before fields were required).
    if (!entry.question || answer.length === 0) continue;
    const type = entry.faqType?.trim() || "General";
    const key = normalize(type);
    if (!groups.has(key)) groups.set(key, { label: type, items: [] });
    groups.get(key)!.items.push({ id: entry.id, question: entry.question, answer });
  }
  return [...groups.values()].filter((group) => group.items.length > 0);
}
