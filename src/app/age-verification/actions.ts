"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AGE_COOKIE, AGE_COOKIE_MAX_AGE, AGE_COOKIE_VALUE, safeNextPath } from "@/lib/age-gate";

/** "I am 18+": remember the answer for 30 days, then continue to the page the visitor asked for. */
export async function confirmAge(formData: FormData) {
  (await cookies()).set(AGE_COOKIE, AGE_COOKIE_VALUE, {
    maxAge: AGE_COOKIE_MAX_AGE,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect(safeNextPath(formData.get("next")));
}
