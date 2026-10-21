import type { ReactNode } from "react";
import { SectionHeader, type SectionCopy } from "@/components/section-header";
import { getRules } from "@/lib/rules";
import type { RuleEntry } from "@/models";
import { RuleCard } from "./rule-card";

type RulesSectionProps = {
  /** Section heading copy from Contentful. Without it the section falls back to an aria-label. */
  copy?: SectionCopy | null;
  /** Short tags shown under the heading, e.g. "Invite Only". */
  tags?: string[];
  headingId?: string;
  /**
   * `panel` (home, Figma 210:97): raised panel inside the section.
   * `plain` (Rules page, Figma 262:147): surface-colored section, cards straight on it.
   */
  variant?: "panel" | "plain";
  /** Extra blocks after the grid, inside the same section (e.g. the Rules page CTA). */
  children?: ReactNode;
};

/**
 * The Rules Section (Figma 210:97): heading, tag chips and a grid of rule cards.
 * Async Server Component that fetches the `rules` entries itself; the page passes the copy.
 */
export async function RulesSection({
  copy,
  tags = [],
  headingId = "rules-heading",
  variant = "panel",
  children,
}: RulesSectionProps) {
  let rules: RuleEntry[] = [];
  let failed = false;
  try {
    rules = await getRules();
  } catch (error) {
    console.error("[rules] Could not load rules from Contentful:", error);
    failed = true;
  }
  if (!failed && rules.length === 0 && !copy) return null;

  const content = (
    <div className="flex flex-col gap-8">
      {copy && <SectionHeader copy={copy} headingId={headingId} />}

      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-pill border border-line bg-bg px-4 py-2 text-kicker font-bold uppercase text-accent"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {failed ? (
        <p className="text-body text-muted">{`We couldn't load the rules. Please try again later.`}</p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <li key={rule.id}>
              <RuleCard rule={rule} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <section
      aria-labelledby={copy ? headingId : undefined}
      aria-label={copy ? undefined : "The rules"}
      className={
        variant === "plain"
          ? "border-t border-line bg-surface py-14 md:pb-30 md:pt-20"
          : "border-t border-line py-14 md:py-20"
      }
    >
      <div className="container flex flex-col gap-14">
        {variant === "plain" ? (
          content
        ) : (
          <div className="rounded-panel border border-line bg-surface p-6 shadow-cta md:p-10">
            {content}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
