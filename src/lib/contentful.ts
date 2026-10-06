import "server-only";
import { createClient, type ContentfulClientApi } from "contentful";

/**
 * Contentful clients for FULLYLO.
 *
 * Server-only: the access tokens never reach the browser.
 * - Delivery API (CDA): published content, used by default.
 * - Preview API (CPA): drafts + published, used when `preview` is true
 *   (e.g. inside Next.js draft mode).
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Add it to .env.local (see .env.example).`,
    );
  }
  return value;
}

let deliveryClient: ContentfulClientApi<undefined> | null = null;
let previewClient: ContentfulClientApi<undefined> | null = null;

export function getContentfulClient(preview = false): ContentfulClientApi<undefined> {
  const space = requireEnv("CONTENTFUL_SPACE_ID");
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  if (preview) {
    previewClient ??= createClient({
      space,
      environment,
      accessToken: requireEnv("CONTENTFUL_PREVIEW_ACCESS_TOKEN"),
      host: "preview.contentful.com",
    });
    return previewClient;
  }

  deliveryClient ??= createClient({
    space,
    environment,
    accessToken: requireEnv("CONTENTFUL_ACCESS_TOKEN"),
  });
  return deliveryClient;
}

/** Fetch all entries of a given content type (e.g. "event", "faq"). */
export async function getEntriesByType<T extends Record<string, unknown> = Record<string, unknown>>(
  contentType: string,
  { preview = false, query = {} }: { preview?: boolean; query?: Record<string, unknown> } = {},
) {
  const client = getContentfulClient(preview);
  const res = await client.getEntries({ content_type: contentType, include: 2, ...query });
  return res.items.map((item) => ({ id: item.sys.id, ...(item.fields as T) }));
}
