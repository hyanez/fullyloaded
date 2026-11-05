import { documentToReactComponents, type Options } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS, type Block, type Document, type Inline } from "@contentful/rich-text-types";
import { Fragment } from "react";
import { RichTextLink } from "./rich-text-link";

/** Text content of a node, used to drop paragraphs editors left empty as spacers. */
function plainText(node: Block | Inline): string {
  return node.content
    .map((child) => (child.nodeType === "text" ? child.value : plainText(child)))
    .join("");
}

const options: Options = {
  // Editors use Shift+Enter for line breaks inside a paragraph (e.g. a bold lead-in line).
  renderText: (text) =>
    text.split("\n").map((line, index) => (
      <Fragment key={index}>
        {index > 0 && <br />}
        {line}
      </Fragment>
    )),
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-semibold text-text">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
    [MARKS.UNDERLINE]: (text) => <span className="underline">{text}</span>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (plainText(node).trim() ? <p>{children}</p> : null),
    [BLOCKS.UL_LIST]: (_, children) => <ul className="flex list-disc flex-col gap-2 pl-6">{children}</ul>,
    [BLOCKS.OL_LIST]: (_, children) => <ol className="flex list-decimal flex-col gap-2 pl-6">{children}</ol>,
    // No flex on the <li>: it would hide the list marker.
    [BLOCKS.LIST_ITEM]: (_, children) => <li>{children}</li>,
    [INLINES.HYPERLINK]: (node, children) => (
      <RichTextLink uri={String(node.data.uri)} className="text-text underline hover:text-muted">
        {children}
      </RichTextLink>
    ),
  },
};

/** A FAQ answer from Contentful Rich Text: 15/22 muted prose with ivory bold text and links. */
export function FaqRichText({ document }: { document: Document }) {
  return (
    <div className="flex flex-col gap-3 break-words text-small text-muted">
      {documentToReactComponents(document, options)}
    </div>
  );
}
