<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Fully Loaded — repo rules

Source of truth for all visual decisions: Figma file "FL"
(https://www.figma.com/design/TSrePll4vjIt4862pP3I5W/FL), frame
**"Fully Loaded — Design foundations & component guide"** (node `523:4415`).
If code and the guide disagree, the guide wins; change Figma first, then code.

## Stack
- Next.js 16 App Router, TypeScript, `src/` dir, `@/*` import alias.
- Styling: **Tailwind CSS v4 only**. No Sass, no CSS-in-JS, no component/UI kits.
- Content: Contentful via `src/lib/contentful.ts` (server-only). Never import it
  into a Client Component. Editable copy lives in Contentful, not in code or images.

## Tokens
- Tokens live in `src/app/globals.css` (`@theme`) and `src/styles/tokens.css`.
  Tailwind's default colors, fonts, type scale, radii, containers and breakpoints
  are reset — only Fully Loaded tokens exist.
- **No raw values in components.** No hex codes, no arbitrary values like
  `bg-[#120707]`, `text-[48px]`, `rounded-[16px]`. Use the token utility. If a
  value is missing, add it as a token (and flag it as a deviation from the guide).
- Figma MCP output arrives as Tailwind with arbitrary hex/px values. Treat it as
  reference only and translate every value to a token utility.

### Color (`bg-*`, `text-*`, `border-*`)
| Token | Value | Use |
|---|---|---|
| `bg` | #0D0505 | Page background |
| `surface` | #120707 | Sections & panels |
| `modal` | #150B0B | Age-verification card / dialogs |
| `input` | #1A0F0F | Form fields |
| `text` | #FFF7EE | Headings & primary copy |
| `muted` | #BFAFA7 | Body & metadata; input boundaries |
| `accent` | #FF003C | Brand punctuation: actions, kickers, rules, active nav |
| `action-aa` | #C90030 | Small ivory-on-red buttons (accent fails AA there) |
| `status` | #A7F3D0 | Event health/status only |
| `low` | #6B5A52 | Never body or essential legal text |
| `line` / `line-strong` | ivory 15% / 20% | 1px decorative hairlines |
| `line-accent` / `accent-emphasis` | red 20% / 40% | Subtle / strong red structure |

- One signal red. Red Color Study hues (#FF0000, #FF1A1A, #FF2400…) and the type
  specimen's white/gray palette are explorations — never tokens.
- Hairlines are decorative. Functional input boundaries use `border-muted`.

### Typography
- `font-display` = Space Grotesk 700 (headlines, section/card titles, heroes).
- `font-body` = Inter 400 body · 500 nav · 600 labels · 700 kickers & buttons.
- Type roles (size + line-height + tracking in one utility):
  `text-section` 48/52 −1.2px (32/36 below 768px) · `text-title` 32/36 ·
  `text-card` 24/28 · `text-legal` 20/26 · `text-accordion` 18/24 ·
  `text-body` 16/24 · `text-small` 15/22 · `text-utility` 13/18 +1px ·
  `text-kicker` 12/16 +1.8px.
- Kicker: `text-kicker font-bold uppercase text-accent`. Nav: `text-utility font-medium`.
  Buttons: `text-utility font-bold uppercase` (13px, +1px) — deviation from the guide's
  16px recipe, chosen 2026-10-20; update Figma. Keep min-h-14 targets. Legal prose: 15px / 24px.
- Heroes are page-specific: `text-hero-events` (Events/Rules 112/.88/−.04em),
  `text-hero-faq` (96/.9/−3px). Mobile heroes: `clamp(48px, 10vw, 72px)`, line-height 1,
  allow wrapping. Never apply hero compression to body text.
- Visual size never decides heading level — keep a real h1→h6 hierarchy.

### Layout & spacing
- `container` = min(1280px, 100% − 2×gutter); gutter 80 / 40 / 20px.
- Breakpoints (mobile-first): base < 768, `md:` 768–1199, `lg:` ≥ 1200.
  Below 768: one column, 56px section padding, 24px card padding.
  768–1199: two-column cards.
- Reading widths: `max-w-legal` 800, `max-w-faq` 920, `max-w-modal` 540
  (modal = min(540px, 100% − 40px), content-driven height).
- Spacing scale (Tailwind 4px steps) — only these:
  `2`=8 `3`=12 `4`=16 `5`=20 `6`=24 `8`=32 `10`=40 `12`=48 `14`=56 `16`=64
  `20`=80 `30`=120. Section padding 80–120px vertical; grid gap 24; card inset 32.
- Radius: `rounded-input` 8 (form fields) · `rounded-small` 12 · `rounded-panel` 16
  (panels, rules card) · `rounded-modal` 20 (modal/badge) · `rounded-large` 24 ·
  `rounded-pill` (pill buttons). Match the recipe; don't round everything equally.

## Components & states
- Build from the guide's patterns: nav (native links, `aria-current`), primary +
  outlined pill buttons (min-h 56px, padding 18×32, 12px icon gap), rule card
  (32px inset), event card, FAQ accordion, age gate, legal reading layout, apply form.
- Forms: 48px inputs, 8px radius, visible 11px labels with 8px gap, upload area
  140px high (max four JPG/PNG).
- States (proposed in guide): hover = surface fill + 40% red border, label underline;
  focus = 2px ivory outline, 4px offset — never remove it; disabled = native
  `disabled` + 45% opacity, no hover; error = ivory message + "!" + reason,
  `aria-invalid` + `aria-describedby`; success = check icon + text. No color-only status.

## Accessibility (acceptance checks)
- Buttons for actions, links for navigation. Native, labeled form controls.
- Accordions: keyboard-operable, `aria-expanded` / `aria-controls`.
- Dialogs: accessible name, initial focus, focus trap, return focus on close.
- Consent: never preselected; marketing/cookie consent separate from age confirmation.
- Contrast: 4.5:1 normal text, 3:1 large text & control boundaries; test text on
  every actual photo crop. No overflow at 320px or 200% zoom. Respect reduced motion.

## Assets & icons
- Use only the existing artwork exported from Figma (in `public/`). **Do not add an
  icon library** or substitute icons. Preserve round caps, 2px strokes, viewBoxes.
  Sizes: rules 20px glyph in 48px red circle · carousel 18px chevrons in 40px
  outlined control · disclosures 22px · consent check 12px in 18px box.
  Decorative SVGs `aria-hidden`; icon-only buttons need an accessible name.
- Logo: use the supplied dripping wordmark (176×50.86 nav, 180×52.02 age card) and
  48px footer mark. Never retype, recolor or stretch; 16px clear space; nav logo
  links home with accessible name "Fully Loaded".
- Photography: Events/Rules scrim left→right #0D0505 96% → 61% @52% → 18%;
  stage glow radial #FF003C 40% → transparent; FAQ imagery 35% opacity; age
  backdrop 15%. Poster corners 12–16px. Never bake UI text into images.
- Don't fabricate event data or publish placeholder legal/FAQ copy.

## Before a new component ships
- [ ] Uses semantic tokens and approved assets only
- [ ] Source values vs proposed states identified
- [ ] Keyboard, focus and screen-reader labels verified
- [ ] Text, control and image contrast checked
- [ ] 320px reflow, 200% zoom and long content tested
- [ ] Uploads, consent and legal policy reviewed with owner (site and events are 18+)
