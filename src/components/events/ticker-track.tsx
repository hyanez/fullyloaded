"use client";

import Image from "next/image";
import { useState } from "react";

export type TickerItem = {
  id: string;
  title: string;
  /** "Oct 24" plus the "2026-10-24" day key for <time>. */
  date: { text: string; dateTime: string };
  /** "10:00 PM" plus the ISO start time for <time>. */
  startTime: { text: string; dateTime: string };
};

/** Each loop half repeats the events until it holds at least this many, so it outruns the viewport. */
const MIN_ITEMS_PER_HALF = 6;
/** Scroll speed: seconds per item on screen. */
const SECONDS_PER_ITEM = 6;

/**
 * Scrolling track for the events ticker. The events render twice (or more) back to back and
 * the track slides by exactly one half, so the loop is seamless. Only the first copy of each
 * event is exposed to assistive tech; the repeats are `aria-hidden`.
 * Motion pauses on hover, on keyboard focus and with the Pause button; with reduced motion
 * the track stands still and the button is hidden.
 */
export function TickerTrack({ items }: { items: TickerItem[] }) {
  const [paused, setPaused] = useState(false);
  const repeats = Math.ceil(MIN_ITEMS_PER_HALF / items.length);
  const half = Array.from({ length: repeats }, () => items).flat();

  return (
    <div className="flex h-14 items-center">
      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          data-paused={paused || undefined}
          className="ticker flex w-max"
          style={{ animationDuration: `${half.length * SECONDS_PER_ITEM}s` }}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
              className="flex shrink-0 items-center gap-8 pr-8"
            >
              {half.map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  aria-hidden={(copy === 0 && index >= items.length) || undefined}
                  className="flex items-center gap-8"
                >
                  <span className="flex items-center gap-3 whitespace-nowrap">
                    <time
                      dateTime={item.date.dateTime}
                      className="text-kicker font-bold uppercase text-accent"
                    >
                      {item.date.text}
                    </time>
                    <span className="text-utility font-bold uppercase text-text">{item.title}</span>
                    <time dateTime={item.startTime.dateTime} className="text-kicker text-muted">
                      {item.startTime.text}
                    </time>
                  </span>
                  <Image src="/icons/ticker-separator.svg" alt="" width={5} height={5} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        className="h-14 shrink-0 border-l border-line-accent px-5 text-utility font-bold uppercase text-muted hover:text-text motion-reduce:hidden md:px-6"
      >
        <span className="sr-only">Upcoming events ticker: </span>
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}
