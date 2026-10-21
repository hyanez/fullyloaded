/** Copy for a section heading, as authored in Contentful (header / subhead / description). */
export type SectionCopy = {
  /** Small red label above the heading, e.g. "Calendar". */
  kicker?: string;
  heading: string;
  description?: string;
};

/**
 * Section heading block (Figma 224:91 / 230:91): accent rule + kicker, h2, description.
 * `headingId` lets the parent section use `aria-labelledby`.
 */
export function SectionHeader({
  copy,
  headingId,
  size = "section",
}: {
  copy: SectionCopy;
  headingId: string;
  /** `section` = text-section (48/52), `title` = text-title (32/36) for blocks inside a section. */
  size?: "section" | "title";
}) {
  return (
    <header className="flex flex-col gap-2 md:gap-3">
      {copy.kicker && (
        <p className="flex items-center gap-2 text-kicker font-bold uppercase text-accent md:gap-3">
          <span aria-hidden="true" className="h-0.5 w-5 rounded-pill bg-accent md:w-7" />
          {copy.kicker}
        </p>
      )}
      <h2
        id={headingId}
        className={`font-display text-text ${size === "title" ? "text-title" : "text-section"}`}
      >
        {copy.heading}
      </h2>
      {copy.description && (
        // Contentful long text: keep the editor's line breaks.
        <p className="max-w-legal whitespace-pre-line text-small text-muted md:text-body">
          {copy.description}
        </p>
      )}
    </header>
  );
}
