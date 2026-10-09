import Image from "next/image";
import Link from "next/link";
import { footerLegalLinks, footerNavLinks, type SiteLink } from "@/lib/site-links";

function FooterColumn({ title, links }: { title: string; links: SiteLink[] }) {
  return (
    <nav aria-label={title} className="md:w-45">
      <p className="mb-4 text-kicker font-bold uppercase text-accent">{title}</p>
      <ul className="flex flex-col gap-3">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link href={href} className="text-small font-medium text-text hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="container flex flex-col gap-8 pb-8 pt-10 md:gap-12 md:pt-16">
        <div className="grid grid-cols-2 gap-y-8 md:flex md:justify-between">
          <div className="col-span-2 flex flex-col gap-4 md:w-80 md:gap-6">
            {/* 48px footer mark; decorative, the wordmark in the navbar carries the name. */}
            <Image src="/brand/fully-loaded-mark.png" alt="" width={48} height={48} />
            <p className="text-small text-muted">
              An invite-only nightlife experience built around respect, discretion, and the music.
            </p>
          </div>
          <FooterColumn title="Navigation" links={footerNavLinks} />
          <FooterColumn title="Legal" links={footerLegalLinks} />
        </div>

        {/* TODO: make the year dynamic; legal copy is as supplied in Figma. */}
        <p className="text-small text-muted">
          © 2026 Fully Loaded. All rights reserved. FL complies with all State, Local, Federal Law
          and does not discriminate against anyone in a protected class.
        </p>
      </div>
    </footer>
  );
}
