// Single source of truth for navigation, shared by the navbar and footer.
// Sign Up and Apply are the same page (/apply).

export type SiteLink = { label: string; href: string };

export const primaryLinks: SiteLink[] = [
  { label: "Events", href: "/events" },
  { label: "Rules", href: "/rules" },
  { label: "FAQ", href: "/faq" },
];

export const signUpLink: SiteLink = { label: "Sign Up", href: "/apply" };

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
