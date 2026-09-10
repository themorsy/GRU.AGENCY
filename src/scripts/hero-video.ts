/**
 * Defers the hero showreel so it can never delay first paint.
 *
 * The <video> ships with no src at all. Sources are attached after the load
 * event (and after an idle slot when the browser offers one), then playback
 * starts. The poster carries the hero until then, and the black ground carries
 * it if the poster is missing too.
 *
 * Skipped entirely under prefers-reduced-motion or on a metered/slow
 * connection, where the poster stays as the hero image.
 */

type Source = { src: string; type: string };

function attach(video: HTMLVideoElement) {
  let sources: Source[] = [];
  try {
    sources = JSON.parse(video.dataset.sources ?? '[]');
  } catch {
    return;
  }
  if (!sources.length) return;

  for (const s of sources) {
    const el = document.createElement('source');
    el.src = s.src;
    el.type = s.type;
    video.appendChild(el);
  }
  video.preload = 'auto';
  video.load();
  video.play().catch(() => {
    /* Autoplay refused (some mobile power-saving modes). Poster remains. */
  });
}

function boot() {
  const video = document.querySelector<HTMLVideoElement>('[data-gru-hero-video]');
  if (!video) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (conn?.saveData) return;
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;

  const start = () => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void })
      .requestIdleCallback;
    if (idle) idle(() => attach(video));
    else setTimeout(() => attach(video), 200);
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}

boot();

/* Marks this file as a module so its top-level names stay local to it. */
export {};
