/**
 * Split Contentful long text into prose and a trailing "- " list, e.g.
 * "Intro line.\n- Invite Only\n- Respect The Theme" →
 * `{ text: "Intro line.", items: ["Invite Only", "Respect The Theme"] }`.
 * Lets editors author short tag lists (like the rules chips) in a plain text field.
 */
export function splitBulletList(value: string | undefined): { text: string; items: string[] } {
  const text: string[] = [];
  const items: string[] = [];
  for (const line of (value ?? "").split("\n")) {
    const bullet = line.match(/^\s*[-•*]\s+(.*\S)\s*$/);
    if (bullet) items.push(bullet[1]);
    else text.push(line);
  }
  return { text: text.join("\n").trim(), items };
}

/**
 * Plain-text paragraphs from a Contentful rich text document (marks and links dropped).
 * For fields authored as simple paragraphs, so no rich-text renderer is needed.
 */
export function richTextParagraphs(document: unknown): string[] {
  const textOf = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";
    const { nodeType, value, content } = node as { nodeType?: string; value?: unknown; content?: unknown };
    if (nodeType === "text") return typeof value === "string" ? value : "";
    return Array.isArray(content) ? content.map(textOf).join("") : "";
  };
  const blocks = (document as { content?: unknown } | null)?.content;
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block) => textOf(block).trim()).filter(Boolean);
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", nbsp: " ",
};

/** Plain text of an HTML fragment: tags dropped, common entities decoded, whitespace collapsed. */
function htmlText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|apos|#39|nbsp);/g, (_, name: string) => HTML_ENTITIES[name])
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a Contentful long-text field authored as simple HTML into its paragraphs and list
 * items, e.g. "<p>Intro</p><ol><li>One</li><li>Two</li></ol>" →
 * `{ paragraphs: ["Intro"], items: ["One", "Two"] }`. Plain text without tags becomes one
 * paragraph. Returns text only, so nothing from the field is injected as markup.
 */
export function splitHtmlList(value: string | undefined): { paragraphs: string[]; items: string[] } {
  const html = value ?? "";
  const items = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => htmlText(m[1]));
  const prose = html.replace(/<(ol|ul)\b[\s\S]*?<\/\1>/gi, "");
  const paragraphs = /<p\b/i.test(prose)
    ? [...prose.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => htmlText(m[1]))
    : [htmlText(prose)];
  return { paragraphs: paragraphs.filter(Boolean), items: items.filter(Boolean) };
}
