/**
 * Book a Call — client-side validation and submission.
 *
 * Behaviour per the handoff:
 *   • validate inline on blur, one message per field
 *   • the submit button is disabled only while sending, never before first
 *     interaction
 *   • on success, redirect to the language-matched thank-you page and push the
 *     dataLayer event
 *   • on failure, surface a single form-level error and leave the values intact
 *
 * The markup is a real Netlify form with a real `action`, so with JavaScript
 * off the browser posts it and Netlify redirects to the same thank-you URL.
 * Everything here is enhancement on top of that.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/* Digits, spaces and the usual separators; at least 7 digits present. */
const PHONE_ALLOWED = /^[+()\-\s.\d]+$/;

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function errorFor(control: Control): string | null {
  const value = control.value.trim();
  const required = control.hasAttribute('required');

  if (!value) return required ? control.dataset.errorRequired || 'Required' : null;

  if (control instanceof HTMLInputElement) {
    if (control.type === 'email' && !EMAIL.test(value)) {
      return control.dataset.errorFormat ?? null;
    }
    if (control.type === 'tel') {
      const digits = value.replace(/\D/g, '');
      if (!PHONE_ALLOWED.test(value) || digits.length < 7) {
        return control.dataset.errorFormat ?? null;
      }
    }
  }
  return null;
}

function boot() {
  const form = document.querySelector<HTMLFormElement>('[data-gru-form]');
  if (!form) return;

  const submit = form.querySelector<HTMLButtonElement>('[data-gru-form-submit]');
  const formError = form.querySelector<HTMLElement>('[data-form-error]');
  const controls = Array.from(form.querySelectorAll<Control>('.field__control'));

  const thankYou = form.dataset.thankYou || '/en/thank-you/';
  const submittingLabel = form.dataset.submittingLabel || 'Sending…';
  const submitLabel = form.dataset.submitLabel || 'Book a Call';

  const setError = (control: Control, message: string | null) => {
    const field = control.closest('.field');
    const box = field?.querySelector<HTMLElement>('[data-error]');
    if (!box) return;
    if (message) {
      box.textContent = message;
      box.hidden = false;
      control.setAttribute('aria-invalid', 'true');
    } else {
      box.textContent = '';
      box.hidden = true;
      control.removeAttribute('aria-invalid');
    }
  };

  for (const control of controls) {
    control.addEventListener('blur', () => setError(control, errorFor(control)));
    /* Clear a standing message as soon as the field is being corrected —
       leaving it up while the user types reads as the fix not working. */
    control.addEventListener('input', () => {
      if (control.getAttribute('aria-invalid') === 'true') setError(control, errorFor(control));
    });
    control.addEventListener('change', () => {
      if (control instanceof HTMLSelectElement) setError(control, errorFor(control));
    });
  }

  const validateAll = () => {
    let firstInvalid: Control | null = null;
    for (const control of controls) {
      const message = errorFor(control);
      setError(control, message);
      if (message && !firstInvalid) firstInvalid = control;
    }
    return firstInvalid;
  };

  let sending = false;

  form.addEventListener('submit', async (event) => {
    if (sending) {
      event.preventDefault();
      return;
    }

    const firstInvalid = validateAll();
    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    /* Valid: take over the POST so the dataLayer push happens before we leave
       the page, and so a network failure can be reported in place. */
    event.preventDefault();
    sending = true;
    if (formError) formError.hidden = true;
    if (submit) {
      submit.disabled = true;
      submit.textContent = submittingLabel;
    }

    const body = new URLSearchParams();
    for (const [key, value] of new FormData(form).entries()) {
      body.append(key, String(value));
    }

    try {
      const response = await fetch(form.getAttribute('action') || window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      /* Netlify answers the AJAX post with a 2xx, or a 3xx it has already
         followed to the action URL. Either counts as accepted. */
      if (!response.ok && response.type !== 'opaqueredirect') {
        throw new Error(`Form POST failed: ${response.status}`);
      }

      const dataLayer = ((window as unknown as { dataLayer?: unknown[] }).dataLayer ??= []);
      dataLayer.push({
        event: form.dataset.submitEvent || 'lead_form_submit',
        form_name: form.getAttribute('name'),
        locale: (form.querySelector<HTMLInputElement>('input[name="locale"]')?.value ?? '').trim(),
        service: (form.querySelector<HTMLSelectElement>('select[name="service"]')?.value ?? '').trim(),
      });

      window.location.assign(thankYou);
    } catch {
      sending = false;
      if (submit) {
        submit.disabled = false;
        submit.textContent = submitLabel;
      }
      if (formError) {
        formError.hidden = false;
        formError.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  });
}

boot();

/* Marks this file as a module so its top-level names stay local to it. */
export {};
