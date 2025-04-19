// Form types
export interface Form {
  id: number;
  userId: number;
  name: string;
  description?: string;
  collectName: boolean;
  collectEmail: boolean;
  socialSharing: boolean;
  confirmationEmail: boolean;
  customCss?: string;
  redirectUrl?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormData {
  name: string;
  description?: string;
  collectName?: boolean;
  collectEmail?: boolean;
  socialSharing?: boolean;
  confirmationEmail?: boolean;
  customCss?: string;
  redirectUrl?: string;
  settings?: Record<string, any>;
}

// Subscriber types
export interface Subscriber {
  id: number;
  formId: number;
  email: string;
  name?: string;
  referrer?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateSubscriberData {
  formId: number;
  email: string;
  name?: string;
  referrer?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

// Activity types
export interface Activity {
  id: number;
  userId: number;
  formId?: number;
  subscriberId?: number;
  type: string;
  data?: Record<string, any>;
  createdAt: string;
}

// Dashboard stats types
export interface DashboardStats {
  totalSubscribers: number;
  thisMonth: number;
  conversionRate: number;
  activeForms: number;
}

// SDK types
export interface SDKFormData {
  id: number;
  name: string;
  description?: string;
  collectName: boolean;
  collectEmail: boolean;
  socialSharing: boolean;
  confirmationEmail: boolean;
  customCss?: string;
  redirectUrl?: string;
}

export interface SDKInitOptions {
  formId: number | string;
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
