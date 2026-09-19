// Shared validation utility for email and password across PulsePoll

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates an email address.
 * @param {string} email
 * @returns {{ isValid: boolean, error: string }}
 */
export function validateEmail(email) {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required' };
  }
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email cannot exceed 254 characters' };
  }
  if (trimmed.includes(' ')) {
    return { isValid: false, error: 'Email cannot contain spaces' };
  }
  if (trimmed.includes('..')) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com)' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com)' };
  }

  const [local, domain] = parts;
  if (!local || !domain || local.startsWith('.') || local.endsWith('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com)' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com)' };
  }

  return { isValid: true, error: '' };
}

/**
 * Checks individual password criteria.
 * @param {string} password
 */
export function checkPasswordCriteria(password = '') {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  };
}

/**
 * Computes password strength score (0 to 4), label, and color.
 * @param {string} password
 */
export function getPasswordStrength(password = '') {
  if (!password) {
    return { score: 0, label: 'Empty', color: '#E5E7EB', textColor: '#9CA3AF' };
  }

  const criteria = checkPasswordCriteria(password);
  let metCount = 0;
  if (criteria.minLength) metCount++;
  if (criteria.hasUpper) metCount++;
  if (criteria.hasLower) metCount++;
  if (criteria.hasNumber) metCount++;
  if (criteria.hasSpecial) metCount++;

  if (password.length >= 12 && metCount === 5) {
    return { score: 4, label: 'Very Strong', color: '#10B981', textColor: '#059669' };
  }
  if (metCount >= 5) {
    return { score: 4, label: 'Strong', color: '#10B981', textColor: '#059669' };
  }
  if (metCount >= 4) {
    return { score: 3, label: 'Good', color: '#3B82F6', textColor: '#2563EB' };
  }
  if (metCount >= 2) {
    return { score: 2, label: 'Fair', color: '#F59E0B', textColor: '#D97706' };
  }
  return { score: 1, label: 'Weak', color: '#EF4444', textColor: '#DC2626' };
}

/**
 * Validates password with optional signup complexity rules.
 * @param {string} password
 * @param {boolean} isSignup
 * @returns {{ isValid: boolean, error: string, criteria: object, strength: object }}
 */
export function validatePassword(password, isSignup = false) {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required',
      criteria: checkPasswordCriteria(''),
      strength: getPasswordStrength(''),
    };
  }

  const criteria = checkPasswordCriteria(password);
  const strength = getPasswordStrength(password);

  if (!isSignup) {
    // For login, non-empty password is sufficient
    return { isValid: true, error: '', criteria, strength };
  }

  // Signup rules
  if (!criteria.minLength) {
    return { isValid: false, error: 'Password must be at least 8 characters long', criteria, strength };
  }
  if (!criteria.hasUpper) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z)', criteria, strength };
  }
  if (!criteria.hasLower) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z)', criteria, strength };
  }
  if (!criteria.hasNumber) {
    return { isValid: false, error: 'Password must contain at least one number (0-9)', criteria, strength };
  }
  if (!criteria.hasSpecial) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*...)', criteria, strength };
  }

  return { isValid: true, error: '', criteria, strength };
}
