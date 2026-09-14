# CMS setup — GitHub OAuth + Cloudinary media library

This is the one-time setup for `/admin/` (the bilingual content editor) on the `gru-agency` Cloudflare Worker. It is written from the actual code in `worker/index.ts` and `public/admin/editor.js` as of build `gru-v6-round10-cloudflare-cms-2026-09-14`, not from memory — so it should stay accurate even if this doc gets lost again.

**None of these values are secrets you paste into chat.** Everything below is entered directly into the GitHub and Cloudflare dashboards.

---

## What's already fixed in code (nothing to do)

- CMS backend: GitHub, repo `themorsy/GRU.AGENCY`, branch `main`.
- Cloudinary cloud name: `r8i4m3mq` — hardcoded in `worker/index.ts`, not configurable.
- OAuth flow: the Worker itself handles the GitHub OAuth dance at `/api/cms/auth` and `/api/cms/callback` — there is no third-party OAuth proxy to deploy.
- Media library widget: Cloudinary's **Media Library** picker (`window.cloudinary.openMediaLibrary`) — browsing/uploading happens through a signed-in Cloudinary *account session* in the browser, not an API secret. That's why the API secret is never needed here.

## What you need to set — two things

### 1. GitHub OAuth App (for `/admin/` login)

In GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App** (on the account/org that owns `themorsy/GRU.AGENCY`).

| Field | Value |
|---|---|
| Application name | GRU CMS (or similar) |
| Homepage URL | `https://gru-agency.mod-morsy.workers.dev` (current preview origin — update this app's URLs when the domain cuts over to gru.agency) |
| Authorization callback URL | `https://gru-agency.mod-morsy.workers.dev/api/cms/callback` |

GitHub gives you a **Client ID** and lets you generate a **Client Secret**. Both go into the Cloudflare Worker (not the repo, not chat):

- **Cloudflare dashboard → Workers & Pages → `gru-agency` → Settings → Variables and Secrets**
  - `CMS_GITHUB_OAUTH_CLIENT_ID` — plain variable
  - `CMS_GITHUB_OAUTH_CLIENT_SECRET` — **encrypt this one** (Cloudflare's "Encrypt" toggle when adding the variable)

Anyone who logs into `/admin/` needs **write access to the `themorsy/GRU.AGENCY` GitHub repo** — that's what the OAuth scope (`repo`) grants access through.

### 2. Cloudinary API key (for the media library)

The cloud name is fixed in code (`r8i4m3mq`) — you only need the **API key** from that Cloudinary account.

- Cloudinary dashboard → **Settings → API Keys** → copy the key (not the secret).
- Cloudflare dashboard → Workers & Pages → `gru-agency` → Settings → Variables and Secrets:
  - `CLOUDINARY_API_KEY` — plain variable (does not need encryption; it's a client-facing key by design)

**Do not set a `CLOUDINARY_API_SECRET` anywhere** — not in the Worker, not in the CMS, not in this repo, not in chat. The Media Library widget doesn't use it; if it's ever asked for, that's a sign something's misconfigured.

**Editor requirement:** anyone using the media picker in `/admin/` must be signed into a browser session on **the Cloudinary account that owns cloud name `r8i4m3mq`** — the widget opens against whatever Cloudinary account the browser is currently logged into, so it's an account-membership problem, not a code problem, if someone can't see the library.

---

## Verifying it works

1. Visit `https://gru-agency.mod-morsy.workers.dev/admin/`.
2. Log in via GitHub — should redirect to GitHub's OAuth consent screen, then back to `/admin/` signed in. If you instead see "GitHub OAuth is not configured for this CMS yet," the two `CMS_GITHUB_OAUTH_CLIENT_*` variables aren't set (or aren't saved) on the Worker.
3. Open any page entry, click **"Upload / choose media"** on an image field. If you see "Cloudinary is not configured yet. An administrator must add CLOUDINARY_API_KEY to the Cloudflare Worker," the Cloudinary variable isn't set.
4. If both are set but the media library opens empty/unauthorized, the signed-in browser session isn't on the right Cloudinary account (see editor requirement above).

## Where this lives day to day

- `/admin/` is noindex/no-store at the Worker level regardless of `SITE_INDEXABLE` — safe to leave live during preview.
- Content edited through `/admin/` writes back to `src/content/pages/*.json` via GitHub commits on `main` (through the CMS's GitHub backend) — it is the same data layer the homepage renders from, not a separate store.
- This file's source of truth is `worker/index.ts` (`/api/cms/config`, `/api/cms/auth`, `/api/cms/callback`) and `public/admin/editor.js` — if the setup ever drifts, re-derive from there rather than from memory.
