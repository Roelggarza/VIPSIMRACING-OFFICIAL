import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { generateRecoveryCodes } from './passwordSecurity';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorData {
  isEnabled: boolean;
  secret?: string;
  backupCodes?: string[];
  phoneNumber?: string;
  backupEmail?: string;
  lastUsedBackupCode?: string[];
}

/**
 * Generate 2FA setup data including secret and QR code
 * @param userEmail - User's email address
 * @param serviceName - Name of the service (default: VIP SIM RACING)
 * @returns Promise<TwoFactorSetup> - Setup data including QR code
 */
export const generate2FASetup = async (userEmail: string, serviceName: string = 'VIP SIM RACING'): Promise<TwoFactorSetup> => {
  // Generate a secret key
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: serviceName,
    length: 32
  });

  // Generate QR code URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  // Generate backup codes
  const backupCodes = generateRecoveryCodes(10);

  return {
    secret: secret.base32!,
    qrCodeUrl,
    backupCodes
  };
};

/**
 * Verify TOTP token
 * @param token - 6-digit token from authenticator app
 * @param secret - User's secret key
 * @param window - Time window for validation (default: 2)
 * @returns boolean - True if token is valid
 */
export const verifyTOTP = (token: string, secret: string, window: number = 2): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window
  });
};

/**
 * Generate and send SMS OTP (simulation)
 * @param phoneNumber - User's phone number
 * @returns Promise<string> - OTP code (in real app, this wouldn't be returned)
 */
export const sendSMSOTP = async (phoneNumber: string): Promise<string> => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // In a real application, you would use a service like Twilio, AWS SNS, etc.
  console.log(`SMS OTP for ${phoneNumber}: ${otp}`);
  
  // Store OTP temporarily (in real app, use Redis or similar)
  const otpData = {
    otp,
    phoneNumber,
    timestamp: Date.now(),
    used: false
  };
  
  localStorage.setItem(`sms_otp_${phoneNumber}`, JSON.stringify(otpData));
  
  // Simulate SMS sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return otp; // In production, don't return the OTP
};

/**
 * Verify SMS OTP
 * @param phoneNumber - User's phone number
 * @param otp - OTP code to verify
 * @returns boolean - True if OTP is valid
 */
export const verifySMSOTP = (phoneNumber: string, otp: string): boolean => {
  const storedData = localStorage.getItem(`sms_otp_${phoneNumber}`);
  
  if (!storedData) return false;
  
  try {
    const otpData = JSON.parse(storedData);
    
    // Check if OTP matches and hasn't been used
    if (otpData.otp === otp && !otpData.used) {
      // Check if OTP is still valid (5 minutes)
      const isValid = Date.now() - otpData.timestamp < 5 * 60 * 1000;
      
      if (isValid) {
        // Mark as used
        otpData.used = true;
        localStorage.setItem(`sms_otp_${phoneNumber}`, JSON.stringify(otpData));
        return true;
      }
    }
  } catch (error) {
    console.error('Error verifying SMS OTP:', error);
  }
  
  return false;
};

/**
 * Send email OTP (simulation)
 * @param email - User's backup email
 * @returns Promise<string> - OTP code
 */
export const sendEmailOTP = async (email: string): Promise<string> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log(`Email OTP for ${email}: ${otp}`);
  
  const otpData = {
    otp,
    email,
    timestamp: Date.now(),
    used: false
  };
  
  localStorage.setItem(`email_otp_${email}`, JSON.stringify(otpData));
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return otp;
};

/**
 * Verify email OTP
 * @param email - User's backup email
 * @param otp - OTP code to verify
 * @returns boolean - True if OTP is valid
 */
export const verifyEmailOTP = (email: string, otp: string): boolean => {
  const storedData = localStorage.getItem(`email_otp_${email}`);
  
  if (!storedData) return false;
  
  try {
    const otpData = JSON.parse(storedData);
    
    if (otpData.otp === otp && !otpData.used) {
      const isValid = Date.now() - otpData.timestamp < 10 * 60 * 1000; // 10 minutes for email
      
      if (isValid) {
        otpData.used = true;
        localStorage.setItem(`email_otp_${email}`, JSON.stringify(otpData));
        return true;
      }
    }
  } catch (error) {
    console.error('Error verifying email OTP:', error);
  }
  
  return false;
};

/**
 * Verify backup recovery code
 * @param userEmail - User's email
 * @param code - Recovery code to verify
 * @returns boolean - True if code is valid and unused
 */
export const verifyRecoveryCode = (userEmail: string, code: string): boolean => {
  const userData = localStorage.getItem(`2fa_${userEmail}`);
  
  if (!userData) return false;
  
  try {
    const twoFactorData: TwoFactorData = JSON.parse(userData);
    
    if (!twoFactorData.backupCodes || !twoFactorData.lastUsedBackupCode) {
      return false;
    }
    
    // Check if code exists and hasn't been used
    const codeIndex = twoFactorData.backupCodes.indexOf(code.toUpperCase());
    const isUsed = twoFactorData.lastUsedBackupCode.includes(code.toUpperCase());
    
    if (codeIndex !== -1 && !isUsed) {
      // Mark code as used
      twoFactorData.lastUsedBackupCode.push(code.toUpperCase());
      localStorage.setItem(`2fa_${userEmail}`, JSON.stringify(twoFactorData));
      return true;
    }
  } catch (error) {
    console.error('Error verifying recovery code:', error);
  }
  
  return false;
};

/**
 * Enable 2FA for user
 * @param userEmail - User's email
 * @param secret - TOTP secret
 * @param backupCodes - Recovery codes
 * @param phoneNumber - Optional phone number for SMS
 * @param backupEmail - Optional backup email
 */
export const enable2FA = (userEmail: string, secret: string, backupCodes: string[], phoneNumber?: string, backupEmail?: string) => {
  const twoFactorData: TwoFactorData = {
    isEnabled: true,
    secret,
    backupCodes,
    phoneNumber,
    backupEmail,
    lastUsedBackupCode: []
  };
  
  localStorage.setItem(`2fa_${userEmail}`, JSON.stringify(twoFactorData));
};

/**
 * Get 2FA data for user
 * @param userEmail - User's email
 * @returns TwoFactorData | null
 */
export const get2FAData = (userEmail: string): TwoFactorData | null => {
  const userData = localStorage.getItem(`2fa_${userEmail}`);
  
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing 2FA data:', error);
    return null;
  }
};

/**
 * Disable 2FA for user
 * @param userEmail - User's email
 */
export const disable2FA = (userEmail: string) => {
  localStorage.removeItem(`2fa_${userEmail}`);
};