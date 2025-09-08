import bcrypt from 'bcryptjs';
import axios from 'axios';
import CryptoJS from 'crypto-js';

/**
 * Hash a password using bcrypt with salt rounds of 12
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // High security level
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @returns Promise<boolean> - True if password matches
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Enhanced password strength validation with modern standards
 * @param password - Password to validate
 * @returns object with validation result and message
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; message: string; score: number } => {
  let score = 0;
  const issues: string[] = [];

  // Minimum length check (12-16 characters)
  if (password.length < 12) {
    issues.push('Password must be at least 12 characters long');
  } else if (password.length >= 12) {
    score += 2;
  }

  // Complexity checks
  if (!/(?=.*[a-z])/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/(?=.*\d)/.test(password)) {
    issues.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?])/.test(password)) {
    issues.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Additional complexity bonuses
  if (password.length >= 16) score += 1;
  if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?])/.test(password)) score += 1;

  const isValid = issues.length === 0 && score >= 5;
  const message = issues.length > 0 ? issues[0] : 'Password meets security requirements';

  return { isValid, message, score };
};

/**
 * Check if password has been compromised in known breaches using HaveIBeenPwned API
 * @param password - Password to check
 * @returns Promise<boolean> - True if password has been compromised
 */
export const checkPasswordBreach = async (password: string): Promise<{ isCompromised: boolean; count: number }> => {
  try {
    // Hash the password with SHA-1 (required by HaveIBeenPwned API)
    const sha1Hash = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // Query HaveIBeenPwned API with k-anonymity model
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'VIP-SIM-RACING-Security-Check'
      }
    });

    // Check if our password hash suffix appears in the response
    const lines = response.data.split('\n');
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return { isCompromised: true, count: parseInt(count) };
      }
    }

    return { isCompromised: false, count: 0 };
  } catch (error) {
    console.warn('Password breach check failed:', error);
    // If the service is unavailable, we don't block the user but log the issue
    return { isCompromised: false, count: 0 };
  }
};

/**
 * Generate a secure random password
 * @param length - Length of password to generate (default: 16)
 * @returns string - Generated password
 */
export const generateSecurePassword = (length: number = 16): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate recovery codes for 2FA backup
 * @param count - Number of codes to generate (default: 10)
 * @returns string[] - Array of recovery codes
 */
export const generateRecoveryCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  
  return codes;
};

/**
 * Validate reCAPTCHA token
 * @param token - reCAPTCHA response token
 * @returns Promise<boolean> - True if valid
 */
export const validateRecaptcha = async (token: string): Promise<boolean> => {
  try {
    // In a real application, this would be done server-side
    // For demo purposes, we'll simulate validation
    if (!token || token.length < 10) {
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, you would make a server-side call to:
    // https://www.google.com/recaptcha/api/siteverify
    // with your secret key
    
    return true; // Simulate successful validation
  } catch (error) {
    console.error('reCAPTCHA validation failed:', error);
    return false;
  }
};