import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LegalRichText } from "@/components/rich-text/legal-rich-text";
import { getSecondaryPage, SECONDARY_PAGE_HEADERS } from "@/lib/secondary-pages";

// Refresh the policy from Contentful at most every 5 minutes. If a refresh fails, Next keeps
// serving the last good version.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSecondaryPage(SECONDARY_PAGE_HEADERS.privacyPolicy);
  return {
    title: page?.header ?? "Privacy Policy",
    description: page?.pageDescription,
    alternates: { canonical: "/privacy-policy" },
    // Keep out of search until the policy copy in Contentful is final and owner-approved.
    robots: { index: false },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getSecondaryPage(SECONDARY_PAGE_HEADERS.privacyPolicy);
  if (!page) notFound();

  return (
    // Figma 425:610 (desktop) / 425:964 (mobile).
    <main className="relative overflow-hidden">
      {/* Stage glow (Figma 425:965, mobile only): 300×200, centered, peeking out from under the
          navbar; decorative. */}
      <Image
        src="/brand/stage-glow-privacy.svg"
        alt=""
        width={300}
        height={200}
        className="pointer-events-none absolute left-1/2 top-0 max-w-none -translate-x-1/2 -translate-y-3/5 md:hidden"
      />
      <div className="container relative pb-16 pt-12 md:py-16">
        <article className="mx-auto flex max-w-legal flex-col gap-4">
          <header className="flex flex-col gap-4">
            <p className="flex items-center gap-3 text-kicker font-bold uppercase text-accent">
              <span aria-hidden="true" className="h-0.5 w-6 bg-accent md:h-0.75 md:w-11" />
              {page.subheader}
            </p>
            <div className="flex flex-col gap-4 md:gap-3">
              <h1 className="break-words font-display text-hero-legal uppercase text-text">
                {page.header}
              </h1>
              <p className="text-prose text-muted">Last updated: {page.lastUpdatedDate}</p>
            </div>
          </header>
          <LegalRichText document={page.pageBody} />
        </article>
      </div>
    </main>
  );
}
