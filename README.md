# GRU Website

Marketing site for GRU — English and Arabic homepages plus their thank-you
pages, built from the `design_handoff_gru_website` bundle.

| Route | Page |
|---|---|
| `/en/` | English homepage |
| `/ar/` | Arabic homepage (RTL) |
| `/en/thank-you/` | English confirmation |
| `/ar/thank-you/` | Arabic confirmation |
| `/` | 302 to `/ar/` for Arabic-preferring browsers, `/en/` otherwise (Netlify) |

## Stack

**Astro (static) + TypeScript.** No UI framework and no client-side router: the
four pages are pre-rendered HTML, and the only JavaScript shipped is five small
modules for the header, hero video, lightbox, form and WhatsApp button. Chosen
because this is a content-driven marketing site with one form — an app
framework would add a runtime it never uses.

```bash
npm install
npm run dev       # local dev server
npm run build     # astro check + astro build -> dist/
npm run preview   # serve the built output
npm run check     # types and templates only
```

## How this is organised

```
src/
  content/        the content layer — all copy and all list data
    types.ts        LocaleContent and its parts
    site.ts         locale-independent config: phone, URLs, GTM, asset slots, flags
    en.ts / ar.ts   every user-visible string, per language
    index.ts        getContent(locale) + URL helpers
  styles/
    tokens.css      the handoff's token tables, 1:1
    fonts.css       self-hosted @font-face declarations
    global.css      reset, shared primitives (section, eyebrow, arch, buttons)
  layouts/        Base (document/SEO/GTM), HomePage, ThankYouPage
  components/     one per section, in README order
  scripts/        header, hero-video, lightbox, form, whatsapp
public/
  fonts/          Mammoth (woff2 + otf), Poppins, Cairo subsets
  assets/         logos; empty slots for video, client logos, portfolio
```

**No component contains a user-visible string.** Everything routes through
`getContent(locale)`, which is what lets final Arabic copy drop in as a diff to
`src/content/ar.ts` and nothing else. Services, stats, projects, client-value
items, method steps, nav and footer links are plain typed arrays, mirroring the
shape they had in the mockup — a CMS swap replaces `en.ts`/`ar.ts` with a
fetch and leaves the components untouched.

### Design tokens

`src/styles/tokens.css` is the single source for colour, type scale, spacing
and radii. Arabic typography works by redeclaring **the same tokens** under
`:root[lang="ar"]` — Cairo for `--ff-display`, weight 900/800, no caps, no
display tracking, looser leading. Components therefore never branch on
language. Mammoth is declared once, with a note that it is Latin-only and must
never be applied to Arabic.

Never pure white: light text and surfaces are cream `#F1EFDB`. The UA's white
form-control background is neutralised globally in `global.css`.

### Fonts

All three families are self-hosted. Mammoth was converted from the supplied
`.otf` to `.woff2` (15KB → 10KB, `.otf` kept as fallback). Poppins 300/400/500
and Cairo 300/800/900 come from Fontsource and are split by `unicode-range`, so
`/en/` never downloads Cairo and `/ar/` never downloads Mammoth or Poppins.
`font-display: swap` throughout, with the two above-the-fold faces preloaded per
locale.

## Behaviour

All of it is written natively; none of the mockup's scripts were ported.

| Behaviour | Where | Notes |
|---|---|---|
| Header hide/show | `scripts/header.ts` | Transform written straight onto the element inside a rAF — no framework state, so scrolling never re-renders. 6px delta threshold, always visible under 80px, `translateY(-160%)` ↔ `translateY(0)`. Also reveals on `hashchange` so an anchor jump never lands under a hidden header. The header is `sticky`, not `fixed`, so its height stays reserved and it cannot overlap content on upward scroll. |
| Mobile menu | `scripts/header.ts` | Esc to close, scroll lock, closes on breakpoint change so the page can't stay locked. |
| Hero video | `scripts/hero-video.ts` | Ships with **no `src`**. Sources attach after `load` in an idle slot. Skipped under reduced motion, `saveData` or 2G. |
| Logo marquee | `components/LogoMarquee.astro` | List rendered twice, track translates `-50%`, so the loop is seamless at any width. Each slot is 25% of the strip — exactly four logos per viewport. Pauses on hover and focus-within; under reduced motion the animation is off and the strip becomes scrollable so the logos stay reachable. Duplicated half is `aria-hidden`. RTL scrolls the other way. |
| Portfolio lightbox | `scripts/lightbox.ts` | Native `<dialog>` + `showModal()`, so the focus trap and Esc come from the platform. Adds overlay-click close, scroll lock and focus restore to the triggering card. All six detail panels are real HTML inside the dialog — nothing is injected — so the copy is crawlable. |
| Lead form | `scripts/form.ts` | Inline validation on blur, one message per field, `aria-invalid` + `aria-describedby`. Submit is disabled only while sending. On success: dataLayer push, then redirect to the language-matched thank-you page. |
| WhatsApp button | `scripts/whatsapp.ts` | Fixed on every page and breakpoint; steps aside while the footer is on screen so it never covers the footer's own WhatsApp CTA. |

## Forms (Netlify)

The form is plain static HTML carrying `name="gru-lead"` and
`data-netlify="true"`, so Netlify's build bot registers it at deploy time.
Submissions land under **Forms → gru-lead**; add notification recipients there.

- A hidden `locale` field distinguishes English from Arabic, so both languages
  share one inbox.
- `bot-field` honeypot is declared on the form.
- **It works with JavaScript off.** The form is a real POST whose `action` is
  the language-matched thank-you page, which Netlify honours after accepting
  the submission. `scripts/form.ts` is enhancement on top: it takes over the
  POST so the dataLayer push happens before navigation and so a network failure
  can be reported in place instead of on an error page. Both paths land on the
  same URL.

Moving off Netlify means changing one thing: the `action` and the fetch target.
Both come from `thankYouHref(locale)` and the form's own `action` attribute.

## Tracking and SEO

- **GTM** is installed site-wide from `Base.astro`. Set `site.gtmId` in
  `src/content/site.ts`. While it is the `GTM-XXXXXXX` placeholder the loader is
  skipped entirely, so no broken request is made.
- `lead_form_submit` fires on a successful submission (with `locale` and the
  chosen `service`); `generate_lead` fires on thank-you page load. They are
  separate so GTM can count the conversion once, on the thank-you page.
  Note: the conversion event fires on every load of that page, as specced — if
  a browser refresh double-counting matters, dedupe in GTM.
- **hreflang** `en` / `ar` / `x-default` on all four pages, both directions.
- **Canonical** per page; thank-you pages are `noindex, follow` and excluded
  from the sitemap and robots.txt.
- **Sitemap** at `/sitemap-index.xml`, covering `/en/` and `/ar/` with their
  hreflang alternates.
- **Structured data** on the homepages: `Organization`, `LocalBusiness`,
  `WebSite`. `BreadcrumbList` belongs here once service and case-study pages
  exist.
- **Search Console**: put the HTML-tag token in `site.searchConsoleToken`.
- Set the real origin in **two** places when the domain is live:
  `site.origin` and `site` in `astro.config.mjs`.

## Accessibility — verified, not assumed

Checked in headless Chromium across `/en/` and `/ar/` at 1440 and 375, and on
an emulated touch device:

- **Contrast: 0 failures.** Every text node measured against its computed
  background, with alpha composited, at the 4.5:1 / 3:1 thresholds.
- **Tap targets:** 0 targets under 44px tall on a coarse pointer.
- Visible focus rings on every link, pill, field and the lightbox close button;
  cream rings on dark grounds.
- Lightbox traps focus and restores it to the card that opened it.
- Every arch is `aria-hidden` (18 per homepage).
- Exactly one `<h1>` per page; section titles are `<h2>`, service and step
  names `<h3>`. Where a section has no visible title by design (Proof, Who We
  Are) the `<h2>` is present but visually hidden, so the outline is complete
  without changing the layout.
- No horizontal scroll at 375.
- The hero scrim is what holds body text over arbitrary video frames. Don't
  remove it.

## Two spec conflicts, resolved

Both are documented in the code at the point of the change.

1. **Mobile service pills.** The handoff specifies `7px 14px` at 13px (≈31px
   tall) *and* tap targets never under 44px. The 14px horizontal padding is
   kept and `min-height` lifted to 44px, so vertical padding grows.
2. **Footer link targets.** The designed footer rhythm (14px text on a 12px
   gap) tops out at a 36px pitch — 44px targets are geometrically impossible
   without changing it. Under `@media (pointer: coarse)` the gap tightens to
   4px and the links grow to a full 44px; on a mouse the designed rhythm is
   kept, which still clears WCAG 2.2 AA's 24px floor.

## Three deliberate deviations

1. **`--quiet` `#6B6B5E` → `#666659`.** The spec value is 4.66:1 on cream but
   only **4.20:1 on the tint surface**, where it is also used — under the 4.5:1
   the handoff requires. Darkened 5 per channel: 5.02:1 on cream, 4.53:1 on
   tint. Imperceptible next to the original.
2. **Footer column labels 45% → 50% cream.** 45% is 4.04:1 on `#0B0B0B`; 50% is
   4.75:1, and 50% is already one of the opacities in the handoff's own
   cream-on-dark scale.
3. **Method card inline padding 30px → 24px, step title `min(20px, 10.1cqi)`.**
   "UNDERSTAND" in Mammoth 20px measures 196.7px; 30px padding leaves 189.6px
   at 1440, and **the mockup itself breaks it mid-word as "UNDERSTAN / D"**.
   24px gets the title to a full 20px on one line. The `cqi` cap then
   guarantees no step title breaks mid-word at any in-between width, since
   Mammoth sets that word at 9.84× the font size.

Also: the five-across skyline is a 1440 composition and the page is capped at
1440, so below that the row goes three-up and level, two-up under 768, stacked
under 480. Small placeholder captions run through `--fs-micro`, which lifts
them to the 12px floor on mobile.

## Open decisions, recorded as flags in `src/content/site.ts`

| Flag | Current | Meaning |
|---|---|---|
| `servicePagesLive` | `false` | Service pages don't exist yet, so shipping `/en/services/seo/` would be 20 live 404s. Every service keeps its slug in the content layer; the pills point at `#lead` until this is `true`. |
| `caseStudiesLive` | `false` | Same arrangement for per-project case-study pages. |
| `useAlternativeH1` | `false` | The client supplied a second English H1 ("Marketing built around growth, not guesswork."). The mockup ships the hero headline as the H1; flip this to promote the alternative. |
| `arabicIndicNumerals` | `false` | Arabic pages use Western digits (400+, 2021). The Arabic-Indic values the mockup drew are kept in comments in `ar.ts`. |

Note on copy: the hero supporting paragraph reads **"We combines strategy,
creative, performance and production…"** — reproduced verbatim from the copy
sheet, which the brief names as the source of truth. It is a grammatical error
on the H1 fold. Fixing it is a one-word change in `en.ts`.

## Still needed from the client

Each has a working slot; nothing 404s or errors while they are outstanding.

| Asset | Where it goes |
|---|---|
| Hero showreel + poster frame | `site.heroVideo` — set `sources` and `poster`. Until then the hero renders the marked slot with **zero** network cost. |
| Client logo files | `site.clientLogos` — eight slots, `src: null` renders the placeholder. Real files get `loading="lazy"` and greyscale-to-colour on hover. |
| Six portfolio visuals | `image` / `imageAlt` on each project in `en.ts` and `ar.ts`. 4/3, lazy-loaded, arch-topped. |
| Case-study content | `summary` and `caseStudyHref` per project; flip `caseStudiesLive`. |
| Final Arabic copy | `src/content/ar.ts`. Only `seo.title` and `hero.headline` are approved; everything else is marked draft. |
| Social icon set | `site.socials` already carries an `icon` key per entry. Links render as text labels today, exactly as the design shows them. |
| TikTok URL | `site.socials` — renders as plain text, not a dead link, while `href` is `null`. |
| Arabic numerals decision | `site.arabicIndicNumerals`. |
| GTM container ID | `site.gtmId`. |
| Search Console token | `site.searchConsoleToken`. |
