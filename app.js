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

let pendingSubject = 'Waiting List';

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

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && novemModal && !novemModal.hidden) {
    closeNovemModal();
  }
  if (event.key === 'Escape' && contactModal && !contactModal.hidden) {
    closeContactModal();
  }
});

novemForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!novemEmailInput || !novemFeedback) {
    return;
  }

  const email = novemEmailInput.value.trim();
  if (!email) return;

  const body = `Email: ${email}`;
  const subject = encodeURIComponent(pendingSubject);
  const encodedBody = encodeURIComponent(body);
  window.location.href = `mailto:edwardhallam07@gmail.com?subject=${subject}&body=${encodedBody}`;

  novemFeedback.removeAttribute('hidden');
  novemEmailInput.value = '';
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!contactNameInput || !contactNumberInput || !contactMessageInput || !contactFeedback) {
    return;
  }

  const name = contactNameInput.value.trim();
  const number = contactNumberInput.value.trim();
  const message = contactMessageInput.value.trim();
  if (!name || !number || !message) return;

  const body = `Name: ${name}\nNumber: ${number}\nMessage: ${message}`;
  const subject = encodeURIComponent('Custom Link Website Enquiry');
  const encodedBody = encodeURIComponent(body);
  window.location.href = `mailto:edwardhallam07@gmail.com?subject=${subject}&body=${encodedBody}`;

  contactFeedback.removeAttribute('hidden');
  contactForm.reset();
});
