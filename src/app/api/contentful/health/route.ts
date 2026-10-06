import { getContentfulClient } from "@/lib/contentful";

// GET /api/contentful/health — confirms the Contentful keys work.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = getContentfulClient();
    const space = await client.getSpace();
    const types = await client.getContentTypes();
    return Response.json({
      ok: true,
      space: space.name,
      environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
      contentTypes: types.items.map((t) => t.sys.id),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
