import Link from "next/link";
import type { ReactNode } from "react";

const SITE_ORIGIN = (() => {
  try {
    return process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : null;
  } catch {
    return null;
  }
})();

/**
 * In-app path for a Contentful hyperlink, or null when it leaves the site. Editors may write
 * "/apply" or paste the full production URL; both route client-side.
 */
function internalHref(uri: string): string | null {
  if (uri.startsWith("#") || (uri.startsWith("/") && !uri.startsWith("//"))) return uri;
  if (!SITE_ORIGIN) return null;
  try {
    const url = new URL(uri);
    return url.origin === SITE_ORIGIN ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}

/**
 * Hyperlink from a Contentful rich text field. In-app routes use `next/link`; other web links
 * open in a new tab and say so to screen readers. mailto:/tel: links behave natively.
 */
export function RichTextLink({
  uri,
  className,
  children,
}: {
  uri: string;
  className: string;
  children: ReactNode;
}) {
  const href = internalHref(uri);
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  if (!/^https?:\/\//i.test(uri)) {
    return (
      <a href={uri} className={className}>
        {children}
      </a>
    );
  }
  return (
    <a href={uri} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
