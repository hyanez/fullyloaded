import {
  type ApplyField,
  type ApplyResponse,
  dobToIso,
  UNDERAGE_MESSAGE,
  validateConsent,
  validateDob,
  validateEmail,
  validateEvent,
  validateName,
  validatePhotos,
} from "@/lib/apply-validation";
import { dayKey, getUpcomingEvents } from "@/lib/events";

// POST /api/apply — re-checks an application, then hands it to the Google Apps Script web app
// (apps-script/Code.gs), which saves the photos to Drive, appends a row to the event's tab in the
// master Sheet and returns { ok, submissionId } or { ok: false, error, message, field }.
// Going through here keeps the script's shared secret off the client and avoids Apps Script's
// lack of CORS preflight support.
export const dynamic = "force-dynamic";
// Drive uploads for five photos can take a while; give the upstream call room to finish.
export const maxDuration = 60;

const UPSTREAM_TIMEOUT_MS = 55_000;
const RETRY_MESSAGE = "Something went wrong sending your application.";

// Script error codes that point at something the applicant can fix, and the form field they belong to.
const SCRIPT_FIELD_ERRORS: Record<string, ApplyField> = {
  INVALID_NAME: "name",
  INVALID_EMAIL: "email",
  INVALID_DOB: "dob",
  UNDERAGE: "dob",
  INVALID_EVENT: "event",
  WAIVER_REQUIRED: "consent",
  INVALID_PHOTOS: "photos",
  INVALID_PHOTO_TYPE: "photos",
  INVALID_PHOTO: "photos",
  PHOTO_TOO_LARGE: "photos",
};

type ScriptResult = { ok?: boolean; submissionId?: string; error?: string; message?: string };

function reply(status: number, body: ApplyResponse) {
  return Response.json(body, { status });
}

function fail(status: number, error: string, message: string, field?: ApplyField) {
  return reply(status, { ok: false, error, message, ...(field ? { field } : {}) });
}

/** The time the box was ticked, if the browser's value is plausible; otherwise now. */
function waiverTime(raw: string, now: Date): string {
  const time = Date.parse(raw);
  const plausible = Number.isFinite(time) && time <= now.getTime() + 5 * 60_000 && time >= now.getTime() - 86_400_000;
  return new Date(plausible ? time : now.getTime()).toISOString();
}

export async function POST(request: Request) {
  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!scriptUrl || !secret) {
    console.error("[api/apply] APPS_SCRIPT_URL or APPS_SCRIPT_SECRET is not set.");
    return fail(503, "SERVER_ERROR", "Applications are not available right now.");
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return fail(400, "BAD_REQUEST", "Invalid form data.");
  }

  const text = (key: string) => String(data.get(key) ?? "").trim();

  // Honeypot: people never see the "fl_hp" field, so anything in it is a bot. Pretend it worked.
  // (Named so autofill ignores it; the script's own `website` check gets "" below.)
  if (text("fl_hp")) return reply(200, { ok: true });

  const name = text("name");
  const email = text("email");
  const dob = text("dob");
  const eventId = text("event");
  const consent = data.get("consent") === "on";
  const photos = data.getAll("photos").filter((value): value is File => value instanceof File);

  const dobProblem = validateDob(dob);
  const checks: [ApplyField, string, string | undefined][] = [
    ["name", "INVALID_NAME", validateName(name)],
    ["email", "INVALID_EMAIL", validateEmail(email)],
    ["dob", dobProblem === UNDERAGE_MESSAGE ? "UNDERAGE" : "INVALID_DOB", dobProblem],
    ["event", "INVALID_EVENT", validateEvent(eventId)],
    ["photos", "INVALID_PHOTOS", validatePhotos(photos)],
    ["consent", "WAIVER_REQUIRED", validateConsent(consent)],
  ];
  const problem = checks.find(([, , message]) => message);
  if (problem) return fail(400, problem[1], problem[2]!, problem[0]);

  // Only accept events that are actually open. The date (with year) keeps tabs and folders unique,
  // since event names repeat every year.
  let event;
  try {
    event = (await getUpcomingEvents()).find((e) => e.uniqueId === eventId);
  } catch (error) {
    console.error("[api/apply] Could not load events from Contentful:", error);
    return fail(503, "BUSY", RETRY_MESSAGE);
  }
  if (!event) return fail(400, "INVALID_EVENT", "That event is no longer open for applications.", "event");

  const now = new Date();
  const payload = {
    secret,
    website: "",
    name,
    email,
    dob: dobToIso(dob),
    event: { id: event.uniqueId, name: event.title ?? event.uniqueId, date: dayKey(event.date) },
    waiverAccepted: true,
    waiverAcceptedAt: waiverTime(text("waiverAcceptedAt"), now),
    photos: await Promise.all(
      photos.map(async (file) => ({
        mimeType: file.type,
        data: Buffer.from(await file.arrayBuffer()).toString("base64"),
      })),
    ),
  };

  let result: ScriptResult | null;
  try {
    // text/plain keeps Apps Script from needing a preflight. /exec answers with a redirect to the
    // response body; fetch follows it.
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    result = (await response.json().catch(() => null)) as ScriptResult | null;
    if (!result) throw new Error(`Apps Script responded ${response.status} without JSON`);
  } catch (error) {
    console.error("[api/apply] Could not reach Apps Script:", error);
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return fail(timedOut ? 504 : 502, "NETWORK_ERROR", RETRY_MESSAGE);
  }

  if (result.ok) return reply(200, { ok: true, submissionId: result.submissionId });

  // Apps Script always answers 200; turn its error code into a real status. Only field problems
  // pass the script's message through; anything else (UNAUTHORIZED included) stays generic.
  const code = result.error ?? "SERVER_ERROR";
  const field = SCRIPT_FIELD_ERRORS[code];
  if (field) return fail(400, code, result.message || "Please check this field and try again.", field);
  console.error("[api/apply] Apps Script rejected the application:", code, result.message);
  if (code === "BUSY") return fail(503, "BUSY", RETRY_MESSAGE);
  return fail(500, "SERVER_ERROR", RETRY_MESSAGE);
}
