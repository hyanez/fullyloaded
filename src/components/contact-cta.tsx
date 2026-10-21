import { CONTACT_EMAIL } from "@/lib/site-links";

/**
 * "Still have questions?" contact section (Figma 404:583, mobile 416:983): centered heading,
 * description, a Contact Us mailto button and the address itself (so it's readable and
 * copyable without a mail app). Copy comes from the page entry's `actionSection*` fields.
 */
export function ContactCta({
  heading,
  description,
  buttonLabel,
  headingId = "contact-heading",
}: {
  heading: string;
  description?: string;
  buttonLabel: string;
  headingId?: string;
}) {
  return (
    <section aria-labelledby={headingId} className="py-14 md:py-20 lg:py-30">
      <div className="container flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <h2 id={headingId} className="font-display text-section text-text">
            {heading}
          </h2>
          {description && <p className="max-w-legal text-body text-muted">{description}</p>}
        </div>
        {/* Guide primary pill; mailto link (it opens mail, so it's a link, not a button). */}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex min-h-14 w-full items-center justify-center rounded-pill border border-action-aa bg-action-aa px-8 text-utility font-bold uppercase text-text hover:border-accent-emphasis hover:bg-surface hover:underline md:w-auto"
        >
          {buttonLabel}
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-small text-muted underline hover:text-text">
          {CONTACT_EMAIL}
        </a>
      </div>
    </section>
  );
}
