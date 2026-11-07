import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LegalRichText } from "@/components/rich-text/legal-rich-text";
import { getSecondaryPage, SECONDARY_PAGE_HEADERS } from "@/lib/secondary-pages";

// Refresh the waiver from Contentful at most every 5 minutes. If a refresh fails, Next keeps
// serving the last good version.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSecondaryPage(SECONDARY_PAGE_HEADERS.waiver);
  return {
    title: page?.header ?? "Waiver",
    description: page?.pageDescription,
    alternates: { canonical: "/waiver" },
    // Keep out of search until the waiver copy in Contentful is final and owner-approved.
    robots: { index: false },
  };
}

export default async function WaiverPage() {
  const page = await getSecondaryPage(SECONDARY_PAGE_HEADERS.waiver);
  if (!page) notFound();

  return (
    // Figma 425:703 (desktop): left-aligned hero over a stage glow, then the waiver in one column.
    <main>
      <article>
        <header className="relative overflow-hidden pb-10 pt-14 md:pb-30 md:pt-20">
          {/* Stage glow (Figma 425:716): 800×500, centered, 150px above the hero; decorative. */}
          <Image
            src="/brand/stage-glow-waiver.svg"
            alt=""
            width={800}
            height={500}
            className="pointer-events-none absolute left-1/2 top-0 max-w-none -translate-x-1/2 -translate-y-3/10"
          />
          <div className="container relative">
            <div className="mx-auto flex max-w-legal flex-col gap-3">
              <p className="flex items-center gap-3 text-kicker font-bold uppercase text-accent">
                <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
                {page.subheader}
              </p>
              <h1 className="break-words font-display text-hero-waiver uppercase text-text">
                {page.header}
              </h1>
              <p className="text-prose text-muted">Last updated: {page.lastUpdatedDate}</p>
            </div>
          </div>
        </header>
        <div className="container pb-14 pt-10 md:pb-20">
          <div className="mx-auto max-w-legal">
            <LegalRichText document={page.pageBody} variant="numbered" />
          </div>
        </div>
      </article>
    </main>
  );
}
