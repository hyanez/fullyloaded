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
