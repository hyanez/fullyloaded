import type { Metadata } from "next";
import Link from "next/link";

// Next injects `noindex` for 404s; only the title is needed here.
export const metadata: Metadata = {
  title: "Page not found",
};

// Copy lives in the app (not Contentful) so the 404 still works if Contentful is down.
// Pill buttons: min-h 56, Inter 700 uppercase. Hover = surface fill + 40% red border + underline.
const buttonBase =
  "flex min-h-14 w-full items-center justify-center rounded-pill border px-8 font-body text-utility font-bold uppercase hover:bg-surface hover:border-accent-emphasis hover:underline md:w-auto";

export default function NotFound() {
  return (
    <main className="container flex flex-col items-center gap-12 py-16 md:gap-16 md:py-30">
      <section className="flex flex-col items-center gap-6 text-center md:gap-8">
        <p className="flex items-center gap-3 text-kicker font-bold uppercase text-accent">
          <span aria-hidden="true" className="h-0.75 w-11 bg-accent" />
          404
        </p>
        <h1 className="font-display text-hero-404 text-text">Page Not Found</h1>
        <p className="max-w-modal text-pretty text-body text-muted">
          This page may have moved, no longer exists, or the URL may be mistyped.
          Check the address or head back to the main floor.
        </p>
      </section>

      <nav aria-label="Recovery options" className="w-full md:w-auto">
        <ul className="flex flex-col gap-3 md:flex-row md:gap-6">
          <li>
            <Link
              href="/"
              className={`${buttonBase} border-action-aa bg-action-aa text-text`}
            >
              Back to Home
            </Link>
          </li>
          <li>
            <Link
              href="/events"
              className={`${buttonBase} border-muted bg-bg text-text`}
            >
              View Events
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex flex-col items-center gap-6">
        <span aria-hidden="true" className="h-0.75 w-20 bg-accent" />
        <p className="text-utility font-semibold uppercase text-muted">
          Lost in the crowd?
        </p>
      </div>
    </main>
  );
}
