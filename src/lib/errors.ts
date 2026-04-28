// Error handling utilities

export class SimbaError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'SimbaError';
  }
}

export const ErrorCodes = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_TAKEN: 'AUTH_EMAIL_TAKEN',
  AUTH_WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_EMAIL: 'VALIDATION_EMAIL',
  VALIDATION_PASSWORD: 'VALIDATION_PASSWORD',
  VALIDATION_PHONE: 'VALIDATION_PHONE',
  VALIDATION_ADDRESS: 'VALIDATION_ADDRESS',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  
  // Checkout errors
  CHECKOUT_MISSING_FIELDS: 'CHECKOUT_MISSING_FIELDS',
  CHECKOUT_INVALID_BRANCH: 'CHECKOUT_INVALID_BRANCH',
  CHECKOUT_NO_CART: 'CHECKOUT_NO_CART',
  CHECKOUT_INSUFFICIENT_BALANCE: 'CHECKOUT_INSUFFICIENT_BALANCE',
  
  // Order errors
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_ALREADY_COMPLETED: 'ORDER_ALREADY_COMPLETED',
  
  // Inventory errors
  INVENTORY_OUT_OF_STOCK: 'INVENTORY_OUT_OF_STOCK',
  INVENTORY_NOT_AVAILABLE: 'INVENTORY_NOT_AVAILABLE',
  
  // Review errors
  REVIEW_INVALID_RATING: 'REVIEW_INVALID_RATING',
  REVIEW_ALREADY_EXISTS: 'REVIEW_ALREADY_EXISTS',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCodes.AUTH_EMAIL_TAKEN]: 'This email is already registered',
  [ErrorCodes.AUTH_WEAK_PASSWORD]: 'Password must be at least 6 characters',
  [ErrorCodes.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action',
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  
  [ErrorCodes.VALIDATION_EMAIL]: 'Please enter a valid email address',
  [ErrorCodes.VALIDATION_PASSWORD]: 'Password must be at least 6 characters',
  [ErrorCodes.VALIDATION_PHONE]: 'Please enter a valid phone number',
  [ErrorCodes.VALIDATION_ADDRESS]: 'Please enter a valid address',
  [ErrorCodes.VALIDATION_REQUIRED_FIELD]: 'This field is required',
  
  [ErrorCodes.CHECKOUT_MISSING_FIELDS]: 'Please fill in all required fields',
  [ErrorCodes.CHECKOUT_INVALID_BRANCH]: 'Please select a valid branch',
  [ErrorCodes.CHECKOUT_NO_CART]: 'Your cart is empty',
  [ErrorCodes.CHECKOUT_INSUFFICIENT_BALANCE]: 'Insufficient balance for this purchase',
  
  [ErrorCodes.ORDER_NOT_FOUND]: 'Order not found',
  [ErrorCodes.ORDER_ALREADY_COMPLETED]: 'This order has already been completed',
  
  [ErrorCodes.INVENTORY_OUT_OF_STOCK]: 'This item is out of stock',
  [ErrorCodes.INVENTORY_NOT_AVAILABLE]: 'This item is not available at your selected branch',
  
  [ErrorCodes.REVIEW_INVALID_RATING]: 'Rating must be between 1 and 5',
  [ErrorCodes.REVIEW_ALREADY_EXISTS]: 'You have already reviewed this order',
  
  [ErrorCodes.SERVER_ERROR]: 'An error occurred. Please try again later.',
  [ErrorCodes.DATABASE_ERROR]: 'Database error. Please try again later.',
  [ErrorCodes.API_ERROR]: 'API error. Please try again later.',
  [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
};

export function getErrorMessage(error: any): string {
  if (error instanceof SimbaError) {
    return ErrorMessages[error.code] || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again later.';
}

export function isNetworkError(error: any): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  return error?.code === ErrorCodes.NETWORK_ERROR;
}

export function is404Error(error: any): boolean {
  return error?.statusCode === 404 || error?.code === ErrorCodes.ORDER_NOT_FOUND;
}

export function is401Error(error: any): boolean {
  return error?.statusCode === 401 || error?.code === ErrorCodes.AUTH_UNAUTHORIZED;
}

export function is400Error(error: any): boolean {
  return error?.statusCode === 400;
}

export function is500Error(error: any): boolean {
  return error?.statusCode === 500 || error?.code === ErrorCodes.SERVER_ERROR;
}

// Retry logic for network errors
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1 && isNetworkError(error)) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}

// Safe fetch with error handling
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data: any; error?: string; status: number }> {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: data.error || `HTTP ${response.status}`,
      };
    }
    
    return {
      ok: true,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: isNetworkError(error) 
        ? 'Network error. Please check your connection.'
        : 'An error occurred. Please try again later.',
    };
  }
}
