# GRU — Codex revision

This is Codex's independent working copy. Claude's `../gru-website` folder and its port 4321 preview are separate. Do not merge the folders while either tool is editing them.

## Review

Run `npm ci`, then `npm run dev`. This copy uses **http://127.0.0.1:4322/en/**, with Arabic at `/ar/` and confirmation pages at `/en/thank-you/` and `/ar/thank-you/`.

## Requested visual corrections

- Removed the visible Pause motion button. The client-logo strip still pauses on hover and stops for reduced-motion preferences.
- Proof now has a 16px gap between its opener and counters. The stats align to the top: a wrapping middle counter no longer pushes the other two down by an extra line.
- Desktop headline measurements match the handoff: Mammoth 72px hero, 60px section titles, 52px stats. Arabic uses Cairo with the handoff's separate scale. Desktop sizes remain in place above the mobile breakpoint.
- Restored the marked hero showreel slot using the reference's placeholder copy. The final video fills the entire hero behind the gradient and headline, with `object-fit: cover`, muted looping playback, and deferred loading. Mobile placeholder placement and stacked CTAs follow the mobile reference.
- All copy remains in `src/content/en.json` and `src/content/ar.json`. Western digits and GTM `GTM-54CQR8HS` remain configured.

`src/styles/global.css` preserves the stylesheet from Codex's last validated build before the shared folder was replaced. The targeted revisions are isolated and documented in `src/styles/refinements.css`. All referenced font files are self-hosted in `public/`.

## Supply the video

Place the completed showreel and its poster under `public/assets/`, then set `hero.video` and `hero.poster` in both JSON files. The build requires a poster whenever a video is configured. Until then the visible placeholder explains the slot. Three source clips were found in the shared Showreel Materials folder, but none was identified as the approved final agency showreel; they have not been substituted.

Client logos and the six project images remain the requested client-supplied slots. Populate `proof.logos` and `portfolio.projects` in both content files.

## Forms and launch

The site is prepared for Netlify Forms. Netlify must detect `gru-lead-en` and `gru-lead-ar` at deployment. Configure email notifications for both forms to **info@gru.agency**. Netlify's hosted build sets `NETLIFY=true`; local preview intentionally refuses to claim delivery or redirect after a valid form submission.

Canonical domain: `https://gru.agency`. GTM is site-wide; successful submissions count once through the matching thank-you page. Search Console token (`PUBLIC_GOOGLE_SITE_VERIFICATION`), final Arabic copy, final media, and TikTok URL remain outstanding. Social URLs are the supplied values; remote verification was previously unavailable.

## Validation

```sh
npm run check
npm test
npm run build
npm run validate
```

The revised English desktop (1440px) and English/Arabic mobile (375px) layouts were inspected in the browser. Desktop hero and section heading font sizes, Proof's actual 16px gap, absence of the pause control, and absence of horizontal overflow were checked. The reference itself was read from its source because the browser blocked its local file URL; full screenshot-to-screenshot comparison against all five original tabs remains unavailable.

Brand contrast exceptions from the first build are retained: muted labels on tint use #626256 (4.81:1), and faint footer labels use a stronger cream opacity. Marketing copy remains verbatim, including “We combines…”.

This revision is local. No public deployment, DNS change, or email transmission was performed.
