import type { Metadata } from "next";

// Placeholder route: keep out of search until the page ships (drop `robots`, add description + canonical).
export const metadata: Metadata = {
  title: "FAQ",
  robots: { index: false },
};

export default function FaqPage() {
  return (
    <main className="container py-30">
      <h1 className="font-display text-section text-text">FAQ</h1>
    </main>
  );
}
