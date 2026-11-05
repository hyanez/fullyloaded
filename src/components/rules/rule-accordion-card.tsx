"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { RuleEntry } from "@/models";
import { RuleIcon } from "./rule-card";

/**
 * Mobile rule card (Rules page, below 768px): the icon + title row is a disclosure button
 * that expands to the description. Closed by default. No Figma frame yet; it follows the
 * calendar's Event Accordion Card (413:596) so mobile accordions match across the site.
 */
export function RuleAccordionCard({ rule }: { rule: RuleEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article
      className={`rounded-panel border bg-bg p-4 ${open ? "border-accent-emphasis" : "border-line"}`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-center gap-4 text-left"
        >
          <RuleIcon rule={rule} />
          <span className="min-w-0 flex-1 font-display text-accordion text-text group-hover:underline">
            {rule.title}
          </span>
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
          <p className="whitespace-pre-line pt-4 text-small text-muted">{rule.description}</p>
        </div>
      </div>
    </article>
  );
}
