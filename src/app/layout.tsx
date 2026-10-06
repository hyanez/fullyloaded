import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Fully Loaded",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
