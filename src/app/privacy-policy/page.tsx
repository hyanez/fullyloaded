import type { Metadata } from "next";

// Placeholder route: keep out of search until the page ships (drop `robots`, add description + canonical).
export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container py-30">
      <h1 className="font-display text-section text-text">Privacy Policy</h1>
    </main>
  );
}
