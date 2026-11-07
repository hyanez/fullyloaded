import type { Metadata } from "next";
import { ApplyCta } from "@/components/apply-cta";
import { PageHero } from "@/components/page-hero";
import { RoleRules } from "@/components/rules/role-rules";
import { RulesSection } from "@/components/rules/rules-section";
import { SectionHeader } from "@/components/section-header";
import { getPageByHeader, RULES_PAGE_HEADER, heroImageUrl } from "@/lib/pages";
import { signUpLink } from "@/lib/site-links";
import { richTextParagraphs } from "@/lib/text";
import type { PageEntry } from "@/models";

// TODO: confirm the description with the owner.
export const metadata: Metadata = {
  title: "Rules",
  description: "Know the vibe before you arrive: the Fully Loaded house rules.",
  alternates: { canonical: "/rules" },
};

// Refresh the page copy and rules from Contentful at most every 5 minutes.
export const revalidate = 300;

export default async function RulesPage() {
  // Copy lives on "The Rules" `page` entry; sections that need it are left out (rather than
  // showing hardcoded copy) if it can't be loaded.
  let page: PageEntry | null = null;
  try {
    page = await getPageByHeader(RULES_PAGE_HEADER);
    if (!page) console.error(`[rules] No Contentful page entry with header "${RULES_PAGE_HEADER}".`);
  } catch (error) {
    console.error("[rules] Could not load the Rules page entry from Contentful:", error);
  }

  return (
    <main>
      {/* Hero — Figma 388:460. The h1 falls back to the page name. */}
      <PageHero
        title={page?.header ?? "Rules"}
        lead={page ? richTextParagraphs(page.description) : []}
        action={page ? { label: page.actionSectionSubhead, href: signUpLink.href } : undefined}
        imageSrc={heroImageUrl(page)}
      />

      {/* Main content — Figma 262:147: rules grid, role expectations, apply block. */}
      <RulesSection
        variant="plain"
        collapseOnMobile
        copy={
          page?.sectionOneHeader
            ? {
                kicker: page.sectionOneSubhead,
                heading: page.sectionOneHeader,
                description: page.sectionOneDescription,
              }
            : null
        }
      >
        {/* Rules by roles — Figma 266:151: heading copy from the page, cards from role-specific rules. */}
        {page?.sectionTwoHeader && (
          <section aria-labelledby="roles-heading" className="flex flex-col gap-6">
            <SectionHeader
              headingId="roles-heading"
              copy={{
                kicker: page.sectionTwoSubhead,
                heading: page.sectionTwoHeader,
                description: page.sectionTwoDescription,
              }}
            />
            <RoleRules />
          </section>
        )}

        {/* Application CTA — Figma 262:202 */}
        {page && (
          <ApplyCta
            variant="inline"
            copy={{
              kicker: page.actionSectionSubhead,
              heading: page.actionSectionHeader,
              description: page.actionSectionDescription,
            }}
            buttonLabel={page.actionSectionButton}
          />
        )}
      </RulesSection>
    </main>
  );
}
