import Image from "next/image";
import type { ReactNode } from "react";

type HomeHeroProps = {
  /** Lead lines under the wordmark (Home Page `description` in Contentful). */
  lead?: string[];
  /** Rendered inside the hero below the intro (UpNext carousel, scroll cue). */
  children?: ReactNode;
};

/**
 * Landing hero (Figma "Hero / Upcoming Events" 207:116): photo backdrop, guide scrim and stage
 * glow, the dripping wordmark as the page's h1, accent rule and lead copy.
 * Keeps `data-nav-hero`: the navbar hides its logo and centers its links while this is in view.
 *
 * Deviations from the Figma frame (guide wins):
 * - The stage glow is the guide's #FF003C 40% → transparent (`stage-glow-hero.svg`); Figma uses #FF0000.
 * - Lead copy is `text-text`, not #E9D8C8, and `text-lead` (22/32) instead of 22/1.45.
 * - The backdrop is cropped from the Figma fill and scaled uniformly (Figma stretches it).
 * - The wordmark renders at up to 702px wide, a size the guide doesn't list yet.
 */
export function HomeHero({ lead = [], children }: HomeHeroProps) {
  return (
    <section data-nav-hero aria-label="Hero" className="relative min-h-hero overflow-hidden">
      <Image
        src="/photos/home-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-bg/99 via-bg/80 via-60% to-bg/54 md:bg-linear-to-r md:from-bg/96 md:via-bg/61 md:via-52% md:to-bg/18"
      />
      <Image
        src="/brand/stage-glow-hero.svg"
        alt=""
        width={1045}
        height={1045}
        className="pointer-events-none absolute -right-25 top-5 w-75 md:-right-48 md:top-12 md:w-260"
      />

      <div className="container relative flex flex-col gap-10 py-14 md:pt-16">
        <h1 className="flex justify-center">
          <Image
            src="/brand/fully-loaded-wordmark.png"
            alt="Fully Loaded"
            width={702}
            height={203}
            priority
            className="h-auto"
          />
        </h1>

        {lead.length > 0 && (
          <div className="flex flex-col gap-6">
            <span aria-hidden="true" className="h-0.75 w-11 bg-accent" />
            <div className="max-w-modal text-body text-text md:text-lead">
              {lead.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
