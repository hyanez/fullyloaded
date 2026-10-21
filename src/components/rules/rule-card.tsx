import Image from "next/image";
import type { RuleEntry } from "@/models";

/**
 * Rule card (Figma "Rule Card" 210:105): red icon circle, title, description.
 * Guide recipe: 20px glyph in a 48px red circle.
 */
export function RuleCard({ rule }: { rule: RuleEntry }) {
  const file = rule.icon?.fields?.file;
  const iconUrl = typeof file?.url === "string" ? `https:${file.url}` : null;

  return (
    <article className="flex h-full flex-col gap-4 rounded-panel border border-line bg-bg p-6 md:p-8">
      {/* Fixed 48px, shrink-0 + aspect-square: the circle stays 1:1 whatever the layout or icon.
          Renders empty until the rule has an icon in Contentful. */}
      <div
        aria-hidden="true"
        className="flex aspect-square size-12 shrink-0 items-center self-start justify-center overflow-hidden rounded-pill bg-accent"
      >
        {iconUrl && (
          // Decorative: the title carries the meaning. object-contain keeps the glyph's own ratio.
          <Image
            src={iconUrl}
            alt=""
            width={20}
            height={20}
            unoptimized={file?.contentType === "image/svg+xml"}
            className="size-5 object-contain"
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-card text-text">{rule.title}</h3>
        {rule.description && (
          <p className="whitespace-pre-line text-small text-muted">{rule.description}</p>
        )}
      </div>
    </article>
  );
}
