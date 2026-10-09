"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Header chrome + landing-page behavior.
 *
 * - Inner pages: static 80px header.
 * - Landing (`/`), mobile: sticky header with logo and burger.
 * - Landing (`/`), desktop: no logo, links centered while the hero (`[data-nav-hero]`)
 *   is on screen; once it has scrolled past, the header follows the screen with the logo.
 */
export function NavShell({
  logo,
  links,
  menu,
}: {
  logo: ReactNode;
  links: ReactNode;
  menu: ReactNode;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!isLanding) return;
    const hero = document.querySelector("[data-nav-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPastHero(entry.boundingClientRect.bottom <= 0);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isLanding]);

  const follows = isLanding && pastHero;
  const hideLogo = isLanding && !pastHero;

  // Sticky everywhere. Desktop landing is the exception: it scrolls away with the hero
  // (no logo), then switches to fixed + animates in once the hero is behind the user.
  let headerPosition = "sticky top-0 border-b border-line";
  if (isLanding) {
    headerPosition = follows
      ? "sticky top-0 border-b border-line md:fixed md:inset-x-0 md:animate-nav-in"
      : "sticky top-0 border-b border-line md:static md:border-b-0";
  }

  return (
    // Landing only: on desktop a spacer keeps the 80px in flow when the header switches to
    // fixed. Elsewhere (and on mobile) the wrapper is `display: contents` so the sticky
    // header's containing block is the page, not a short wrapper.
    <div className={isLanding ? "contents md:block md:h-20" : "contents"}>
      <header className={`z-40 bg-bg ${headerPosition}`}>
        <div
          className={`container flex h-20 items-center justify-between ${hideLogo ? "md:justify-center" : ""}`}
        >
          <div className={hideLogo ? "md:hidden" : ""}>{logo}</div>
          <div className="hidden md:block">{links}</div>
          <div className="md:hidden">{menu}</div>
        </div>
      </header>
    </div>
  );
}
