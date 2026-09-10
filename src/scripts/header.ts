/**
 * Header hide/show + mobile menu.
 *
 * Spec (handoff §1 and the Interactions table):
 *   hide on scroll down, show on scroll up
 *   translateY(-160%) when hidden, translateY(0) when shown
 *   transition: transform .32s ease   (declared in the component's CSS)
 *   ignore scroll deltas under 6px
 *   always visible while scrollY < 80
 *   the header transition is disabled under prefers-reduced-motion
 *
 * The transform is written directly to the element inside a rAF, and no state
 * lives anywhere a framework could observe, so scrolling never re-renders the
 * page. Deliberately not a port of the mockup's inline script.
 */

const HIDDEN = 'translateY(-160%)';
const SHOWN = 'translateY(0)';
const DELTA = 6;
const ALWAYS_SHOW_ABOVE = 80;

function initHeader(header: HTMLElement) {
  let last = window.scrollY;
  let hidden = false;
  let queued = false;

  const apply = () => {
    queued = false;
    const y = window.scrollY;
    const delta = y - last;

    if (Math.abs(delta) < DELTA) return;

    const shouldHide = delta > 0 && y > ALWAYS_SHOW_ABOVE && !isMenuOpen();
    if (shouldHide !== hidden) {
      hidden = shouldHide;
      header.style.transform = hidden ? HIDDEN : SHOWN;
    }
    last = y;
  };

  const onScroll = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(apply);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  /* An in-page anchor jump must never leave the header hidden over the target. */
  window.addEventListener('hashchange', () => {
    hidden = false;
    header.style.transform = SHOWN;
    last = window.scrollY;
  });

  return {
    reveal() {
      hidden = false;
      header.style.transform = SHOWN;
    },
  };
}

/* ---- Mobile menu ------------------------------------------------------- */

let menuOpen = false;
function isMenuOpen() {
  return menuOpen;
}

function initMenu(toggle: HTMLButtonElement, panel: HTMLElement, reveal: () => void) {
  const srLabel = toggle.querySelector<HTMLElement>('[data-label-open]');
  const labelOpen = srLabel?.dataset.labelOpen ?? 'Open menu';
  const labelClose = srLabel?.dataset.labelClose ?? 'Close menu';

  const setOpen = (open: boolean) => {
    menuOpen = open;
    panel.hidden = !open;
    panel.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
    if (srLabel) srLabel.textContent = open ? labelClose : labelOpen;
    if (open) reveal();
  };

  toggle.addEventListener('click', () => setOpen(!menuOpen));

  panel.querySelectorAll<HTMLElement>('[data-gru-menu-link]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
      setOpen(false);
      toggle.focus();
    }
  });

  /* Leaving the mobile breakpoint must not leave the page scroll-locked. */
  const mq = window.matchMedia('(min-width: 1024px)');
  mq.addEventListener('change', (e) => {
    if (e.matches && menuOpen) setOpen(false);
  });
}

function boot() {
  const header = document.querySelector<HTMLElement>('[data-gru-header]');
  if (!header) return;

  const { reveal } = initHeader(header);

  const toggle = header.querySelector<HTMLButtonElement>('[data-gru-menu-toggle]');
  const panel = header.querySelector<HTMLElement>('[data-gru-menu]');
  if (toggle && panel) initMenu(toggle, panel, reveal);
}

boot();

/* Marks this file as a module so its top-level names stay local to it. */
export {};
