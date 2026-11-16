// Single source of truth for navigation, shared by the navbar and footer.
// Sign Up and Apply are the same page (/apply).

export type SiteLink = { label: string; href: string };

export const primaryLinks: SiteLink[] = [
  { label: "Events", href: "/events" },
  { label: "Rules", href: "/rules" },
  { label: "FAQ", href: "/faq" },
];

export const signUpLink: SiteLink = { label: "Apply", href: "/apply" };

export const footerNavLinks: SiteLink[] = [
  { label: "Home", href: "/" },
  ...primaryLinks,
  { label: "Apply", href: "/apply" },
];

export const footerLegalLinks: SiteLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
  { label: "Waiver", href: "/waiver" },
];

// Plain module (no "use client"), so Server and Client Components both get the real string.
// TODO: contact address is hardcoded from Figma; move to Contentful with the rest of the page copy.
export const CONTACT_EMAIL = "events@fullyloadednyc.com";
