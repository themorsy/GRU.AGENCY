/**
 * Portfolio lightbox.
 *
 * Built on the native <dialog> element, so the focus trap and Esc-to-close
 * come from the platform: showModal() confines Tab to the dialog's subtree and
 * the `cancel` event fires on Esc. What is added here is the rest of the spec:
 *
 *   • close on overlay click (a click whose target is the dialog box itself,
 *     i.e. outside the panel)
 *   • body scroll lock while open
 *   • focus restored to the card that opened it
 *   • the panel for the selected project revealed, the others left hidden
 *
 * All six panels already exist in the HTML — nothing is injected — so the copy
 * stays crawlable.
 */

const LOCK = 'is-locked';

function boot() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-gru-lightbox]');
  if (!dialog) return;

  const panels = Array.from(dialog.querySelectorAll<HTMLElement>('[data-panel]'));
  const visuals = Array.from(dialog.querySelectorAll<HTMLElement>('[data-panel-visual]'));
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-gru-lightbox-close]');
  let opener: HTMLElement | null = null;

  const show = (slug: string) => {
    for (const p of panels) p.hidden = p.dataset.panel !== slug;
    for (const v of visuals) v.hidden = v.dataset.panelVisual !== slug;
  };

  const open = (slug: string, trigger: HTMLElement) => {
    opener = trigger;
    show(slug);
    document.body.classList.add(LOCK);
    /* showModal is what installs the focus trap; a plain `open` attribute
       would leave the page behind it reachable by Tab. */
    dialog.showModal();
    closeBtn?.focus();
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  document.querySelectorAll<HTMLElement>('[data-gru-lightbox-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.dataset.gruLightboxOpen;
      if (slug) open(slug, btn);
    });
  });

  closeBtn?.addEventListener('click', close);

  /* Overlay click: the dialog element fills the viewport and the visible panel
     is a child, so a click that lands on the dialog itself is a click outside
     the panel. */
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove(LOCK);
    for (const p of panels) p.hidden = true;
    for (const v of visuals) v.hidden = true;
    opener?.focus();
    opener = null;
  });
}

boot();

/* Marks this file as a module so its top-level names stay local to it. */
export {};
