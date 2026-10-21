"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { footerNavLinks, signUpLink } from "@/lib/site-links";
import { NavLink } from "./nav-link";

// 48px control (the outline is an inset ring, not a border, so the bars are positioned from the
// true 48px box and stay centered): two 2px round-cap bars. Closed = two lines (top/bottom of a 24px box);
// inside an open <dialog> (group-open) they slide to the center and rotate into an X.
// `starting:` makes the bars animate from lines to X when the sheet opens.
function MenuBars() {
  const bar =
    "absolute left-3 h-0.5 w-6 rounded-pill bg-text transition-all duration-300 starting:group-open:translate-y-0 starting:group-open:rotate-0 starting:group-open:scale-x-100";
  return (
    <>
      <span
        aria-hidden="true"
        className={`${bar} top-2.75 group-open:translate-y-3 group-open:rotate-45 group-open:scale-x-140`}
      />
      <span
        aria-hidden="true"
        className={`${bar} top-8.75 group-open:-translate-y-3 group-open:-rotate-45 group-open:scale-x-140`}
      />
    </>
  );
}

function Wordmark() {
  return (
    <Image
      src="/brand/fully-loaded-wordmark.png"
      alt="Fully Loaded"
      width={1000}
      height={289}
      sizes="176px"
      className="h-auto w-44 translate-y-1.5"
    />
  );
}

export function MobileMenu() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function open() {
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
    setIsOpen(true);
  }

  function close() {
    dialogRef.current?.close();
  }

  // Fires for every close path: close button, Esc, link click, route change, resize.
  function handleClosed() {
    document.body.style.overflow = "";
    setIsOpen(false);
  }

  // Close after navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // The sheet is mobile-only: close it if the viewport grows to the desktop layout.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialogRef.current?.close();
    };
    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        aria-haspopup="dialog"
        onClick={open}
        className="relative block size-12 rounded-input inset-ring-1 inset-ring-line"
      >
        <MenuBars />
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-nav"
        aria-label="Main menu"
        onClose={handleClosed}
        // Close when a link inside is chosen (also covers links to the current page).
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) close();
        }}
        className="group m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-bg p-0 text-text opacity-0 transition-all transition-discrete duration-300 open:opacity-100 starting:open:opacity-0"
      >
        <div className="flex min-h-full flex-col justify-between">
          <div className="container flex h-20 shrink-0 items-center justify-between">
            <Link href="/" className="block w-44 overflow-hidden">
              <Wordmark />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              autoFocus
              className="relative block size-12 rounded-input inset-ring-2 inset-ring-text"
            >
              <MenuBars />
            </button>
          </div>

          <nav aria-label="Menu" className="container flex flex-col items-center gap-6 py-10">
            <p className="flex items-center gap-3 text-kicker font-semibold uppercase text-muted">
              <span aria-hidden="true" className="h-0.5 w-6 bg-accent" />
              Navigation
            </p>
            <ul className="flex w-full flex-col gap-2">
              {footerNavLinks.map(({ label, href }) => (
                <li key={href}>
                  <NavLink
                    href={href}
                    className="flex min-h-16 items-center justify-center py-1 text-center font-display text-menu hover:underline"
                    inactiveClassName="text-text"
                    activeClassName="text-accent"
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="container flex shrink-0 flex-col gap-6 pb-8 pt-6">
            <div aria-hidden="true" className="h-px bg-line" />
            <NavLink
              href={signUpLink.href}
              className="flex min-h-14 w-full items-center justify-center rounded-pill border border-action-aa bg-action-aa font-body text-utility font-bold uppercase text-text hover:border-accent-emphasis hover:bg-surface hover:underline"
            >
              {signUpLink.label}
            </NavLink>
          </div>
        </div>
      </dialog>
    </>
  );
}
