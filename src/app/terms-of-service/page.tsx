import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LegalRichText } from "@/components/rich-text/legal-rich-text";
import { getSecondaryPage, SECONDARY_PAGE_HEADERS } from "@/lib/secondary-pages";

// Refresh the terms from Contentful at most every 5 minutes. If a refresh fails, Next keeps
// serving the last good version.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSecondaryPage(SECONDARY_PAGE_HEADERS.termsOfService);
  return {
    // The Contentful header is all caps; keep the tab title readable.
    title: "Terms of Service",
    description: page?.pageDescription,
    alternates: { canonical: "/terms-of-service" },
    // Keep out of search until the terms copy in Contentful is final and owner-approved.
    robots: { index: false },
  };
}

export default async function TermsOfServicePage() {
  const page = await getSecondaryPage(SECONDARY_PAGE_HEADERS.termsOfService);
  if (!page) notFound();

  return (
    // Figma 425:799 (desktop): centered hero over a stage glow, then the terms on a surface panel.
    <main>
      <article>
        <header className="relative overflow-hidden py-14 md:py-20">
          {/* Stage glow (Figma 425:809): 800×400, centered, 150px above the hero; decorative. */}
          <Image
            src="/brand/stage-glow-legal.svg"
            alt=""
            width={800}
            height={400}
            className="pointer-events-none absolute left-1/2 top-0 max-w-none -translate-x-1/2 -translate-y-3/8"
          />
          <div className="container relative">
            <div className="mx-auto flex max-w-legal flex-col items-center gap-4 text-center">
              <p className="flex items-center gap-3 text-kicker font-bold uppercase text-accent">
                <span aria-hidden="true" className="h-0.75 w-11 bg-accent" />
                {page.subheader}
              </p>
              <h1 className="break-words font-display text-hero-terms uppercase text-text">
                {page.header}
              </h1>
              <p className="text-prose text-muted">Last updated: {page.lastUpdatedDate}</p>
            </div>
          </div>
        </header>
        <div className="border-y border-line bg-surface pb-14 pt-10 md:pb-20">
          <div className="container">
            <div className="mx-auto max-w-legal">
              <LegalRichText document={page.pageBody} variant="ruled" />
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
