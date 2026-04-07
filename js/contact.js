/* ══════════════════════════════════════════
   contact.js — Contact page functionality
   Features: Form validation + feedback
   ══════════════════════════════════════════ */

const form       = document.getElementById('contactForm');
const nameInput  = document.getElementById('contactName');
const emailInput = document.getElementById('contactEmail');
const msgInput   = document.getElementById('contactMessage');

// Simple email regex — checks for "something@something.something".
// Not a full RFC 5322 validator, but covers 99% of real-world cases.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─────────────────────────────────────
   showError — adds Bootstrap is-invalid
   styling and an error message below
   the input field
───────────────────────────────────── */
function showError(input, message) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  let feedback = input.nextElementSibling;
  if (!feedback || !feedback.classList.contains('invalid-feedback')) {
    console.log('Creating new feedback element');
    feedback = document.createElement('div');
    feedback.classList.add('invalid-feedback');
    input.after(feedback);
  }
  feedback.textContent = message;
}

/* ─────────────────────────────────────
   clearError — removes error styling
   and marks the field as valid
───────────────────────────────────── */
function clearError(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  let feedback = input.nextElementSibling;
  if (feedback && feedback.classList.contains('invalid-feedback')) {
    feedback.textContent = '';
  }
}

/* ─────────────────────────────────────
   validateForm — checks all fields
   and returns true only if all pass
───────────────────────────────────── */
function validateForm() {
  let valid = true;

  if (nameInput.value.trim() === '') {
    showError(nameInput, 'Please enter your name.');
    valid = false;
  } else {
    clearError(nameInput);
  }

  if (!EMAIL_REGEX.test(emailInput.value.trim())) {
    showError(emailInput, 'Please enter a valid email address.');
    valid = false;
  } else {
    clearError(emailInput);
  }

  if (msgInput.value.trim() === '') {
    showError(msgInput, 'Please enter a message.');
    valid = false;
  } else {
    clearError(msgInput);
  }

  return valid;
}

/* ─────────────────────────────────────
   Form submit handler
───────────────────────────────────── */
form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!validateForm()) return;

  // Show success message
  const successMsg = document.createElement('div');
  successMsg.classList.add('alert', 'alert-success', 'mt-3');
  successMsg.textContent = "Thank you! Your message has been sent. We'll get back to you shortly.";
  form.appendChild(successMsg);

  form.reset();
  [nameInput, emailInput, msgInput].forEach(i => i.classList.remove('is-valid'));
});