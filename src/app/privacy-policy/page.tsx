import type { Metadata } from "next";
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
    <main className="container py-14 md:py-20 lg:py-30">
      <article className="mx-auto flex max-w-legal flex-col gap-10">
        <header className="flex flex-col gap-4 border-b border-line pb-10">
          <p className="text-kicker font-bold uppercase text-accent">{page.subheader}</p>
          <h1 className="font-display text-section text-text">{page.header}</h1>
          <p className="text-utility text-muted">Last updated {page.lastUpdatedDate}</p>
        </header>
        <LegalRichText document={page.pageBody} />
      </article>
    </main>
  );
}
