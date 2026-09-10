/**
 * Keeps the floating WhatsApp button clear of the footer's own WhatsApp CTA.
 *
 * While any part of the footer is in the viewport the button steps aside; it
 * returns as soon as the footer leaves. Without JavaScript, or without
 * IntersectionObserver, the button simply stays where it is — the safe default,
 * since the requirement is that it is always present.
 */
function boot() {
  const fab = document.querySelector<HTMLElement>('[data-gru-wa]');
  const footer = document.querySelector<HTMLElement>('[data-gru-footer]');
  if (!fab || !footer || typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        fab.dataset.tucked = String(entry.isIntersecting);
      }
    },
    { rootMargin: '0px 0px -40px 0px' },
  );

  observer.observe(footer);
}

boot();

/* Marks this file as a module so its top-level names stay local to it. */
export {};
