// Preview origin; override SITE_URL at domain cutover.
export const siteOrigin = new URL(process.env.SITE_URL || 'https://gru-agency.mod-morsy.workers.dev').origin;
export const buildVersion = 'gru-v6-round10-cloudflare-cms-2026-09-14';
