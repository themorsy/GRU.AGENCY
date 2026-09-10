# GRU: GitHub and Netlify setup

This package contains the complete Codex version of the GRU website. GitHub stores the project; Netlify builds and publishes its HTML and handles the lead forms. No command-line tools are needed for these steps.

## 1. Upload to your existing GitHub repository

1. Extract gru-github-upload.zip using Windows Extract All.
2. Open the extracted folder until you can see package.json, netlify.toml, src and public together.
3. Open your existing gru repository on GitHub.
4. If empty, click "uploading an existing file". Otherwise choose Add file > Upload files.
5. Drag ALL the contents of the extracted folder onto the upload page. Upload the contents, not the ZIP and not its enclosing folder. Include src and public with all their contents.
6. Enter the commit message "Add GRU website" and click Commit changes.
7. Confirm package.json and netlify.toml are visible directly on the repository's main page. If they are inside a gru-github-upload subfolder, the upload is one level too deep.

The package contains fewer than 100 files, within GitHub's per-upload count limit. Do not add node_modules, .astro, dist or secret .env files.

## 2. Publish through Netlify

1. Sign in to Netlify.
2. Choose Add new project > Import an existing project > GitHub.
3. Authorize access to your gru repository and select it.
4. Use the main branch (or your repository's default branch).
5. Confirm these settings:
   - Base directory: leave blank
   - Build command: npm run build
   - Publish directory: dist
6. Publish the project. Node 24, your domain and GTM-54CQR8HS are already configured in netlify.toml.
7. Open the supplied netlify.app address and check /en/, /ar/, /en/thank-you/ and /ar/thank-you/.

Do not enable GitHub Pages for this workflow. Netlify is the website host. Future commits to the connected branch automatically trigger a new Netlify build.

## 3. Enable lead emails

1. Open the Netlify project's Forms area and enable form detection if it is disabled.
2. If you enabled detection after the first build, trigger a new deploy from the Deploys area.
3. Confirm Netlify lists gru-lead-en and gru-lead-ar.
4. Open Project configuration > Notifications > Emails and webhooks > Form submission notifications.
5. Add an email notification to info@gru.agency for all forms, or add one for each language form.
6. Submit one test lead from each language on the deployed site. Confirm the matching thank-you page opens, the submission appears in Netlify, and the notification reaches info@gru.agency.

Netlify sends the notification; no email API key is required. You still need an existing mailbox at info@gru.agency to receive it. The local preview deliberately does not send leads. Publishing this project only on GitHub Pages or Cloudflare Pages will not activate Netlify Forms.

## 4. Connect gru.agency

After testing the Netlify address, open the project's Domain management area and add gru.agency as the production domain. Follow the exact DNS records Netlify provides at your domain's current DNS provider. If Cloudflare manages your DNS, you can keep it there. Preserve existing email MX and TXT records. Wait for Netlify to confirm the domain and HTTPS certificate.

## 5. Remaining launch content

The final hero showreel, poster, client logos and portfolio visuals still need to be supplied. The video fills the hero behind the headline and gradient. Add files under public/assets and update the corresponding entries in src/content/en.json and src/content/ar.json. Arabic draft copy and the TikTok link also need final review.

GTM-54CQR8HS is installed. Configure and publish the desired conversion tag in GTM using the generate_lead custom event, then verify it in GTM Preview. The thank-you pages already exist in both languages.

## Where are the HTML files?

In the working project, the generated files are:
- gru-website-codex/dist/en/index.html
- gru-website-codex/dist/ar/index.html
- gru-website-codex/dist/en/thank-you/index.html
- gru-website-codex/dist/ar/thank-you/index.html

The root dist/index.html only redirects to English. An individual HTML file is not the complete website: it needs its CSS, scripts, fonts and assets. This upload package intentionally contains the editable source. Netlify generates and publishes the full dist folder during its build, with live form submission enabled.

## Official help

- GitHub uploads: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Netlify repository setup: https://docs.netlify.com/start/quickstarts/deploy-from-repository/
- Netlify form detection: https://docs.netlify.com/manage/forms/setup/
- Netlify email notifications: https://docs.netlify.com/manage/forms/notifications/
