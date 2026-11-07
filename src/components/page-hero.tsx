import Image from "next/image";
import Link from "next/link";

type PageHeroProps = {
  title: string;
  /** Lead paragraphs under the title. */
  lead?: string[];
  action?: { label: string; href: string };
  /**
   * Background photo (the page entry's `heroImage` in Contentful). Decorative; UI text is never
   * baked into it. Omitted when missing: the scrim and glow still render over the page color.
   */
  imageSrc?: string | null;
  /**
   * `events` (Events/Rules, Figma 252:172): full photo, left→right scrim, `text-hero-events`.
   * `faq` (Figma 404:464): photo at 35%, diagonal scrim, centered glow, `text-hero-faq`.
   */
  variant?: "events" | "faq";
};

/**
 * Photo hero for inner pages (Figma "Hero / Events Apply" 252:172, mobile 416:578; FAQ 404:464).
 * Guide recipe: scrim #0D0505 96% → 61% @52% → 18% (left→right; top→bottom on mobile),
 * stage glow #FF003C 40% → transparent, `text-hero-events` title.
 */
export function PageHero({ title, lead = [], action, imageSrc, variant = "events" }: PageHeroProps) {
  const faq = variant === "faq";
  return (
    <section className="relative overflow-hidden">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-cover ${faq ? "opacity-35" : ""}`}
        />
      )}
      <div
        aria-hidden="true"
        className={
          faq
            ? "absolute inset-0 bg-linear-to-tr from-bg from-25% via-bg/80 via-55% to-bg/47 to-75%"
            : "absolute inset-0 bg-linear-to-b from-bg/99 via-bg/80 via-60% to-bg/54 md:bg-linear-to-r md:from-bg/96 md:via-bg/61 md:via-52% md:to-bg/18"
        }
      />
      {faq ? (
        <Image
          src="/brand/stage-glow-faq.svg"
          alt=""
          width={800}
          height={600}
          className="pointer-events-none absolute -top-25 left-1/2 w-200 max-w-none -translate-x-1/2"
        />
      ) : (
        <Image
          src="/brand/stage-glow-hero.svg"
          alt=""
          width={1045}
          height={1045}
          className="pointer-events-none absolute -right-25 top-5 w-75 md:-right-48 md:top-12 md:w-260"
        />
      )}

      <div
        className={`container relative flex flex-col gap-10 py-14 md:gap-20 md:py-20 ${faq ? "lg:pb-20 lg:pt-30" : "lg:py-30"}`}
      >
        <div className="flex flex-col gap-4 md:gap-5">
          <h1
            className={`max-w-legal font-display uppercase text-text ${
              faq ? "text-hero-faq" : "text-hero-events text-shadow-hero"
            }`}
          >
            {title}
          </h1>
          {lead.map((paragraph) => (
            <p
              key={paragraph}
              className={`max-w-modal text-body md:text-lead ${faq ? "text-muted" : "text-text"}`}
            >
              {paragraph}
            </p>
          ))}
        </div>
        {action && <HeroActionLink action={action} />}
      </div>
    </section>
  );
}

/**
 * Hero call to action, shared with the home hero: guide primary pill (ivory on `action-aa`)
 * + 20px arrow with a 12px gap. Full width below 768px.
 */
export function HeroActionLink({ action }: { action: { label: string; href: string } }) {
  return (
    <Link
      href={action.href}
      className="flex min-h-14 w-full items-center justify-center gap-3 rounded-pill border border-action-aa bg-action-aa px-8 text-utility font-bold uppercase text-text hover:border-accent-emphasis hover:bg-surface hover:underline md:w-auto md:self-start"
    >
      {action.label}
      <Image src="/icons/arrow-right.svg" alt="" aria-hidden="true" width={20} height={20} />
    </Link>
  );
}
