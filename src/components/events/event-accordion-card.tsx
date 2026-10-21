"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { CalendarEvent } from "@/lib/events";
import { DateBadge, DressCodeChips, EventMeta, EventPoster } from "./event-card-parts";

/**
 * Mobile calendar card (Figma "Event Accordion Card" 413:596, below 768px). The header row
 * (date badge, kicker, title) is a disclosure button; it expands to the 2:3 poster, time,
 * location, event details and dress-code chips.
 */
export function EventAccordionCard({
  event,
  defaultOpen = false,
}: {
  event: CalendarEvent;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <article
      className={`rounded-panel border bg-surface p-4 ${open ? "border-accent-emphasis" : "border-line"}`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-center gap-4 text-left"
        >
          <DateBadge date={event.date} size="sm" />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-kicker font-bold uppercase text-accent">{event.label}</span>
            <span className="font-display text-accordion text-text group-hover:underline">
              {event.title}
            </span>
          </span>
          {/* Guide: disclosure chevrons render at 22px (Figma mock: 18px). */}
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
          <div className="flex flex-col gap-4 pt-4">
            <EventPoster
              poster={event.poster}
              sizes="100vw"
              className="w-full rounded-small"
            />
            <div className="flex flex-col gap-2 text-small text-muted">
              <p>
                <EventMeta event={event} />
              </p>
              {event.details && <p>{event.details}</p>}
            </div>
            <DressCodeChips items={event.dressCode} />
          </div>
        </div>
      </div>
    </article>
  );
}
