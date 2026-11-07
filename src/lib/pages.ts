import "server-only";
import { PAGE_CONTENT_TYPE, type PageEntry, type PageFields } from "@/models";
import { getEntriesByType } from "./contentful";

// The `page` model has no slug yet, so entries are found by their `header` (display field).
// Keep these in sync with the entry names in Contentful.
export const HOME_PAGE_HEADER = "Home Page";
export const EVENTS_PAGE_HEADER = "Upcoming Events";
export const RULES_PAGE_HEADER = "The Rules";
export const FAQ_PAGE_HEADER = "FAQ";

/** The `page` entry whose header is `header`, or null if none. Throws if Contentful can't be reached. */
export async function getPageByHeader(header: string): Promise<PageEntry | null> {
  const [page] = await getEntriesByType<PageFields>(PAGE_CONTENT_TYPE, {
    query: { "fields.header": header, limit: 1 },
  });
  return page ?? null;
}

/**
 * Absolute URL of the page's hero photo, or null if the entry has none (or it is unpublished).
 * Contentful serves protocol-relative URLs ("//images.ctfassets.net/…"); next/image needs https.
 */
export function heroImageUrl(page: PageEntry | null): string | null {
  const url = page?.heroImage?.fields?.file?.url;
  if (typeof url !== "string") return null;
  return url.startsWith("//") ? `https:${url}` : url;
}
