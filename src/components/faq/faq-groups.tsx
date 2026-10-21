import type { FaqGroup } from "@/lib/faqs";
import { FaqItem } from "./faq-item";

/**
 * FAQ sections (Figma 404:474): one labelled group per question type, each a stack of
 * accordion items at the guide's 920px FAQ reading width. The very first question starts open.
 */
export function FaqGroups({ groups, failed }: { groups: FaqGroup[]; failed: boolean }) {
  return (
    <section aria-label="Frequently asked questions" className="border-y border-line bg-surface py-14 md:py-20">
      <div className="container flex flex-col gap-14 md:gap-20">
        {failed && (
          <p className="text-body text-muted">{`We couldn't load the questions. Please try again later.`}</p>
        )}
        {groups.map((group, groupIndex) => {
          const headingId = `faq-group-${groupIndex}`;
          return (
            <section key={group.label} aria-labelledby={headingId} className="flex flex-col gap-6 md:gap-8">
              <h2
                id={headingId}
                className="flex items-center gap-3 text-kicker font-bold uppercase text-accent"
              >
                <span aria-hidden="true" className="h-0.75 w-11 bg-accent" />
                {group.label}
              </h2>
              <ul className="flex max-w-faq flex-col gap-4">
                {group.items.map((item, index) => (
                  <li key={item.id}>
                    <FaqItem item={item} defaultOpen={groupIndex === 0 && index === 0} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
