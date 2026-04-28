// Validation utilities for input sanitization and validation

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: 'Email is required' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (trimmed.length > 150) {
    return { valid: false, error: 'Email is too long' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
  if (password.length > 255) return { valid: false, error: 'Password is too long' };
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone.trim()) return { valid: true }; // Phone is optional
  const trimmed = phone.replace(/\s/g, '');
  if (!/^(\+?250)?[0-9]{9}$/.test(trimmed)) {
    return { valid: false, error: 'Invalid phone format (e.g., +250 78X XXX XXX)' };
  }
  return { valid: true };
}

export function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: 'Name is required' };
  if (trimmed.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
  if (trimmed.length > 100) return { valid: false, error: 'Name is too long' };
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens and apostrophes' };
  }
  return { valid: true };
}

export function validateAddress(address: string): { valid: boolean; error?: string } {
  const trimmed = address.trim();
  if (!trimmed) return { valid: false, error: 'Address is required' };
  if (trimmed.length < 5) return { valid: false, error: 'Address is too short' };
  if (trimmed.length > 500) return { valid: false, error: 'Address is too long' };
  return { valid: true };
}

export function validateRating(rating: number): { valid: boolean; error?: string } {
  if (typeof rating !== 'number') return { valid: false, error: 'Invalid rating' };
  if (rating < 1 || rating > 5) return { valid: false, error: 'Rating must be between 1 and 5' };
  return { valid: true };
}

export function validateQuantity(quantity: number): { valid: boolean; error?: string } {
  if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
    return { valid: false, error: 'Invalid quantity' };
  }
  if (quantity > 999) return { valid: false, error: 'Quantity is too large' };
  return { valid: true };
}

export function validatePromoCode(code: string): { valid: boolean; error?: string } {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, error: 'Promo code is required' };
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: 'Promo code must be between 3 and 20 characters' };
  }
  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Promo code can only contain letters and numbers' };
  }
  return { valid: true };
}

export function sanitizeText(text: string, maxLength: number = 500): string {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validatePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').slice(-9);
}

// Batch validation
export function validateCheckoutData(data: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  selectedBranch?: string;
  pickupSlot?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (data.name) {
    const nameVal = validateName(data.name);
    if (!nameVal.valid) errors.name = nameVal.error!;
  }

  if (data.email) {
    const emailVal = validateEmail(data.email);
    if (!emailVal.valid) errors.email = emailVal.error!;
  }

  if (data.phone) {
    const phoneVal = validatePhone(data.phone);
    if (!phoneVal.valid) errors.phone = phoneVal.error!;
  }

  if (data.address) {
    const addressVal = validateAddress(data.address);
    if (!addressVal.valid) errors.address = addressVal.error!;
  }

  if (!data.selectedBranch) errors.selectedBranch = 'Branch is required';
  if (!data.pickupSlot) errors.pickupSlot = 'Pickup time is required';

  return { valid: Object.keys(errors).length === 0, errors };
}
