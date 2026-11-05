import { ApplyCta } from "@/components/apply-cta";
import { EventCalendar } from "@/components/events/event-calendar";
import { EventsTicker } from "@/components/events/events-ticker";
import { HomeHero } from "@/components/home-hero";
import { RulesSection } from "@/components/rules/rules-section";
import { getPageByHeader, HOME_PAGE_HEADER } from "@/lib/pages";
import { richTextParagraphs, splitBulletList } from "@/lib/text";
import type { PageEntry } from "@/models";

// TODO: landing page scaffold. Sections mirror Figma "Landing Page" (node 99:3) and are
// empty placeholders: fill each from its Figma node, give each a heading, then add a page
// description + canonical for SEO. Keep `data-nav-hero` on the hero (the navbar watches it).
// The hero is a temporary 3/4-viewport height; the dividers are only there to see the sections.

// Refresh the page copy and calendar from Contentful at most every 5 minutes.
//
// TODO: needs to check in with this timing, could over fetch from contentful. cache feature?
export const revalidate = 300;

export default async function Home() {
  // Section copy lives on the "Home Page" `page` entry. If it can't be loaded, sections that
  // need it are left out rather than showing hardcoded copy.
  let page: PageEntry | null = null;
  try {
    page = await getPageByHeader(HOME_PAGE_HEADER);
    if (!page) console.error(`[home] No Contentful page entry with header "${HOME_PAGE_HEADER}".`);
  } catch (error) {
    console.error("[home] Could not load the Home Page entry from Contentful:", error);
  }
  const {
    sectionOneHeader,
    sectionOneSubhead,
    sectionOneDescription,
    sectionTwoHeader,
    sectionTwoSubhead,
    sectionTwoDescription,
    actionSectionSubhead,
    actionSectionHeader,
    actionSectionDescription,
    actionSectionButton,
  } = page ?? ({} as PageEntry);
  
  // The rules description ends with a "- " list that renders as tag chips.
  const rulesIntro = splitBulletList(sectionTwoDescription);

  return (
    <main>
      {/* Upcoming Events Ticker — Figma 302:352 */}
      <EventsTicker />

      {/* Hero / Upcoming Events — Figma 207:116 */}
      {/* TODO: UpNext Carousel (171:192) and Scroll cue (231:118) go inside the hero as children. */}
      <HomeHero lead={page ? richTextParagraphs(page.description) : []} />

      {/* Calendar Module — Figma 204:116 */}
      <EventCalendar
        copy={
              sectionOneHeader
            ? {
                kicker: sectionOneSubhead,
                heading: sectionOneHeader,
                description: sectionOneDescription,
              }
            : null
        }
      />

      {/* The Rules Section — Figma 210:97 */}
      <RulesSection
        copy={
              sectionTwoHeader
            ? {
                kicker: sectionTwoSubhead,
                heading: sectionTwoHeader,
                description: rulesIntro.text,
              }
            : null
        }
        tags={rulesIntro.items}
      />

      {/* Application CTA Module — Figma 230:89 */}
      {page && (
        <ApplyCta
          copy={{
            kicker: actionSectionSubhead,
            heading: actionSectionHeader,
            description: actionSectionDescription,
          }}
          buttonLabel={actionSectionButton}
        />
      )}
    </main>
  );
}
