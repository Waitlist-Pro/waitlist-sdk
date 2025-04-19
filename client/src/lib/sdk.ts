export interface WaitlistSDKOptions {
  formId: string | number;
  selector: string;
  theme?: {
    primaryColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    buttonText?: string;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface Subscriber {
  email: string;
  name?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export class WaitlistSDKClient {
  private options: WaitlistSDKOptions;
  private element: HTMLElement | null = null;
  private events: Record<string, Function[]> = {
    submit: [],
    success: [],
    error: [],
  };

  constructor(options: WaitlistSDKOptions) {
    this.options = options;
  }

  public init(): void {
    this.element = document.querySelector(this.options.selector);
    if (!this.element) {
      console.error(`WaitlistSDK: Element not found with selector "${this.options.selector}"`);
      return;
    }

    this.loadForm();
  }

  private async loadForm(): Promise<void> {
    try {
      const response = await fetch(`/api/sdk/form/${this.options.formId}`);
      if (!response.ok) {
        throw new Error(`Failed to load form: ${response.statusText}`);
      }

      const formData = await response.json();
      this.renderForm(formData);
    } catch (error) {
      console.error('WaitlistSDK: Error loading form', error);
      this.triggerEvent('error', error);
      
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  private renderForm(formData: any): void {
    if (!this.element) return;

    // Apply theme if provided
    if (this.options.theme) {
      this.applyTheme(this.options.theme);
    }

    // Set form data attributes
    this.element.setAttribute('data-waitlist-form', 'true');
    this.element.setAttribute('data-form-id', this.options.formId.toString());

    // Create form HTML
    this.element.innerHTML = `
      <div class="waitlist-sdk-form text-center">
        <h3 class="waitlist-title">${formData.name || 'Join Our Waitlist'}</h3>
        ${formData.description ? `<p class="waitlist-description">${formData.description}</p>` : ''}
        <form id="waitlist-form-${this.options.formId}" class="waitlist-form">
          <div class="waitlist-field">
            <label for="waitlist-email-${this.options.formId}">Email</label>
            <input type="email" id="waitlist-email-${this.options.formId}" name="email" required placeholder="you@example.com">
          </div>
          ${formData.collectName ? `
            <div class="waitlist-field">
              <label for="waitlist-name-${this.options.formId}">Name (optional)</label>
              <input type="text" id="waitlist-name-${this.options.formId}" name="name" placeholder="John Doe">
            </div>
          ` : ''}
          <button type="submit" class="waitlist-submit-button">${this.options.theme?.buttonText || 'Join Waitlist'}</button>
        </form>
      </div>
    `;

    // Add default styling
    this.addStyles();

    // Attach event listener to form
    const form = document.getElementById(`waitlist-form-${this.options.formId}`) as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    
    if (!emailInput || !emailInput.value) {
      return;
    }

    const data: Subscriber = {
      email: emailInput.value,
      referrer: window.location.href,
    };

    if (nameInput && nameInput.value) {
      data.name = nameInput.value;
    }

    this.triggerEvent('submit', data);

    try {
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
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
          formId: Number(this.options.formId),
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      const result = await response.json();
      this.triggerEvent('success', result);
      
      if (this.options.onSuccess) {
        this.options.onSuccess(result);
      }

      this.showSuccessMessage();
    } catch (error) {
      console.error('WaitlistSDK: Error submitting form', error);
      this.triggerEvent('error', error);
      
      if (this.options.onError) {
        this.options.onError(error);
      }

      this.showErrorMessage();
    } finally {
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = this.options.theme?.buttonText || 'Join Waitlist';
      }
    }
  }

  private showSuccessMessage(): void {
    if (!this.element) return;
    
    const form = this.element.querySelector('.waitlist-form') as HTMLFormElement;
    if (form) {
      form.innerHTML = `
        <div class="waitlist-success">
          <p>Thank you for joining our waitlist!</p>
          <p>We'll keep you updated.</p>
        </div>
      `;
    }
  }

  private showErrorMessage(): void {
    if (!this.element) return;
    
    const form = this.element.querySelector('.waitlist-form') as HTMLFormElement;
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

  private applyTheme(theme: WaitlistSDKOptions['theme']): void {
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

  private addStyles(): void {
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

  public on(event: 'submit' | 'success' | 'error', callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
  }

  private triggerEvent(event: string, data: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  public reset(): void {
    if (!this.element) return;
    
    this.loadForm();
  }
}
