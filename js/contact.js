// contact.js
// Contact page functionality
// Features: Form validation + feedback

// 1. DOM SELECTION
// Store references to the form and its three inputs.
// EMAIL_REGEX is defined here so it is available to validateForm.

const form       = document.getElementById('contactForm');
const nameInput  = document.getElementById('contactName');
const emailInput = document.getElementById('contactEmail');
const msgInput   = document.getElementById('contactMessage');

// Simple email regex it checks for "something@something.something".
// Not a full RFC 5322 validator, but covers 99% of real world cases.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 2. showError
// Adds Bootstrap is-invalid styling and add an error message below the input.
// Creates a new .invalid-feedback element if one does not already exist.
function showError(input, message) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  let feedback = input.nextElementSibling;
  if (!feedback || !feedback.classList.contains('invalid-feedback')) {
    feedback = document.createElement('div');
    feedback.classList.add('invalid-feedback');
    input.after(feedback);
  }
  feedback.textContent = message;
}

// 3. clearError
// Removes is-invalid and adds is-valid to mark the field as passing validation.
function clearError(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  let feedback = input.nextElementSibling;
  if (feedback && feedback.classList.contains('invalid-feedback')) {
    feedback.textContent = '';
  }
}

// 4. validateForm
// Runs showError / clearError on each field.
// Returns true only if name, email (regex) and message are all valid.
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

// 5. SUBMIT HANDLER
// Prevents default form submission, runs validateForm, and on success
// appends a Bootstrap alert and resets the form fields.
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

/*
REFERENCES & RESOURCES
The following references were used in this file:

- Bootstrap Form Validation (is-invalid, is-valid, invalid-feedback classes):
  https://getbootstrap.com/docs/5.3/forms/validation/

- Bootstrap Alerts (alert, alert-success — used for the success feedback message):
  https://getbootstrap.com/docs/5.3/components/alerts/

- MDN — HTMLElement.classList (add, remove used in showError / clearError):
  https://developer.mozilla.org/en-US/docs/Web/API/Element/classList

- MDN - HTML email input validation (source for EMAIL_REGEX pattern):
  https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
*/