import type { Metadata } from "next";
import { EventCalendar } from "@/components/events/event-calendar";
import { PageHero } from "@/components/page-hero";
import { EVENTS_PAGE_HEADER, getPageByHeader, heroImageUrl } from "@/lib/pages";
import { signUpLink } from "@/lib/site-links";
import { richTextParagraphs } from "@/lib/text";
import type { PageEntry } from "@/models";

// TODO: confirm the description with the owner.
export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming Fully Loaded nights. Every event is invite only.",
  alternates: { canonical: "/events" },
};

// Refresh the page copy and events from Contentful at most every 5 minutes.
export const revalidate = 300;

export default async function EventsPage() {
  // Copy lives on the "Upcoming Events" `page` entry; sections that need it are left out
  // (rather than showing hardcoded copy) if it can't be loaded.
  let page: PageEntry | null = null;
  try {
    page = await getPageByHeader(EVENTS_PAGE_HEADER);
    if (!page) console.error(`[events] No Contentful page entry with header "${EVENTS_PAGE_HEADER}".`);
  } catch (error) {
    console.error("[events] Could not load the Events page entry from Contentful:", error);
  }

  return (
    <main>
      {/* Hero — Figma 252:172 (desktop) / 416:578 (mobile). The h1 falls back to the page name. */}
      <PageHero
        title={page?.header ?? "Events"}
        lead={page ? richTextParagraphs(page.description) : []}
        action={page ? { label: page.actionSectionSubhead, href: signUpLink.href } : undefined}
        imageSrc={heroImageUrl(page)}
      />

      {/* Upcoming Dates — Figma 252:129 (desktop) / 416:601 (mobile) */}
      <EventCalendar
        variant="detailed"
        copy={
          page?.sectionOneHeader
            ? {
                kicker: page.sectionOneSubhead,
                heading: page.sectionOneHeader,
                description: page.sectionOneDescription,
              }
            : null
        }
      />
    </main>
  );
}
