// TODO: landing page scaffold. Sections mirror Figma "Landing Page" (node 99:3) and are
// empty placeholders: fill each from its Figma node, give each a heading, then add a page
// description + canonical for SEO. Keep `data-nav-hero` on the hero (the navbar watches it).
// The hero is a temporary 3/4-viewport height; the dividers are only there to see the sections.
export default function Home() {
  return (
    <main>
      {/* Upcoming Events Ticker — Figma 302:352 */}
      <section aria-label="Upcoming events ticker" className="h-14" />

      {/* Hero / Upcoming Events + UpNext Carousel + Scroll cue — Figma 207:116, 171:192, 231:118 */}
      <section data-nav-hero aria-label="Hero" className="flex min-h-hero items-center justify-center">
        {/* TODO: temporary h1 so the page has a heading; replace with the real hero. */}
        <h1 className="font-display text-section text-text">Fully Loaded</h1>
      </section>

      {/* Calendar Module — Figma 204:116 */}
      <section aria-label="Event calendar" className="min-h-200 border-t border-line" />

      {/* The Rules Section — Figma 210:97 */}
      <section aria-label="The rules" className="min-h-160 border-t border-line" />

      {/* Application CTA Module — Figma 230:89 */}
      <section aria-label="Apply" className="min-h-56 border-t border-line" />
    </main>
  );
}
