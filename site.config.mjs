// Production is the default origin so a release build is canonical and indexable on
// gru.agency. Build the preview with `npm run build:preview` (or SITE_URL=...).
export const productionOrigin = 'https://gru.agency';
export const siteOrigin = new URL(process.env.SITE_URL || productionOrigin).origin;
export const buildVersion = 'gru-v6-round11-release-candidate-2026-10-29';
