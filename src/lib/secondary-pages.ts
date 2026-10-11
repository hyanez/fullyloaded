import "server-only";
import { cache } from "react";
import {
  SECONDARY_PAGE_CONTENT_TYPE,
  type SecondaryPageEntry,
  type SecondaryPageFields,
} from "@/models";
import { getEntriesByType } from "./contentful";

/** Entry headers in Contentful. The model has no slug, so `header` is the lookup key. */
export const SECONDARY_PAGE_HEADERS = {
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  waiver: "Waiver",
} as const;

/**
 * The published Secondary Pages entry whose `header` matches exactly, or null if there is none.
 * Wrapped in React `cache` so `generateMetadata` and the page share one request per render.
 * Throws if Contentful can't be reached; callers decide how to degrade.
 */
export const getSecondaryPage = cache(
  async (header: string): Promise<SecondaryPageEntry | null> => {
    const [page] = await getEntriesByType<SecondaryPageFields>(SECONDARY_PAGE_CONTENT_TYPE, {
      query: { "fields.header": header, limit: 1 },
    });
    return page ?? null;
  },
);
