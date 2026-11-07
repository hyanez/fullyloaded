import { NextResponse, type NextRequest } from "next/server";
import {
  AGE_COOKIE,
  AGE_COOKIE_VALUE,
  AGE_GATE_PATH,
  AGE_GATE_PUBLIC_PATHS,
  safeNextPath,
} from "@/lib/age-gate";

/**
 * Age gate: page requests without the age cookie are redirected to /age-verification, which
 * sends the visitor back to `next` once they confirm. Runs before rendering, so gated content
 * never flashes. Verified visitors who open the gate go straight on.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const verified = request.cookies.get(AGE_COOKIE)?.value === AGE_COOKIE_VALUE;

  if (pathname === AGE_GATE_PATH) {
    if (!verified) return NextResponse.next();
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (verified || AGE_GATE_PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const gate = new URL(AGE_GATE_PATH, request.url);
  if (pathname !== "/") gate.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(gate);
}

export const config = {
  // Pages only: skip API routes, Next internals and any file in public/ (has an extension).
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)"],
};
