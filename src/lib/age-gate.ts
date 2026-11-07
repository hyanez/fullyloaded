// Age gate shared by `src/proxy.ts` and the /age-verification page. Plain module: no
// server-only imports, so the proxy can use it.

export const AGE_GATE_PATH = "/age-verification";

/**
 * Set once a visitor confirms they are 18+. Strictly necessary (it only remembers that answer),
 * so it needs no cookie consent; it must still be listed in the Privacy Policy.
 */
export const AGE_COOKIE = "fl_age_verified";
export const AGE_COOKIE_VALUE = "1";
export const AGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

/** Readable without verifying, so visitors can see what they agree to before entering. */
export const AGE_GATE_PUBLIC_PATHS = ["/privacy-policy", "/terms-of-service"];

/**
 * Where to send the visitor after verifying: the `next` path they were stopped at. Only
 * same-site paths are allowed ("/events", not "//evil.com" or "https://…"), so the gate can't
 * be used as an open redirect.
 */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value === AGE_GATE_PATH || value.startsWith(`${AGE_GATE_PATH}?`)) return "/";
  return value;
}
