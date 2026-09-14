# GRU CMS restoration handoff

**Build:** `gru-v6-round10-cloudflare-cms-2026-09-14`  
**Scope:** `D:\GRU\GRU Project AI\gru-cloudflare-canonical` only  
**Publish state:** local implementation only. No commit, push, pull request, deployment, DNS change, or provider configuration change was made.

## 1. Rollback and baseline

- Rollback archive: `.qa/cms-restore-2026-09-14/before-cms-source.zip`
- SHA-256: `A54179BCD1E08A14E15D39659C7270D3C082BEF72F3EA4210AD2E015935503DF`
- Baseline before the CMS change: Astro check had 0 errors/warnings/hints; 11 tests passed; 281 generated-page/content/SEO/accessibility checks passed.
- The rollback comparison confirms these public files are byte-for-byte unchanged: global CSS, homepage content, Hero, Header, Proof, Method, Portfolio, LeadForm, page script, Base layout, homepage route, and campaign route. Evidence: `.qa/cms-restore-2026-09-14/public-source-comparison.json`.

## 2. What changed by file

| File | Change |
|---|---|
| `src/pages/admin/index.astro` | Restored the `/admin/` route, `noindex, nofollow` markup, admin-only Decap/Cloudinary dependencies, and the React compatibility globals required by the preserved custom editor control. |
| `src/pages/admin/template.json.ts` | Exposes the current homepage entry from the existing `pages` collection as the campaign template, with `no-store` and `X-Robots-Tag: noindex, nofollow`. |
| `public/admin/editor.js` | Restored the bilingual section editor against `src/content/pages`; provides English only / Arabic only / Both filters, section reordering, variable projects/gallery items, draft/published state, campaign creation, accessible-media validation, Cloudinary picker integration, and Cloudflare OAuth configuration. |
| `public/admin/editor.css` | Restored the editor UI. Arabic fields use Arabic Typesetting in RTL; technical values use an LTR monospace stack. Mammoth is not loaded by the CMS. |
| `worker/index.ts` | Adds `/api/cms/config`, `/api/cms/auth`, and `/api/cms/callback`; OAuth state-cookie validation; token exchange; and noindex/nofollow, no-store enforcement for `/admin/*` and `/api/cms/*`. |
| `tests/cms.test.mjs` | Adds CMS route, OAuth-state, secret-exposure, language/filter, reordering, campaign, and media-validation coverage. |
| `scripts/test-campaign-build.mjs` | Updates the campaign fixture to verify the current visible, enabled contact form and WhatsApp link. |
| `scripts/capture-cms-regression.mjs` | Captures EN/AR public screenshots and computed-style data at 390px and 1440px. |
| `CMS-SETUP.md` | Exact GitHub OAuth, Cloudflare variable, Cloudflare Access, Cloudinary, and acceptance setup instructions. |
| `README.md`, `site.config.mjs` | Documents the restored CMS and updates the local build marker. |

## 3. Local CMS and Worker URLs

- CMS route: `http://127.0.0.1:4333/admin/` when the local Worker is running.
- Homepage template: `http://127.0.0.1:4333/admin/template.json`
- Cloudinary configuration: `http://127.0.0.1:4333/api/cms/config`
- OAuth entry: `http://127.0.0.1:4333/api/cms/auth`

## 4. What works now, without OAuth

- `/admin/`, the current-content template route, and CMS configuration route build and serve through the local Cloudflare Worker.
- Admin and CMS API responses are `noindex, nofollow` and `no-store`.
- The template uses the current `src/content/pages/home.json` content. Campaign pages use the same collection/schema and render through the existing `[lang]/[slug]` route.
- The editor implementation supports the requested language filter, editable sections, list reorder/add/remove controls, variable project/gallery counts, draft/published state, campaign slugs, language availability, and media/alt validation.
- Cloudinary cloud name is fixed as `r8i4m3mq`; no Cloudinary credential is committed.
- The lead form is visible and enabled. It sends once `RESEND_API_KEY`, `LEAD_FROM`, and `LEAD_TO` are supplied as Worker settings; until then the Worker rejects delivery safely with a clear error.

## 5. What remains unavailable until provider setup

- GitHub login and content saving: `/api/cms/auth` intentionally returns `503` until the GitHub OAuth client ID and secret are configured as Worker variables.
- Cloudinary Media Library selection/upload: requires `CLOUDINARY_API_KEY` and an editor signed in to the matching Cloudinary account. The Cloudinary API secret is not used.
- Public content updates: a CMS save commits the existing JSON file through the authenticated editor’s GitHub account. The Worker must then run the normal repository build/deploy pipeline before the changed content is public.
- Live lead delivery: requires `RESEND_API_KEY`, `LEAD_FROM`, and `LEAD_TO` in Cloudflare. The form is enabled now; delivery cannot be claimed until a provider-backed inbox test succeeds.
- The full third-party admin UI could not be mounted in this sandbox because its external CDN scripts were network-denied. Local route, build, static configuration, and Worker/OAuth behavior were tested; a real browser acceptance run after provider setup remains required.

## 6. Exact setup steps

Follow [CMS-SETUP.md](CMS-SETUP.md). The essential production configuration is:

1. Create a GitHub OAuth App with homepage URL `https://YOUR-CANONICAL-DOMAIN/admin/` and callback URL `https://YOUR-CANONICAL-DOMAIN/api/cms/callback`.
2. Add Worker variable `CMS_GITHUB_OAUTH_CLIENT_ID` and Worker secret `CMS_GITHUB_OAUTH_CLIENT_SECRET` in Cloudflare.
3. Add Worker variable `CLOUDINARY_API_KEY`; do not add a Cloudinary API secret.
4. Give editors GitHub write access to `themorsy/GRU.AGENCY`. The CMS uses those accounts; it does not store a username or password.
5. Recommended: configure Cloudflare Access over `/admin/*` and `/api/cms/*` with an allow-list of editor emails and one-time email PIN or an organisation identity provider.
6. Confirm the repository-to-Cloudflare deployment pipeline rebuilds the Worker after an editor content commit before enabling routine publishing.
7. Add Resend secret `RESEND_API_KEY` plus Worker variables `LEAD_FROM` and `LEAD_TO`, then complete the localized inbox acceptance test described in the README.

## 7. Acceptance and regression results

| Check | Result |
|---|---|
| `npm run build` | Pass: 0 errors, 0 warnings, 0 hints; `/admin/` and `/admin/template.json` emitted. |
| Asset/font contract | Pass: 8 CSS references and 7 real WOFF2 declarations verified. |
| `npm test` | Pass: 16/16, including five CMS/OAuth/security tests. |
| `node scripts/validate-build.mjs` | Pass: 281 checks. |
| `node scripts/test-campaign-build.mjs` | Pass: campaign section order, project/gallery counts, one H1, language-only route, canonical, sitemap, and enabled-form behavior. |
| Local Worker routes | Pass: `/admin/`, template, config are 200/noindex,nofollow/no-store; OAuth is correctly 503 until configured; EN/AR remain 200 with their existing cache/indexing headers. A valid local form POST correctly returns 503 with its error state until Resend settings exist. Evidence: `.qa/cms-restore-2026-09-14/worker-route-results-enabled-form.json`. |
| Public browser regression | Pass: 390px and 1440px in EN and AR have one H1, expected section order, no horizontal overflow, four portfolio cards/images, visible enabled form, and retained desktop/mobile hero sources. |

Computed-style samples are in `.qa/cms-restore-2026-09-14/public-regression-after.json`; screenshots are `public-after-en-390.png`, `public-after-ar-390.png`, `public-after-en-1440.png`, and `public-after-ar-1440.png` in the same directory.

## 8. Security and secret handling

- No Cloudinary secret, GitHub OAuth secret, Resend key, or old Cloudinary key is in the restored source.
- OAuth client secret is read only from the Worker environment, never sent to the browser, and the OAuth state is validated through a short-lived `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- The callback sends only the GitHub access token required by the CMS popup protocol to its opener on the same origin.
- Admin/API routes force `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`; existing Worker security headers still apply.
- Cloudinary’s API key is public integration configuration, not a secret. It is intentionally kept out of the repository and supplied through the Worker environment. Cloudinary API secret is never used.

## 9. Deviations and conflicts

- The round 3 handoff deferred CMS. This request explicitly overrides that decision; all round 3 public-site files remain unchanged.
- The old editor referenced Netlify OAuth and a hardcoded Cloudinary key. It was adapted to the existing Cloudflare Worker OAuth endpoints and Worker-provided Cloudinary key. No Netlify dependency was restored.
- An earlier instruction mentioned Sukar. The later direct instruction chose Arabic Typesetting; the CMS and public site retain Arabic Typesetting.
- The earlier CMS brief asked for a visible but disabled lead form until Resend was configured. The later direct instruction overrides it: the form is enabled in both languages, while the Worker continues to reject an undeliverable submission until the three Resend settings are present.
- A live GitHub OAuth/Cloudinary editor save was not run because no provider credentials were configured and no credentials were accepted in chat. This is intentionally reported as pending rather than passed.
