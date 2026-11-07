import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPageByHeader, heroImageUrl, HOME_PAGE_HEADER } from "@/lib/pages";
import { safeNextPath } from "@/lib/age-gate";
import { confirmAge } from "./actions";

export const metadata: Metadata = {
  title: "Age Verification",
  robots: { index: false },
};

// Where visitors go if they are under 18 or don't want to enter.
const LEAVE_URL = "https://www.google.com";

// Pill buttons: min-h 56, Inter 700 13px uppercase. Hover = surface fill + 40% red border + underline.
const buttonBase =
  "flex min-h-14 flex-1 items-center justify-center rounded-pill border px-8 text-utility font-bold uppercase hover:border-accent-emphasis hover:bg-surface hover:underline";

/**
 * Age gate (Figma "age-verification" 404:860): backdrop photo at 15%, centered stage glow and
 * the verification card. `src/proxy.ts` sends unverified visitors here with `?next=`; the
 * "I am 18+" form sets the age cookie and continues there. Works without JavaScript.
 *
 * Deviations from the Figma frame (guide wins):
 * - The "I accept cookies and the privacy policy" checkbox is left out: consent is never
 *   preselected and never bundled with age confirmation, and the only cookie is strictly
 *   necessary. A note links the Terms and Privacy Policy instead.
 * - "Leave" is full opacity (60% reads as disabled) with a muted control boundary; "I am 18+"
 *   is ivory on `action-aa` (ivory on accent fails AA); both are 56px tall at the guide's
 *   button type, stacked below 768px.
 * - Body copy is `text-small` (Figma 14px); the note and footer use `text-muted` instead of
 *   `low`, which is never used for legal text. Card gap 32px (Figma 28px, off the scale);
 *   card shadow is `shadow-panel`. The glow uses the guide's 40% red (Figma 14%).
 * - The backdrop is the Home Page hero photo from Contentful (same image as the frame).
 *
 * TODO: copy is hardcoded from Figma (plus the cookie sentence); confirm it with the owner and
 * move it to Contentful.
 */
export default async function AgeVerificationPage({ searchParams }: PageProps<"/age-verification">) {
  const next = safeNextPath((await searchParams).next);

  let backdrop: string | null = null;
  try {
    backdrop = heroImageUrl(await getPageByHeader(HOME_PAGE_HEADER));
  } catch (error) {
    console.error("[age-verification] Could not load the backdrop from Contentful:", error);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      {backdrop && (
        <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover opacity-15" />
      )}
      <Image
        src="/brand/stage-glow-age.svg"
        alt=""
        width={800}
        height={800}
        className="pointer-events-none absolute left-1/2 top-1/2 w-200 max-w-none -translate-x-1/2 -translate-y-1/2"
      />

      <main className="relative flex flex-1 items-center justify-center px-5 py-14">
        <div className="flex w-full max-w-modal flex-col items-center gap-6 rounded-modal border border-line-accent bg-modal p-6 text-center shadow-panel md:gap-8 md:p-12">
          <Image
            src="/brand/fully-loaded-wordmark.png"
            alt="Fully Loaded"
            width={1000}
            height={289}
            sizes="180px"
            priority
            className="h-auto w-45"
          />
          <span aria-hidden="true" className="h-0.5 w-12 rounded-pill bg-accent" />

          <div className="flex flex-col gap-3">
            <h1 className="font-display text-title text-balance text-text">Are you 18 or older?</h1>
            <p className="text-small text-muted">
              This website contains adult content. By entering, you confirm that you are at least 18
              years of age.
            </p>
          </div>

          <form action={confirmAge} className="flex w-full flex-col-reverse gap-4 md:flex-row">
            <input type="hidden" name="next" value={next} />
            <a href={LEAVE_URL} className={`${buttonBase} border-muted text-text`}>
              Leave
            </a>
            <button type="submit" className={`${buttonBase} border-action-aa bg-action-aa text-text`}>
              I am 18+
            </button>
          </form>

          <p className="text-utility text-muted">
            By entering you agree to our{" "}
            <Link href="/terms-of-service" className="text-text underline hover:text-muted">
              Terms of Service
            </Link>
            . We store one cookie to remember your answer; see our{" "}
            <Link href="/privacy-policy" className="text-text underline hover:text-muted">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="container relative flex flex-col items-center gap-2 pb-8 text-utility text-muted md:flex-row md:justify-between">
        <p>© 2026 Fully Loaded. All rights reserved.</p>
        <p>Respect • Discretion • Music</p>
      </footer>
    </div>
  );
}
