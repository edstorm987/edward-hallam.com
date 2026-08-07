const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const waitingListButtons = document.querySelectorAll('[data-waiting-list]');
const novemCloseBtn = document.getElementById('novem-close-modal');
const novemModal = document.getElementById('novem-modal');
const novemForm = document.getElementById('novem-form');
const novemFeedback = document.getElementById('novem-feedback');
const novemEmailInput = document.getElementById('novem-email');
const novemModalTitle = document.getElementById('novem-modal-title');
const novemModalDescription = document.getElementById('novem-modal-description');
const contactOpenBtn = document.getElementById('contact-open-modal');
const contactCloseBtn = document.getElementById('contact-close-modal');
const contactModal = document.getElementById('contact-modal');
const contactForm = document.getElementById('contact-form');
const contactFeedback = document.getElementById('contact-feedback');
const contactNameInput = document.getElementById('contact-name');
const contactNumberInput = document.getElementById('contact-number');
const contactMessageInput = document.getElementById('contact-message');
const discordOpenBtn = document.getElementById('discord-open-modal');
const discordCloseBtn = document.getElementById('discord-close-modal');
const discordModal = document.getElementById('discord-modal');
const enquiryEndpoint = window.EDWARD_ENQUIRY_ENDPOINT || 'https://aqua-crm.com/api/public/brand-enquiry';

let pendingSubject = 'Waiting List';

async function submitEnquiry(payload, consent) {
  if (!consent) throw new Error('Please agree so I can use your details to reply.');
  const response = await fetch(enquiryEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand: 'edward-hallam',
      consent,
      sourceUrl: window.location.href,
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error('Could not send enquiry.');
  }
}

function openNovemModal(opts = {}) {
  if (!novemModal) return;

  const title = opts.title || 'Waiting List';
  const description = opts.description || 'Leave your email and we’ll notify you when applications open again.';
  pendingSubject = opts.subject || 'Waiting List';

  if (novemModalTitle) {
    novemModalTitle.textContent = `Join the ${title} Waiting List`;
  }
  if (novemModalDescription) {
    novemModalDescription.textContent = description;
  }

  novemFeedback?.setAttribute('hidden', '');
  if (novemEmailInput) {
    novemEmailInput.value = '';
  }
  novemModal.hidden = false;
  novemModal.setAttribute('aria-hidden', 'false');
  novemCloseBtn?.focus();
}

function closeNovemModal() {
  if (!novemModal) return;

  novemModal.hidden = true;
  novemModal.setAttribute('aria-hidden', 'true');
}

function openContactModal() {
  if (!contactModal) return;

  contactFeedback?.setAttribute('hidden', '');
  if (contactNameInput) contactNameInput.value = '';
  if (contactNumberInput) contactNumberInput.value = '';
  if (contactMessageInput) contactMessageInput.value = '';

  contactModal.hidden = false;
  contactModal.setAttribute('aria-hidden', 'false');
  contactNameInput?.focus();
}

function closeContactModal() {
  if (!contactModal) return;

  contactModal.hidden = true;
  contactModal.setAttribute('aria-hidden', 'true');
}

function openDiscordModal() {
  if (!discordModal) return;

  discordModal.hidden = false;
  discordModal.setAttribute('aria-hidden', 'false');
  discordCloseBtn?.focus();
}

function closeDiscordModal() {
  if (!discordModal) return;

  discordModal.hidden = true;
  discordModal.setAttribute('aria-hidden', 'true');
}

function openFromButton(event) {
  const button = event.currentTarget;
  openNovemModal({
    title: button.dataset.title,
    description: button.dataset.description,
    subject: button.dataset.subject,
  });
}

waitingListButtons.forEach((button) => {
  button.addEventListener('click', openFromButton);
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFromButton({ currentTarget: button });
    }
  });
});
novemCloseBtn?.addEventListener('click', closeNovemModal);
contactOpenBtn?.addEventListener('click', openContactModal);
contactCloseBtn?.addEventListener('click', closeContactModal);
discordOpenBtn?.addEventListener('click', openDiscordModal);
discordCloseBtn?.addEventListener('click', closeDiscordModal);

novemModal?.addEventListener('click', (event) => {
  if (event.target === novemModal) {
    closeNovemModal();
  }
});

contactModal?.addEventListener('click', (event) => {
  if (event.target === contactModal) {
    closeContactModal();
  }
});

discordModal?.addEventListener('click', (event) => {
  if (event.target === discordModal) {
    closeDiscordModal();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && novemModal && !novemModal.hidden) {
    closeNovemModal();
  }
  if (event.key === 'Escape' && contactModal && !contactModal.hidden) {
    closeContactModal();
  }
  if (event.key === 'Escape' && discordModal && !discordModal.hidden) {
    closeDiscordModal();
  }
});

novemForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!novemEmailInput || !novemFeedback) {
    return;
  }

  const email = novemEmailInput.value.trim();
  if (!email) return;

  try {
    await submitEnquiry({
      name: 'Edward Hallam site visitor',
      email,
      contactMethod: 'email',
      services: [pendingSubject],
      message: `Waiting list request: ${pendingSubject}`,
      campaign: pendingSubject,
    }, new FormData(novemForm).get('consent') === 'yes');
    novemFeedback.textContent = 'Thanks — you’re on the list.';
    novemFeedback.removeAttribute('hidden');
    novemEmailInput.value = '';
  } catch {
    novemFeedback.textContent = 'Sorry — that did not send. Please email me directly.';
    novemFeedback.removeAttribute('hidden');
  }
});

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!contactNameInput || !contactNumberInput || !contactMessageInput || !contactFeedback) {
    return;
  }

  const name = contactNameInput.value.trim();
  const number = contactNumberInput.value.trim();
  const message = contactMessageInput.value.trim();
  if (!name || !number || !message) return;

  try {
    await submitEnquiry({
      name,
      phone: number,
      contactMethod: 'call',
      services: ['Personal site enquiry'],
      message,
      campaign: 'Edward Hallam contact form',
    }, new FormData(contactForm).get('consent') === 'yes');
    contactFeedback.textContent = 'Thanks — I’ve got your enquiry.';
    contactFeedback.removeAttribute('hidden');
    contactForm.reset();
  } catch {
    contactFeedback.textContent = 'Sorry — that did not send. Please email me directly.';
    contactFeedback.removeAttribute('hidden');
  }
});

const consentStorageKey = 'aqua-cookie-preferences';
const consentCookieKey = 'aqua_cookie_preferences';
const consentVersion = 1;
const cookieBanner = document.querySelector('[data-cookie-banner]');
const cookieDialog = document.querySelector('[data-cookie-dialog]');

function readCookieChoice() {
  try {
    const value = JSON.parse(localStorage.getItem(consentStorageKey) || 'null');
    return value && value.version === consentVersion && value.necessary === true ? value : null;
  } catch {
    return null;
  }
}

function storeCookieChoice(values, source) {
  const value = {
    version: consentVersion,
    necessary: true,
    preferences: Boolean(values.preferences),
    analytics: Boolean(values.analytics),
    marketing: Boolean(values.marketing),
    updatedAt: new Date().toISOString(),
    source,
  };
  localStorage.setItem(consentStorageKey, JSON.stringify(value));
  document.cookie = `${consentCookieKey}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  window.dispatchEvent(new CustomEvent('aqua:consent-updated', { detail: value }));
  cookieBanner.hidden = true;
  cookieDialog.hidden = true;
}

function showCookieSettings() {
  const value = readCookieChoice() || {};
  document.querySelector('[data-cookie-preferences]').checked = Boolean(value.preferences);
  document.querySelector('[data-cookie-analytics]').checked = Boolean(value.analytics);
  document.querySelector('[data-cookie-marketing]').checked = Boolean(value.marketing);
  cookieDialog.hidden = false;
}

document.querySelector('[data-cookie-reject]')?.addEventListener('click', () => storeCookieChoice({}, 'banner-reject'));
document.querySelector('[data-cookie-accept]')?.addEventListener('click', () => storeCookieChoice({ preferences: true, analytics: true, marketing: true }, 'banner-accept'));
document.querySelectorAll('[data-cookie-manage], [data-cookie-reopen]').forEach((button) => button.addEventListener('click', showCookieSettings));
document.querySelector('[data-cookie-close]')?.addEventListener('click', () => { cookieDialog.hidden = true; });
document.querySelector('[data-cookie-save]')?.addEventListener('click', () => storeCookieChoice({
  preferences: document.querySelector('[data-cookie-preferences]').checked,
  analytics: document.querySelector('[data-cookie-analytics]').checked,
  marketing: document.querySelector('[data-cookie-marketing]').checked,
}, 'settings-save'));
document.querySelector('[data-cookie-dialog-accept]')?.addEventListener('click', () => storeCookieChoice({ preferences: true, analytics: true, marketing: true }, 'settings-accept'));
cookieDialog?.addEventListener('click', (event) => { if (event.target === cookieDialog) cookieDialog.hidden = true; });
cookieBanner.hidden = Boolean(readCookieChoice());

const aquaTag = document.createElement('script');
aquaTag.src = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? 'http://localhost:3032/aqua-tag.js'
  : 'https://aqua-crm.com/aqua-tag.js';
aquaTag.dataset.siteKey = 'aqua_public_edward_hallam_v1';
aquaTag.dataset.property = 'edward-hallam';
aquaTag.defer = true;
document.head.appendChild(aquaTag);
