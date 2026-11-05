import Image from "next/image";

/** A role-specific rule, parsed to plain serializable values (safe to pass to Client Components). */
export type RoleCardData = {
  id: string;
  title: string;
  /** Line under the title, e.g. "Your invitation identifies this role". */
  subtitle: string;
  /** The role's individual rules, in order. */
  items: string[];
  icon: { url: string; unoptimized: boolean } | null;
};

/**
 * Role card (Figma "Role Card" 266:159), 768px and up: title, subtitle and the role's icon in
 * a red circle, then the numbered rules. Always open at these widths.
 *
 * Deviations from the Figma frame (guide wins): the subtitle and row numbers use the utility
 * role (13/18 +1px; Figma has no tracking), and the number column is 32px wide (Figma 28px,
 * not on the spacing scale).
 */
export function RoleCard({ role }: { role: RoleCardData }) {
  return (
    <article className="flex h-full flex-col gap-5 rounded-panel border border-line bg-bg p-8">
      <div className="flex items-center gap-4">
        <RoleHeading role={role} />
        <RoleIcon icon={role.icon} />
      </div>
      <RoleRuleList items={role.items} />
    </article>
  );
}

/**
 * Title + subtitle. `as="span"` renders spans only, so it can sit inside the accordion's
 * button (which is itself wrapped in the h3).
 */
export function RoleHeading({ role, as: Tag = "h3" }: { role: RoleCardData; as?: "h3" | "span" }) {
  const Wrapper = Tag === "h3" ? "div" : "span";
  return (
    <Wrapper className="flex min-w-0 flex-1 flex-col gap-2">
      <Tag className="font-display text-card text-text group-hover:underline">{role.title}</Tag>
      {role.subtitle && <span className="text-utility text-muted">{role.subtitle}</span>}
    </Wrapper>
  );
}

/** The role's own icon from Contentful: 22px glyph in a 48px red circle. Decorative. */
export function RoleIcon({ icon }: { icon: RoleCardData["icon"] }) {
  return (
    <span
      aria-hidden="true"
      className="flex aspect-square size-12 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-accent"
    >
      {icon && (
        <Image
          src={icon.url}
          alt=""
          width={22}
          height={22}
          unoptimized={icon.unoptimized}
          className="object-contain"
        />
      )}
    </span>
  );
}

/** Numbered rows (Figma "Rule" 266:166): "01" in muted, rule text in ivory, hairline below. */
export function RoleRuleList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, index) => (
        <li key={index} className="flex items-center gap-5 border-b border-line py-5">
          <span aria-hidden="true" className="w-8 shrink-0 text-utility text-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 text-body text-text">{item}</span>
        </li>
      ))}
    </ol>
  );
}
