(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define(factory)
    : (global.WaitlistSDK = factory());
})(this, function () {
  'use strict';

  const version = '1.0.0';
  let initialized = false;
  let options = {};
  let element = null;
  const events = {
    submit: [],
    success: [],
    error: [],
  };
  
  /**
   * Initialize the WaitlistSDK with the provided options
   * @param {Object} opts Configuration options
   * @param {string|number} opts.formId The ID of the form to display
   * @param {string} opts.selector CSS selector for the element to mount the form
   * @param {Object} [opts.theme] Theme customization options
   * @param {Function} [opts.onSuccess] Callback for successful submission
   * @param {Function} [opts.onError] Callback for errors
   */
  function init(opts) {
    if (!opts || !opts.formId || !opts.selector) {
      console.error('WaitlistSDK: Missing required parameters. formId and selector are required.');
      return;
    }
    
    options = { ...opts };
    element = document.querySelector(opts.selector);
    
    if (!element) {
      console.error(`WaitlistSDK: Element not found with selector "${opts.selector}"`);
      return;
    }
    
    initialized = true;
    loadForm();
  }
  
  /**
   * Fetch form data from the server and render the form
   */
  async function loadForm() {
    if (!initialized) {
      console.error('WaitlistSDK: SDK not initialized. Call WaitlistSDK.init() first.');
      return;
    }
    
    try {
      const response = await fetch(`/api/sdk/form/${options.formId}`);
      if (!response.ok) {
        throw new Error(`Failed to load form: ${response.statusText}`);
      }

      const formData = await response.json();
      renderForm(formData);
    } catch (error) {
      console.error('WaitlistSDK: Error loading form', error);
      triggerEvent('error', error);
      
      if (options.onError) {
        options.onError(error);
      }
    }
  }
  
  /**
   * Render the waitlist form in the target element
   * @param {Object} formData Data for the form
   */
  function renderForm(formData) {
    if (!element) return;

    // Apply theme if provided
    if (options.theme) {
      applyTheme(options.theme);
    }

    // Set form data attributes
    element.setAttribute('data-waitlist-form', 'true');
    element.setAttribute('data-form-id', options.formId.toString());

    // Create form HTML
    element.innerHTML = `
      <div class="waitlist-sdk-form text-center">
        <h3 class="waitlist-title">${formData.name || 'Join Our Waitlist'}</h3>
        ${formData.description ? `<p class="waitlist-description">${formData.description}</p>` : ''}
        <form id="waitlist-form-${options.formId}" class="waitlist-form">
          <div class="waitlist-field">
            <label for="waitlist-email-${options.formId}">Email</label>
            <input type="email" id="waitlist-email-${options.formId}" name="email" required placeholder="you@example.com">
          </div>
          ${formData.collectName ? `
            <div class="waitlist-field">
              <label for="waitlist-name-${options.formId}">Name (optional)</label>
              <input type="text" id="waitlist-name-${options.formId}" name="name" placeholder="John Doe">
            </div>
          ` : ''}
          <button type="submit" class="waitlist-submit-button">${options.theme?.buttonText || 'Join Waitlist'}</button>
        </form>
      </div>
    `;

    // Add default styling
    addStyles();

    // Attach event listener to form
    const form = document.getElementById(`waitlist-form-${options.formId}`);
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  }
  
  /**
   * Handle form submission
   * @param {Event} event Form submit event
   */
  async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[name="email"]');
    const nameInput = form.querySelector('input[name="name"]');
    
    if (!emailInput || !emailInput.value) {
      return;
    }

    const data = {
      email: emailInput.value,
      referrer: window.location.href,
    };

    if (nameInput && nameInput.value) {
      data.name = nameInput.value;
    }

    triggerEvent('submit', data);

    try {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Joining...';
      }

      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: Number(options.formId),
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      const result = await response.json();
      triggerEvent('success', result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      showSuccessMessage();
    } catch (error) {
      console.error('WaitlistSDK: Error submitting form', error);
      triggerEvent('error', error);
      
      if (options.onError) {
        options.onError(error);
      }

      showErrorMessage();
    } finally {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = options.theme?.buttonText || 'Join Waitlist';
      }
    }
  }
  
  /**
   * Show success message after successful form submission
   */
  function showSuccessMessage() {
    if (!element) return;
    
    const form = element.querySelector('.waitlist-form');
    if (form) {
      form.innerHTML = `
        <div class="waitlist-success">
          <p>Thank you for joining our waitlist!</p>
          <p>We'll keep you updated.</p>
        </div>
      `;
    }
  }
  
  /**
   * Show error message when form submission fails
   */
  function showErrorMessage() {
    if (!element) return;
    
    const form = element.querySelector('.waitlist-form');
    if (form) {
      const errorElement = document.createElement('div');
      errorElement.className = 'waitlist-error';
      errorElement.textContent = 'Something went wrong. Please try again later.';
      
      form.prepend(errorElement);
      
      setTimeout(() => {
        if (errorElement.parentNode) {
          errorElement.parentNode.removeChild(errorElement);
        }
      }, 5000);
    }
  }
  
  /**
   * Apply custom theme to the form
   * @param {Object} theme Theme options
   */
  function applyTheme(theme) {
    if (!theme) return;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .waitlist-sdk-form {
        --waitlist-primary-color: ${theme.primaryColor || '#4F46E5'};
        --waitlist-border-radius: ${theme.borderRadius || '0.375rem'};
        --waitlist-font-family: ${theme.fontFamily || 'Inter, sans-serif'};
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  /**
   * Add default styles for the form
   */
  function addStyles() {
    const styleId = 'waitlist-sdk-styles';
    if (document.getElementById(styleId)) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      .waitlist-sdk-form {
        font-family: var(--waitlist-font-family, 'Inter', sans-serif);
        max-width: 100%;
        box-sizing: border-box;
      }
      
      .waitlist-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a202c;
        margin-bottom: 0.5rem;
      }
      
      .waitlist-description {
        font-size: 0.875rem;
        color: #4a5568;
        margin-bottom: 1.5rem;
      }
      
      .waitlist-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .waitlist-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        text-align: left;
      }
      
      .waitlist-field label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
      }
      
      .waitlist-field input {
        padding: 0.5rem;
        border: 1px solid #cbd5e0;
        border-radius: var(--waitlist-border-radius, 0.375rem);
        font-size: 0.875rem;
        width: 100%;
        box-sizing: border-box;
        outline: none;
      }
      
      .waitlist-field input:focus {
        border-color: var(--waitlist-primary-color, #4F46E5);
        box-shadow: 0 0 0 1px var(--waitlist-primary-color, #4F46E5);
      }
      
      .waitlist-submit-button {
        background-color: var(--waitlist-primary-color, #4F46E5);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: var(--waitlist-border-radius, 0.375rem);
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .waitlist-submit-button:hover {
        background-color: var(--waitlist-primary-hover, #3c399e);
      }
      
      .waitlist-submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      .waitlist-success {
        background-color: #f0fff4;
        border: 1px solid #c6f6d5;
        border-radius: var(--waitlist-border-radius, 0.375rem);
        padding: 1rem;
        text-align: center;
        color: #2f855a;
      }
      
      .waitlist-error {
        background-color: #fff5f5;
        border: 1px solid #fed7d7;
        border-radius: var(--waitlist-border-radius, 0.375rem);
        padding: 0.5rem;
        text-align: center;
        color: #e53e3e;
        margin-bottom: 1rem;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  /**
   * Register an event handler
   * @param {string} event Event name ('submit', 'success', 'error')
   * @param {Function} callback Function to call when the event occurs
   */
  function on(event, callback) {
    if (!events[event]) {
      events[event] = [];
    }
    
    events[event].push(callback);
  }
  
  /**
   * Trigger an event
   * @param {string} event Event name
   * @param {any} data Event data
   */
  function triggerEvent(event, data) {
    if (events[event]) {
      events[event].forEach(callback => callback(data));
    }
  }
  
  /**
   * Reset the form to its initial state
   */
  function reset() {
    if (!initialized) {
      console.error('WaitlistSDK: SDK not initialized. Call WaitlistSDK.init() first.');
      return;
    }
    
    loadForm();
  }
  
  /**
   * Open the form modal (for modal implementation)
   */
  function open() {
    console.warn('WaitlistSDK: Modal functionality is not implemented in this version.');
  }
  
  /**
   * Close the form modal (for modal implementation)
   */
  function close() {
    console.warn('WaitlistSDK: Modal functionality is not implemented in this version.');
  }
  
  /**
   * Submit the form programmatically
   * @param {Object} data Form data
   */
  function submit(data) {
    if (!initialized) {
      console.error('WaitlistSDK: SDK not initialized. Call WaitlistSDK.init() first.');
      return;
    }
    
    if (!data || !data.email) {
      console.error('WaitlistSDK: Email is required for submission.');
      return;
    }
    
    // TODO: Implement programmatic submission
    console.warn('WaitlistSDK: Programmatic submission is not fully implemented in this version.');
  }
  
  return {
    version,
    init,
    on,
    open,
    close,
    reset,
    submit,
  };
});
