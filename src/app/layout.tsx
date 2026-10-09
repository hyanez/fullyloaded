import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/footer/footer";
import { Navbar } from "@/components/navigation/navbar";
import "./globals.css";

// Display: Space Grotesk 700 only (headings, section/card titles, heroes).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  variable: "--font-space-grotesk",
});

// Body/UI: Inter 400 body · 500 nav · 600 labels · 700 kickers & buttons.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

// Site-wide SEO defaults. Pages inherit the title template and set their own
// title + description (+ alternates.canonical once the page ships).
export const metadata: Metadata = {
  // TODO: set SITE_URL to the production origin; needed for canonical/OG URLs.
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Fully Loaded", template: "%s | Fully Loaded" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
