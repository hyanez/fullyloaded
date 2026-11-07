import type { Metadata } from "next";
import { ContactCta } from "@/components/contact-cta";
import { FaqGroups } from "@/components/faq/faq-groups";
import { PageHero } from "@/components/page-hero";
import { getFaqGroups, type FaqGroup } from "@/lib/faqs";
import { FAQ_PAGE_HEADER, getPageByHeader, heroImageUrl } from "@/lib/pages";
import { richTextParagraphs } from "@/lib/text";
import type { PageEntry } from "@/models";

// TODO: confirm the description with the owner.
export const metadata: Metadata = {
  title: "FAQ",
  description: "Everything you need to know before your first Fully Loaded night.",
  alternates: { canonical: "/faq" },
};

// Refresh the page copy and questions from Contentful at most every 5 minutes.
export const revalidate = 300;

export default async function FaqPage() {
  // Copy lives on the "FAQ" `page` entry; sections that need it are left out (rather than
  // showing hardcoded copy) if it can't be loaded. Questions come from `faqs` entries.
  const [pageResult, faqResult] = await Promise.allSettled([
    getPageByHeader(FAQ_PAGE_HEADER),
    getFaqGroups(),
  ]);

  let page: PageEntry | null = null;
  if (pageResult.status === "fulfilled") {
    page = pageResult.value;
    if (!page) console.error(`[faq] No Contentful page entry with header "${FAQ_PAGE_HEADER}".`);
  } else {
    console.error("[faq] Could not load the FAQ page entry from Contentful:", pageResult.reason);
  }

  let groups: FaqGroup[] = [];
  if (faqResult.status === "fulfilled") {
    groups = faqResult.value;
  } else {
    console.error("[faq] Could not load FAQs from Contentful:", faqResult.reason);
  }

  return (
    <main>
      {/* Hero — Figma 404:464. The h1 falls back to the page name. */}
      <PageHero
        variant="faq"
        title={page?.header ?? "FAQ"}
        lead={page ? richTextParagraphs(page.description) : []}
        imageSrc={heroImageUrl(page)}
      />

      {/* FAQ sections — Figma 404:474 */}
      <FaqGroups groups={groups} failed={faqResult.status === "rejected"} />

      {/* Contact — Figma 404:583. The entry's action subhead is unused on this page. */}
      {page && (
        <ContactCta
          heading={page.actionSectionHeader}
          description={page.actionSectionDescription}
          buttonLabel={page.actionSectionButton}
        />
      )}
    </main>
  );
}
