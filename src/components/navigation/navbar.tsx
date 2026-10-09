import Image from "next/image";
import Link from "next/link";
import { primaryLinks, signUpLink } from "@/lib/site-links";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";
import { NavShell } from "./nav-shell";

// Desktop (md+): inline links. Below 768px: burger + full-screen sheet (MobileMenu).
// Nav: Inter 500 13px +1px uppercase; active = accent. Sign Up = small ivory-on-red pill (action-aa for AA).
export function Navbar() {
  return (
    <NavShell
      logo={
        // Logo links home. 176 wide; the artwork has empty space below, so it is nudged down and clipped to sit on the nav's centerline.
        <Link href="/" className="block w-44 overflow-hidden">
          <Image
            src="/brand/fully-loaded-wordmark.png"
            alt="Fully Loaded"
            width={1000}
            height={289}
            sizes="176px"
            priority
            className="h-auto w-44 translate-y-1.5"
          />
        </Link>
      }
      links={
        <nav aria-label="Primary">
          <ul className="flex items-center gap-8">
            {primaryLinks.map(({ label, href }) => (
              <li key={href}>
                <NavLink
                  href={href}
                  className="block py-2 text-utility font-medium uppercase hover:underline"
                  inactiveClassName="text-text"
                  activeClassName="text-accent"
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                href={signUpLink.href}
                className="flex min-h-9 items-center justify-center rounded-pill border border-action-aa bg-action-aa px-5 text-utility font-semibold uppercase text-text hover:border-accent-emphasis hover:bg-surface hover:underline"
              >
                {signUpLink.label}
              </NavLink>
            </li>
          </ul>
        </nav>
      }
      menu={<MobileMenu />}
    />
  );
}
