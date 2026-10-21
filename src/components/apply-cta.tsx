import Link from "next/link";
import { signUpLink } from "@/lib/site-links";
import { SectionHeader, type SectionCopy } from "./section-header";

/**
 * Application CTA (Figma 230:89 / 262:202): panel with kicker, heading, description and a link
 * to the Apply page. Copy comes from Contentful (the page entry's `actionSection*` fields).
 */
export function ApplyCta({
  copy,
  buttonLabel,
  headingId = "apply-cta-heading",
  variant = "section",
}: {
  copy: SectionCopy;
  buttonLabel: string;
  headingId?: string;
  /**
   * `section` (home, Figma 230:89): its own page section with a raised surface panel.
   * `inline` (Rules, Figma 262:202): just the panel, on bg, for use inside another section.
   */
  variant?: "section" | "inline";
}) {
  const panel = (
    <div
      className={`flex flex-col gap-8 rounded-panel border border-line p-6 md:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 ${
        variant === "inline" ? "bg-bg" : "bg-surface shadow-cta"
      }`}
    >
      <div className="max-w-legal">
        <SectionHeader
          copy={copy}
          headingId={headingId}
          size={variant === "inline" ? "title" : "section"}
        />
      </div>
      {/* Guide primary pill (action-aa: ivory on accent fails AA for 16px text). */}
      <Link
        href={signUpLink.href}
        className="flex min-h-14 w-full shrink-0 items-center justify-center rounded-pill border border-action-aa bg-action-aa px-8 font-body text-utility font-bold uppercase text-text hover:border-accent-emphasis hover:bg-surface hover:underline md:w-auto md:self-start lg:self-auto"
      >
        {buttonLabel}
      </Link>
    </div>
  );

  if (variant === "inline") {
    return <section aria-labelledby={headingId}>{panel}</section>;
  }
  return (
    <section aria-labelledby={headingId} className="border-t border-line py-14 md:py-20">
      <div className="container">{panel}</div>
    </section>
  );
}
