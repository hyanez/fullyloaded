import { documentToReactComponents, type Options } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS, type Block, type Document, type Inline } from "@contentful/rich-text-types";

/** Text content of a node, used to drop paragraphs editors left empty as spacers. */
function plainText(node: Block | Inline): string {
  return node.content
    .map((child) => (child.nodeType === "text" ? child.value : plainText(child)))
    .join("");
}

const headingClass = "pt-4 font-display text-legal text-text";

// The page owns the h1, so a body "Heading 1" renders as h2 to keep the hierarchy.
const options: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-semibold text-text">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
    [MARKS.UNDERLINE]: (text) => <span className="underline">{text}</span>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (plainText(node).trim() ? <p>{children}</p> : null),
    [BLOCKS.HEADING_1]: (_, children) => <h2 className={headingClass}>{children}</h2>,
    [BLOCKS.HEADING_2]: (_, children) => <h2 className={headingClass}>{children}</h2>,
    [BLOCKS.HEADING_3]: (_, children) => <h3 className={headingClass}>{children}</h3>,
    [BLOCKS.HEADING_4]: (_, children) => <h4 className={headingClass}>{children}</h4>,
    [BLOCKS.HEADING_5]: (_, children) => <h5 className={headingClass}>{children}</h5>,
    [BLOCKS.HEADING_6]: (_, children) => <h6 className={headingClass}>{children}</h6>,
    [BLOCKS.UL_LIST]: (_, children) => <ul className="flex list-disc flex-col gap-2 pl-6">{children}</ul>,
    [BLOCKS.OL_LIST]: (_, children) => <ol className="flex list-decimal flex-col gap-2 pl-6">{children}</ol>,
    // List items wrap their text in a paragraph node; render it inline-level.
    [BLOCKS.LIST_ITEM]: (_, children) => <li>{children}</li>,
    [BLOCKS.HR]: () => <hr className="border-line" />,
    [BLOCKS.QUOTE]: (_, children) => (
      <blockquote className="flex flex-col gap-4 border-l-2 border-accent pl-5">{children}</blockquote>
    ),
    [INLINES.HYPERLINK]: (node, children) => (
      <a href={String(node.data.uri)} className="text-text underline hover:text-muted">
        {children}
      </a>
    ),
  },
};

/** Contentful Rich Text in the legal reading style (15/24 prose, 20/26 section headings). */
export function LegalRichText({ document }: { document: Document }) {
  return (
    <div className="flex flex-col gap-4 break-words text-prose text-muted">
      {documentToReactComponents(document, options)}
    </div>
  );
}
