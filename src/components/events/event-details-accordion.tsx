"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { CalendarEvent } from "@/lib/events";

/**
 * "Event details" disclosure on the Events page card (Figma "Accordion / Event details",
 * closed 279:203 / expanded 279:161). Health check and amenities always show; the button
 * reveals the description, schedule, dress code, venue and cost.
 */
export function EventDetailsAccordion({
  event,
  defaultOpen = false,
}: {
  event: CalendarEvent;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="flex flex-col gap-4 rounded-panel border border-line-strong bg-bg p-4 shadow-card md:p-6 lg:max-w-modal">
      <h4>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-center gap-3 text-left"
        >
          {/* 40px outlined control with the guide's red chevron; points up when open. */}
          <span className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-pill border border-line-strong bg-bg group-hover:border-accent-emphasis group-hover:bg-surface">
            <Image
              src="/icons/chevron-down-accent.svg"
              alt=""
              aria-hidden="true"
              width={20}
              height={20}
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-display text-accordion text-text group-hover:underline">
              Event details<span className="sr-only"> for {event.title}</span>
            </span>
          </span>
        </button>
      </h4>

      {event.healthCheck && (
        <p className="flex items-center gap-2 self-start rounded-input bg-input px-2 py-1 text-small font-semibold text-status">
          <Image src="/icons/plus-status.svg" alt="" aria-hidden="true" width={14} height={14} />
          Health check
        </p>
      )}

      {/* Animated panel. -mt-4 cancels the parent gap while closed; pt-4 restores it when open. */}
      <div
        id={panelId}
        data-state={open ? "open" : "closed"}
        inert={!open}
        className="collapsible -mt-4"
      >
        {/* The clipping box has no padding, so it can collapse all the way to 0. */}
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 pt-4">
            {event.details && <p className="text-small text-muted">{event.details}</p>}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailItem label="Schedule">{event.schedule}</DetailItem>
              {event.dressCode.length > 0 && (
                <DetailItem label="Dress code">{event.dressCode.join(", ")}</DetailItem>
              )}
              {event.location && <DetailItem label="Venue">{event.location}</DetailItem>}
              {event.cost.length > 0 && (
                <DetailItem label="Cost">
                  {event.cost.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </DetailItem>
              )}
            </dl>
          </div>
        </div>
      </div>

      {event.amenities.length > 0 && (
        <div className="flex flex-col gap-2">
          <p id={`${panelId}-amenities`} className="text-kicker font-semibold uppercase text-muted">
            Amenities
          </p>
          <ul aria-labelledby={`${panelId}-amenities`} className="flex flex-wrap gap-2">
            {event.amenities.map((item) => (
              <li
                key={item}
                className="rounded-pill border border-line-strong bg-text/8 px-3 py-1 text-utility font-semibold text-text"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-kicker font-semibold uppercase text-muted">{label}</dt>
      <dd className="text-small font-bold text-text">{children}</dd>
    </div>
  );
}
