"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { RoleHeading, RoleRuleList, type RoleCardData } from "./role-card";

/**
 * Mobile role card (below 768px): the title row is a disclosure button that expands to the
 * numbered rules. Closed by default. No mobile Figma frame; it follows the Role Card (266:159)
 * with the calendar accordion's disclosure chevron (413:596). The role icon is left out here:
 * the role icons are chevrons too, and would read as a second disclosure control.
 */
export function RoleAccordionCard({ role }: { role: RoleCardData }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article
      className={`rounded-panel border bg-bg p-6 ${open ? "border-accent-emphasis" : "border-line"}`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-center gap-4 text-left"
        >
          <RoleHeading role={role} as="span" />
          {/* Guide: disclosure chevrons render at 22px. */}
          <Image
            src={open ? "/icons/chevron-up-accent.svg" : "/icons/chevron-down-muted.svg"}
            alt=""
            aria-hidden="true"
            width={22}
            height={22}
            className="shrink-0"
          />
        </button>
      </h3>

      <div
        id={panelId}
        data-state={open ? "open" : "closed"}
        inert={!open}
        className="collapsible"
      >
        {/* The clipping box has no padding, so it can collapse all the way to 0. */}
        <div className="min-h-0 overflow-hidden">
          <div className="pt-2">
            <RoleRuleList items={role.items} />
          </div>
        </div>
      </div>
    </article>
  );
}
