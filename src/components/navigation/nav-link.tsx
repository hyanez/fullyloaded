"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Client island: only this reads the pathname so the rest of the navbar stays a Server Component.
// Active/inactive classes are exclusive so two color utilities never compete.
export function NavLink({
  href,
  className,
  activeClassName = "",
  inactiveClassName = "",
  children,
}: {
  href: string;
  className: string;
  activeClassName?: string;
  inactiveClassName?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? activeClassName : inactiveClassName}`}
    >
      {children}
    </Link>
  );
}
