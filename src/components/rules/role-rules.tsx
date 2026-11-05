import { getRoleRules } from "@/lib/rules";
import { splitHtmlList } from "@/lib/text";
import { RoleAccordionCard } from "./role-accordion-card";
import { RoleCard, type RoleCardData } from "./role-card";

/**
 * Role Cards (Figma "Rules by Roles Section" 266:158): one card per Contentful rule flagged
 * `roleSpecificRule`. Each rule's description is a `<p>` subtitle and an `<ol>` of the role's
 * rules. Two columns from 768px, always open; below 768px, accordions that start closed.
 * Async Server Component; renders nothing if Contentful is down or no role rules exist.
 */
export async function RoleRules() {
  let roles: RoleCardData[] = [];
  try {
    roles = (await getRoleRules()).map((rule) => {
      const { paragraphs, items } = splitHtmlList(rule.description);
      const file = rule.icon?.fields?.file;
      return {
        id: rule.id,
        title: rule.title ?? "",
        subtitle: paragraphs.join(" "),
        items,
        icon:
          typeof file?.url === "string"
            ? { url: `https:${file.url}`, unoptimized: file.contentType === "image/svg+xml" }
            : null,
      };
    });
  } catch (error) {
    console.error("[rules] Could not load role rules from Contentful:", error);
  }
  if (roles.length === 0) return null;

  return (
    <ul className="grid gap-3 md:grid-cols-2 md:gap-6">
      {roles.map((role) => (
        <li key={role.id}>
          {/* One layout per breakpoint; the hidden one is display:none, so out of the a11y tree. */}
          <div className="md:hidden">
            <RoleAccordionCard role={role} />
          </div>
          <div className="hidden h-full md:block">
            <RoleCard role={role} />
          </div>
        </li>
      ))}
    </ul>
  );
}
