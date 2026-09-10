/* ---------------------------------------------------------------------------
   Content layer entrypoint. Components take a LocaleContent object; they never
   import en.ts or ar.ts directly, and never contain a user-visible string.
   --------------------------------------------------------------------------- */

import { en } from './en';
import { ar } from './ar';
import { site } from './site';
import type { Locale, LocaleContent, ServiceItem } from './types';

export { site };
export type { Locale, LocaleContent };
export * from './types';

const content: Record<Locale, LocaleContent> = { en, ar };

export function getContent(locale: Locale): LocaleContent {
  return content[locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ar' : 'en';
}

/** Homepage URL for a locale. */
export function homeHref(locale: Locale): string {
  return `/${locale}/`;
}

/** Thank-you URL for a locale — the form redirects here on success. */
export function thankYouHref(locale: Locale): string {
  return `/${locale}/thank-you/`;
}

/**
 * Resolves a service to a URL. Service pages do not exist yet, so while
 * site.servicePagesLive is false every pill points at the lead form instead of
 * a 404. The slug is still carried in the content layer, so turning the flag on
 * activates /<locale>/services/<slug>/ everywhere at once.
 */
export function serviceHref(locale: Locale, item: ServiceItem): string {
  return site.servicePagesLive ? `/${locale}/services/${item.slug}/` : '#lead';
}

/** Same arrangement for per-project case-study pages. */
export function caseStudyHref(locale: Locale, slug: string, explicit: string | null): string | null {
  if (explicit) return explicit;
  return site.caseStudiesLive ? `/${locale}/work/${slug}/` : null;
}

/** Flat list of every service label, for the form's "Service Interested In". */
export function serviceOptions(c: LocaleContent): { group: string; options: string[] }[] {
  return c.services.categories.map((cat) => ({
    group: cat.label,
    options: cat.items.map((i) => i.label),
  }));
}
