import CryptoJS from 'crypto-js';

export interface OTPData {
  code: string;
  email: string;
  timestamp: number;
  attempts: number;
  used: boolean;
  ipAddress: string;
  userAgent: string;
  expiryMinutes: number;
}

export interface OTPValidationResult {
  isValid: boolean;
  message: string;
  attemptsRemaining?: number;
  timeRemaining?: number;
}

/**
 * Generate a cryptographically secure OTP
 * @param length - Length of the OTP (default: 6)
 * @param type - Type of OTP ('numeric' | 'alphanumeric')
 * @returns string - Generated OTP
 */
export const generateSecureOTP = (length: number = 6, type: 'numeric' | 'alphanumeric' = 'numeric'): string => {
  const numericChars = '0123456789';
  const alphanumericChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const chars = type === 'numeric' ? numericChars : alphanumericChars;
  
  let otp = '';
  
  // Use crypto.getRandomValues for cryptographically secure random generation
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    otp += chars[array[i] % chars.length];
  }
  
  return otp;
};

/**
 * Store OTP with enhanced security and rate limiting
 * @param email - User's email address
 * @param expiryMinutes - OTP expiry time in minutes (default: 10)
 * @returns Promise<OTPData> - Generated OTP data
 */
export const generateAndStoreOTP = async (email: string, expiryMinutes: number = 10): Promise<OTPData> => {
  const currentTime = Date.now();
  const ipAddress = await getClientIP();
  const userAgent = navigator.userAgent;
  
  // Check rate limiting - max 3 OTPs per email per hour
  const existingOTPs = getOTPHistory(email);
  const oneHourAgo = currentTime - (60 * 60 * 1000);
  const recentOTPs = existingOTPs.filter(otp => otp.timestamp > oneHourAgo);
  
  if (recentOTPs.length >= 3) {
    throw new Error('Too many OTP requests. Please wait before requesting another code.');
  }
  
  // Generate OTP
  const code = generateSecureOTP(6, 'numeric');
  
  // Create OTP data with enhanced security
  const otpData: OTPData = {
    code,
    email: email.toLowerCase().trim(),
    timestamp: currentTime,
    attempts: 0,
    used: false,
    ipAddress,
    userAgent,
    expiryMinutes
  };
  
  // Encrypt and store OTP
  const encryptedOTP = encryptOTPData(otpData);
  localStorage.setItem(`otp_${email.toLowerCase()}`, encryptedOTP);
  
  // Store in history for rate limiting
  const history = getOTPHistory(email);
  history.push(otpData);
  
  // Keep only last 10 OTPs for history
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }
  
  localStorage.setItem(`otp_history_${email.toLowerCase()}`, JSON.stringify(history));
  
  return otpData;
};

/**
 * Validate OTP with comprehensive security checks
 * @param email - User's email address
 * @param inputCode - OTP code entered by user
 * @returns OTPValidationResult - Validation result with detailed feedback
 */
export const validateOTP = async (email: string, inputCode: string): Promise<OTPValidationResult> => {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedCode = inputCode.trim().toUpperCase();
  
  // Retrieve and decrypt OTP data
  const encryptedData = localStorage.getItem(`otp_${normalizedEmail}`);
  if (!encryptedData) {
    return {
      isValid: false,
      message: 'No OTP found. Please request a new code.'
    };
  }
  
  let otpData: OTPData;
  try {
    otpData = decryptOTPData(encryptedData);
  } catch (error) {
    return {
      isValid: false,
      message: 'Invalid OTP data. Please request a new code.'
    };
  }
  
  // Check if OTP has been used
  if (otpData.used) {
    return {
      isValid: false,
      message: 'This OTP has already been used. Please request a new code.'
    };
  }
  
  // Check expiry
  const currentTime = Date.now();
  const expiryTime = otpData.timestamp + (otpData.expiryMinutes * 60 * 1000);
  
  if (currentTime > expiryTime) {
    // Clean up expired OTP
    localStorage.removeItem(`otp_${normalizedEmail}`);
    return {
      isValid: false,
      message: 'OTP has expired. Please request a new code.'
    };
  }
  
  // Check attempt limit (max 5 attempts)
  if (otpData.attempts >= 5) {
    // Clean up OTP after too many attempts
    localStorage.removeItem(`otp_${normalizedEmail}`);
    return {
      isValid: false,
      message: 'Too many invalid attempts. Please request a new code.'
    };
  }
  
  // Validate the code
  if (otpData.code !== normalizedCode) {
    // Increment attempt counter
    otpData.attempts += 1;
    const updatedEncryptedData = encryptOTPData(otpData);
    localStorage.setItem(`otp_${normalizedEmail}`, updatedEncryptedData);
    
    const attemptsRemaining = 5 - otpData.attempts;
    return {
      isValid: false,
      message: `Invalid OTP. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`,
      attemptsRemaining
    };
  }
  
  // Mark OTP as used
  otpData.used = true;
  const updatedEncryptedData = encryptOTPData(otpData);
  localStorage.setItem(`otp_${normalizedEmail}`, updatedEncryptedData);
  
  // Calculate remaining time for user feedback
  const timeRemaining = Math.max(0, expiryTime - currentTime);
  
  return {
    isValid: true,
    message: 'OTP validated successfully.',
    timeRemaining: Math.floor(timeRemaining / 1000)
  };
};

/**
 * Clean up expired OTPs and perform maintenance
 */
export const cleanupExpiredOTPs = () => {
  const currentTime = Date.now();
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('otp_') && !key.includes('history')) {
      try {
        const encryptedData = localStorage.getItem(key);
        if (encryptedData) {
          const otpData = decryptOTPData(encryptedData);
          const expiryTime = otpData.timestamp + (otpData.expiryMinutes * 60 * 1000);
          
          if (currentTime > expiryTime) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Remove corrupted data
        localStorage.removeItem(key);
      }
    }
  });
};

/**
 * Get OTP history for rate limiting
 * @param email - User's email address
 * @returns OTPData[] - Array of historical OTP data
 */
const getOTPHistory = (email: string): OTPData[] => {
  const history = localStorage.getItem(`otp_history_${email.toLowerCase()}`);
  return history ? JSON.parse(history) : [];
};

/**
 * Encrypt OTP data for secure storage
 * @param otpData - OTP data to encrypt
 * @returns string - Encrypted data
 */
const encryptOTPData = (otpData: OTPData): string => {
  const secretKey = 'VIP_SIM_RACING_OTP_SECRET_2024'; // In production, use environment variable
  return CryptoJS.AES.encrypt(JSON.stringify(otpData), secretKey).toString();
};

/**
 * Decrypt OTP data from storage
 * @param encryptedData - Encrypted OTP data
 * @returns OTPData - Decrypted OTP data
 */
const decryptOTPData = (encryptedData: string): OTPData => {
  const secretKey = 'VIP_SIM_RACING_OTP_SECRET_2024'; // In production, use environment variable
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};

/**
 * Get client IP address (simulated for demo)
 * @returns Promise<string> - IP address
 */
const getClientIP = async (): Promise<string> => {
  // In a real application, this would be determined server-side
  // For demo purposes, generate a consistent IP based on session
  const sessionId = sessionStorage.getItem('demo_ip') || Math.random().toString();
  sessionStorage.setItem('demo_ip', sessionId);
  
  const hash = sessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [
    192,
    168,
    (hash % 255) + 1,
    ((hash * 7) % 255) + 1
  ].join('.');
};

/**
 * Send OTP via email (simulation)
 * @param email - Recipient email address
 * @param otp - OTP code to send
 * @returns Promise<boolean> - Success status
 */
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`
    📧 EMAIL SENT TO: ${email}
    🔐 OTP CODE: ${otp}
    ⏰ EXPIRES: 10 minutes
    
    Subject: VIP SIM RACING - Password Reset Code
    
    Your password reset code is: ${otp}
    
    This code will expire in 10 minutes for security.
    If you didn't request this, please ignore this email.
    
    - VIP SIM RACING Team
  `);
  
  // Simulate occasional email delivery failures (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Email delivery failed. Please try again.');
  }
  
  return true;
};

/**
 * Get remaining time for OTP
 * @param email - User's email address
 * @returns number - Remaining time in seconds (0 if expired/not found)
 */
export const getOTPRemainingTime = (email: string): number => {
  const encryptedData = localStorage.getItem(`otp_${email.toLowerCase()}`);
  if (!encryptedData) return 0;
  
  try {
    const otpData = decryptOTPData(encryptedData);
    const currentTime = Date.now();
    const expiryTime = otpData.timestamp + (otpData.expiryMinutes * 60 * 1000);
    
    return Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
  } catch (error) {
    return 0;
  }
};

/**
 * Check if user can request new OTP (rate limiting)
 * @param email - User's email address
 * @returns object with canRequest status and wait time
 */
export const canRequestNewOTP = (email: string): { canRequest: boolean; waitTimeSeconds?: number } => {
  const history = getOTPHistory(email);
  const currentTime = Date.now();
  const oneHourAgo = currentTime - (60 * 60 * 1000);
  const recentOTPs = history.filter(otp => otp.timestamp > oneHourAgo);
  
  if (recentOTPs.length >= 3) {
    // Find the oldest recent OTP to calculate wait time
    const oldestRecentOTP = recentOTPs.sort((a, b) => a.timestamp - b.timestamp)[0];
    const waitTime = Math.ceil((oldestRecentOTP.timestamp + (60 * 60 * 1000) - currentTime) / 1000);
    
    return {
      canRequest: false,
      waitTimeSeconds: Math.max(0, waitTime)
    };
  }
  
  // Check if there's a recent OTP (within last 2 minutes) to prevent spam
  const twoMinutesAgo = currentTime - (2 * 60 * 1000);
  const veryRecentOTP = history.find(otp => otp.timestamp > twoMinutesAgo);
  
  if (veryRecentOTP) {
    const waitTime = Math.ceil((veryRecentOTP.timestamp + (2 * 60 * 1000) - currentTime) / 1000);
    return {
      canRequest: false,
      waitTimeSeconds: Math.max(0, waitTime)
    };
  }
  
  return { canRequest: true };
};

/**
 * Invalidate all OTPs for a user (security cleanup)
 * @param email - User's email address
 */
export const invalidateAllOTPs = (email: string): void => {
  localStorage.removeItem(`otp_${email.toLowerCase()}`);
};

/**
 * Format time remaining for display
 * @param seconds - Seconds remaining
 * @returns string - Formatted time string
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Initialize cleanup on module load
cleanupExpiredOTPs();

// Set up periodic cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);