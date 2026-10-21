"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { FaqItem as FaqItemData } from "@/lib/faqs";

/**
 * FAQ accordion item (Figma "FAQ Accordion Item" 404:647 expanded / 404:656 closed).
 * The question is a disclosure button inside an h3; the answer animates open and closed.
 */
export function FaqItem({ item, defaultOpen = false }: { item: FaqItemData; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="rounded-panel border border-line bg-bg p-4 md:p-6">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-center gap-3 text-left"
        >
          {/* 40px outlined control with the guide's red chevron; points up when open. */}
          <span className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-pill border border-line bg-bg group-hover:border-accent-emphasis group-hover:bg-surface">
            <Image
              src="/icons/chevron-down-accent.svg"
              alt=""
              aria-hidden="true"
              width={20}
              height={20}
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </span>
          <span className="min-w-0 flex-1 font-display text-accordion text-text group-hover:underline">
            {item.question}
          </span>
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
          <div className="flex flex-col gap-3 pt-4 text-small text-muted">
            {item.answer.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
