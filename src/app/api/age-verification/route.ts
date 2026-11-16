import { NextResponse } from "next/server";
import { AGE_COOKIE, AGE_COOKIE_MAX_AGE, AGE_COOKIE_VALUE, safeNextPath } from "@/lib/age-gate";

// POST /api/age-verification — the "I am 18+" form posts here as a plain HTML form. Sets the age
// cookie and answers with a 303 to the page the visitor asked for, so the browser stores the
// cookie and then does a full page load that `src/proxy.ts` sees as verified. Lives under /api
// so the proxy never intercepts the POST itself. Works without JavaScript.
export async function POST(request: Request) {
  let next = "/";
  try {
    next = safeNextPath((await request.formData()).get("next"));
  } catch {
    // Malformed body: still verify, just go home.
  }

  // Relative Location: the browser resolves it against the public URL, whatever host it is behind.
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: next, "Cache-Control": "no-store" },
  });
  response.cookies.set(AGE_COOKIE, AGE_COOKIE_VALUE, {
    maxAge: AGE_COOKIE_MAX_AGE,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
