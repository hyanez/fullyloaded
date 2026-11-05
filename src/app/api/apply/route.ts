import {
  MAX_UPLOAD_IMAGE_BYTES,
  validateConsent,
  validateDob,
  validateEmail,
  validateEvent,
  validateName,
  validatePhotos,
} from "@/lib/apply-validation";
import { formatEventDate, getUpcomingEvents } from "@/lib/events";

// POST /api/apply — re-checks an application, then hands it to the Google Apps Script web app
// (apps-script/Code.gs), which saves the photos to Drive and appends a row to the Sheet.
// Going through here keeps the script's shared secret off the client and avoids Apps Script's
// lack of CORS preflight support.
export const dynamic = "force-dynamic";

function fail(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!scriptUrl || !secret) {
    console.error("[api/apply] APPS_SCRIPT_URL or APPS_SCRIPT_SECRET is not set.");
    return fail(503, "Applications are not available right now.");
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return fail(400, "Invalid form data.");
  }

  const text = (key: string) => String(data.get(key) ?? "").trim();
  const name = text("name");
  const email = text("email");
  const dob = text("dob");
  const eventId = text("event");
  const photos = data.getAll("photos").filter((value): value is File => value instanceof File);

  const problem =
    validateName(name) ??
    validateEmail(email) ??
    validateDob(dob) ??
    validateEvent(eventId) ??
    validatePhotos(photos, MAX_UPLOAD_IMAGE_BYTES) ??
    validateConsent(data.get("consent") === "on");
  if (problem) return fail(400, problem);

  // Only accept events that are actually open, and record a readable name in the sheet.
  const event = (await getUpcomingEvents()).find((e) => e.uniqueId === eventId);
  if (!event) return fail(400, "That event is no longer open for applications.");

  const payload = {
    secret,
    submittedAt: new Date().toISOString(),
    name,
    email,
    dob,
    eventId,
    eventLabel: `${event.title ?? event.uniqueId} — ${formatEventDate(event.date)}`,
    photos: await Promise.all(
      photos.map(async (file, index) => ({
        name: `photo-${index + 1}.jpg`,
        mimeType: file.type,
        data: Buffer.from(await file.arrayBuffer()).toString("base64"),
      })),
    ),
  };

  try {
    // Apps Script answers /exec with a redirect to the response body; fetch follows it.
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !result?.ok) {
      throw new Error(result?.error ?? `Apps Script responded ${response.status}`);
    }
  } catch (error) {
    console.error("[api/apply] Could not save application:", error);
    return fail(502, "We couldn't save your application.");
  }

  return Response.json({ ok: true });
}
