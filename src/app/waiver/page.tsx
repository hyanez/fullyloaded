import type { Metadata } from "next";

// Placeholder route: keep out of search until the page ships (drop `robots`, add description + canonical).
export const metadata: Metadata = {
  title: "Waiver",
  robots: { index: false },
};

export default function WaiverPage() {
  return (
    <main className="container py-30">
      <h1 className="font-display text-section text-text">Waiver</h1>
    </main>
  );
}
