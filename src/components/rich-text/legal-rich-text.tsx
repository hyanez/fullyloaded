import { documentToReactComponents, type Options } from "@contentful/rich-text-react-renderer";
import {
  BLOCKS,
  INLINES,
  MARKS,
  type Block,
  type Document,
  type Inline,
  type TopLevelBlock,
} from "@contentful/rich-text-types";

/** Text content of a node, used to drop paragraphs editors left empty as spacers. */
function plainText(node: Block | Inline): string {
  return node.content
    .map((child) => (child.nodeType === "text" ? child.value : plainText(child)))
    .join("");
}

const SECTION_HEADINGS: string[] = [BLOCKS.HEADING_1, BLOCKS.HEADING_2, BLOCKS.HEADING_3];

// TODO: remove the numbered-paragraph fallback once editors set section titles as Heading 2 in
// Contentful. Today they are plain paragraphs like "1. Who We Are".
const NUMBERED_TITLE = /^\d{1,2}\.\s+[^.!?]{1,80}$/;

/** A block that starts a new section: a heading, or a short numbered line like "1. Who We Are". */
function isSectionTitle(node: TopLevelBlock): boolean {
  if (SECTION_HEADINGS.includes(node.nodeType)) return true;
  return node.nodeType === BLOCKS.PARAGRAPH && NUMBERED_TITLE.test(plainText(node).trim());
}

type Section = { title?: TopLevelBlock; body: TopLevelBlock[] };

/** Split the document at each section title; content before the first title gets no title. */
function toSections(document: Document): Section[] {
  const sections: Section[] = [];
  for (const node of document.content) {
    // Editors leave empty paragraphs as spacers; spacing comes from the layout instead.
    if (node.nodeType === BLOCKS.PARAGRAPH && !plainText(node).trim()) continue;
    if (isSectionTitle(node)) sections.push({ title: node, body: [] });
    else if (sections.length === 0) sections.push({ body: [node] });
    else sections[sections.length - 1].body.push(node);
  }
  return sections;
}

const blockOptions: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-semibold text-text">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
    [MARKS.UNDERLINE]: (text) => <span className="underline">{text}</span>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_, children) => <p>{children}</p>,
    // Sub-headings inside a section body.
    [BLOCKS.HEADING_4]: (_, children) => <h3 className="font-body font-semibold text-text">{children}</h3>,
    [BLOCKS.HEADING_5]: (_, children) => <h4 className="font-body font-semibold text-text">{children}</h4>,
    [BLOCKS.HEADING_6]: (_, children) => <h5 className="font-body font-semibold text-text">{children}</h5>,
    [BLOCKS.UL_LIST]: (_, children) => <ul className="flex list-disc flex-col gap-2 pl-6">{children}</ul>,
    [BLOCKS.OL_LIST]: (_, children) => <ol className="flex list-decimal flex-col gap-2 pl-6">{children}</ol>,
    [BLOCKS.LIST_ITEM]: (_, children) => <li>{children}</li>,
    [BLOCKS.HR]: () => <hr className="border-line" />,
    [BLOCKS.QUOTE]: (_, children) => (
      <blockquote className="flex flex-col gap-3 border-l-2 border-accent pl-5">{children}</blockquote>
    ),
    [INLINES.HYPERLINK]: (node, children) => (
      <a href={String(node.data.uri)} className="text-text underline hover:text-muted">
        {children}
      </a>
    ),
  },
};

// Section titles render as h2 whatever their level in Contentful; the page owns the h1.
const titleOptions: Options = {
  ...blockOptions,
  renderNode: {
    ...blockOptions.renderNode,
    [BLOCKS.PARAGRAPH]: (_, children) => children,
    [BLOCKS.HEADING_1]: (_, children) => children,
    [BLOCKS.HEADING_2]: (_, children) => children,
    [BLOCKS.HEADING_3]: (_, children) => children,
  },
};

const asDocument = (content: TopLevelBlock[]): Document => ({
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content,
});

function SectionContent({
  section,
  bodyClassName,
  titleClassName = "text-legal",
}: {
  section: Section;
  bodyClassName: string;
  titleClassName?: string;
}) {
  return (
    <>
      {section.title && (
        <h2 className={`font-display text-text ${titleClassName}`}>
          {documentToReactComponents(asDocument([section.title]), titleOptions)}
        </h2>
      )}
      {section.body.length > 0 && (
        <div className={`flex flex-col gap-4 break-words ${bodyClassName}`}>
          {documentToReactComponents(asDocument(section.body), blockOptions)}
        </div>
      )}
    </>
  );
}

const NUMBER_PREFIX = /^(\d{1,2}\.)\s+(.+)$/;

/** Section title with its leading number ("1.") split out so it can take the accent color. */
function NumberedTitle({ title }: { title: TopLevelBlock }) {
  const text = plainText(title).trim();
  const match = NUMBER_PREFIX.exec(text);
  return (
    <h2 className="flex gap-3 font-display text-accordion text-text">
      {match ? (
        <>
          <span className="text-accent">{match[1]}</span>
          <span>{match[2]}</span>
        </>
      ) : (
        text
      )}
    </h2>
  );
}

/**
 * Split off the closing note that follows the last numbered section: everything after the last
 * horizontal rule.
 */
function toSectionsWithNote(document: Document): { sections: Section[]; note: TopLevelBlock[] } {
  const hrIndex = document.content.map((node) => node.nodeType).lastIndexOf(BLOCKS.HR);
  if (hrIndex !== -1) {
    return {
      sections: toSections(asDocument(document.content.slice(0, hrIndex))),
      note: toSections(asDocument(document.content.slice(hrIndex + 1))).flatMap((s) => s.body),
    };
  }
  // TODO: remove once editors put a horizontal rule before the closing note in Contentful. Today
  // the note is the last paragraph of the final section, so treat anything after that section's
  // first block as the note.
  const sections = toSections(document);
  const last = sections[sections.length - 1];
  if (!last?.title || last.body.length < 2) return { sections, note: [] };
  return {
    sections: [...sections.slice(0, -1), { title: last.title, body: last.body.slice(0, 1) }],
    note: last.body.slice(1),
  };
}

/**
 * Contentful Rich Text in the legal reading layout: one block per section, 20/26 display title,
 * 15/24 muted prose.
 * - `divided` (Privacy Policy, Figma 425:610 / 425:964 mobile): red hairlines between sections.
 * - `ruled` (Terms of Service, Figma 425:799): untitled intro in ivory 16px above an ivory
 *   hairline, then each section behind a 2px red left rule.
 * - `numbered` (Waiver, Figma 425:703): untitled intro in a surface callout, 18px titles with a
 *   red number, red hairline under each section, then a centered closing note.
 */
export function LegalRichText({
  document,
  variant = "divided",
}: {
  document: Document;
  variant?: "divided" | "ruled" | "numbered";
}) {
  if (variant === "numbered") {
    const { sections, note } = toSectionsWithNote(document);
    return (
      <div className="flex flex-col gap-8 break-words">
        {sections.map((section, index) =>
          section.title ? (
            <div key={index} className="flex flex-col gap-4 border-b border-line-accent pb-8">
              <NumberedTitle title={section.title} />
              <div className="flex flex-col gap-4 text-prose text-muted">
                {documentToReactComponents(asDocument(section.body), blockOptions)}
              </div>
            </div>
          ) : (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-small border border-line bg-surface p-6 text-prose font-medium text-text"
            >
              {documentToReactComponents(asDocument(section.body), blockOptions)}
            </div>
          ),
        )}
        {note.length > 0 && (
          <div className="flex flex-col gap-4 pt-6 text-center text-small text-muted">
            {documentToReactComponents(asDocument(note), blockOptions)}
          </div>
        )}
      </div>
    );
  }

  const sections = toSections(document);

  if (variant === "ruled") {
    return (
      <div className="flex flex-col gap-8">
        {sections.map((section, index) =>
          section.title ? (
            <div key={index} className="flex flex-col gap-3 border-l-2 border-accent pl-4">
              <SectionContent section={section} bodyClassName="text-prose text-muted" />
            </div>
          ) : (
            <div key={index} className="flex flex-col border-b border-line pb-8">
              <SectionContent section={section} bodyClassName="text-body text-text" />
            </div>
          ),
        )}
      </div>
    );
  }

  // Mobile (Figma 425:964): 18px titles, 32px either side of each hairline, and the first and
  // last sections sit closer to the header and page end.
  return (
    <div className="flex flex-col divide-y divide-line-accent">
      {sections.map((section, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 py-8 first:pt-5 last:pb-0 md:py-10 md:first:pt-10 md:last:pb-10"
        >
          <SectionContent
            section={section}
            bodyClassName="text-prose text-muted"
            titleClassName="text-accordion md:text-legal"
          />
        </div>
      ))}
    </div>
  );
}
