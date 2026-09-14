# GRU — Cloudflare review build

The repository root is the only website project. It replaces the older deployed implementation with the approved Codex :4331 source. Do not add a second project tree.

## Build and preview

Use Node 22.23.2 or newer supported by the locked dependencies. Run `npm ci`, `npm run build`, `npm test`, and `npm run validate`. For the static site use `npm run dev` (4332). For real redirect/header/form behavior use `npm run worker:dev` after building (4333). Astro's development server does not run the Worker.

Cloudflare Workers Static Assets uses `wrangler.jsonc`, root build command `npm run build`, output `dist`, and Worker `gru-agency`. No deployment is performed by the build command. `netlify.toml` is inert.

## Content and assets

`src/content/pages/home.json` is the authoritative bilingual homepage content. Section order, projects and their gallery arrays remain data driven. `/admin/` restores the bilingual editor for this same content layer and for campaign files in `src/content/pages/`; it does not introduce a parallel content store. See [CMS-SETUP.md](CMS-SETUP.md) before enabling editor access.

Place client-owned media under `public/assets/` or use the approved media URLs in content. Set hero video and poster together. Client logos, project visuals, showreel and social share artwork remain outstanding. No generated showcase assets ship here. Copy is unchanged, including the deliberate “We combines…” wording. Careers remains removed, TikTok remains present, Arabic uses Western numerals.

## Origin and indexing

`site.config.mjs` is the single origin source, overridable with `SITE_URL`. The current default is the Worker preview origin. All four pages have canonical and alternate-language links. The two thank-you pages have noindex meta and are excluded from the sitemap. All preview responses also carry noindex headers. Do not remove staging noindex or switch the origin until the domain cutover is approved.

`/_astro/` files are content hashed and cached immutable for a year. Unhashed `/fonts/` compatibility URLs revalidate so replacements can reach returning visitors. All fonts are self-hosted with `font-display: swap`.

## Lead delivery: enabled and ready for Resend

Hostinger continues to receive email. Resend will send website notifications via the Worker HTTP handler at `/api/lead`. No SMTP or Hostinger mailbox password is used.

1. Create the Resend account and a sending API key. Store it as Cloudflare Worker secret `RESEND_API_KEY`; never put it in this repository or chat.
2. Configure `LEAD_FROM` with an approved sender and `LEAD_TO` with the permitted sandbox recipient for testing. After sender-domain verification, the intended recipient is `info@gru.agency`. Preserve Hostinger MX, SPF, DKIM and DMARC; no DNS changes are included in this build.
3. `LEAD_FORM_ENABLED=true` and `leadFormLive=true` are already enabled in this build. Before deployment, add the three Worker settings above. Without them, the visible form safely returns an error instead of accepting a lead it cannot deliver.
4. Submit each localized form with identifiable test details. Verify the POST returns 303, redirects to the same-language thank-you page, and an email containing every field arrives. Check junk/spam too. A successful mock or provider API response does not prove inbox delivery.

The handler includes server validation, a hidden honeypot, 20 KB request limit, IP rate limiting (5/minute per binding location), and input preservation on error. `generate_lead` is an attempt interaction; only confirmed success should count as a conversion. GTM `GTM-54CQR8HS` stays unchanged; tag firing and analytics receipt require separate live verification.

## September 13 review

Approved changes are now local: Proof uses an 8px number/label gap and independent 1.1 stat leading; EN desktop navigation remains Mammoth at13px (Poppins proposal declined); Arabic uses Arabic Typesetting with the approved larger, bold RTL scale; mobile navigation stays24px. Method numbers/arches use approved #2F8A4D at full opacity; cream28% card borders are decorative. Section rhythm is112/96/72px. Mammoth loads a hashed WOFF2 with OTF fallback.

The build gate checks real font family/weight metadata, WOFF2 coverage and expected families, and lists unreferenced assets. No unused files were removed. MammothOutline is preserved in design-assets/fonts, outside the website output; its exclusion from the published type system awaits confirmation.

See REVIEW-2026-09-13.md for measurements, the incremental diff, the mobile/tablet FAB proposal and unverified live delivery. No commit, push, PR, DNS change or deployment was made in this review.

