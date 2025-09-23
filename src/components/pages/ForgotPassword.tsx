import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Clock, Shield, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { emailExists, resetUserPassword } from '../../utils/userStorage';
import { validatePasswordStrength, checkPasswordBreach } from '../../utils/passwordSecurity';
import { 
  generateAndStoreOTP, 
  validateOTP, 
  sendOTPEmail, 
  getOTPRemainingTime, 
  canRequestNewOTP,
  formatTimeRemaining,
  invalidateAllOTPs,
  OTPValidationResult
} from '../../utils/otpService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardHeader, CardContent } from '../ui/Card';

type ResetStep = 'email' | 'otp' | 'newPassword' | 'complete';

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', isValid: false });
  const [breachWarning, setBreachWarning] = useState('');
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [canRequestOTP, setCanRequestOTP] = useState(true);
  const [waitTime, setWaitTime] = useState(0);
  const navigate = useNavigate();

  // Timer for OTP expiry and rate limiting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentStep === 'otp' && timeRemaining > 0) {
      interval = setInterval(() => {
        const remaining = getOTPRemainingTime(email);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setError('OTP has expired. Please request a new code.');
        }
      }, 1000);
    }
    
    if (waitTime > 0) {
      interval = setInterval(() => {
        setWaitTime(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            setCanRequestOTP(true);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, timeRemaining, waitTime, email]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!emailExists(email)) {
      setError('No account found with this email address.');
      return;
    }
    
    // Check rate limiting
    const rateLimitCheck = canRequestNewOTP(email);
    if (!rateLimitCheck.canRequest) {
      setCanRequestOTP(false);
      setWaitTime(rateLimitCheck.waitTimeSeconds || 0);
      setError(`Too many requests. Please wait ${formatTimeRemaining(rateLimitCheck.waitTimeSeconds || 0)} before requesting another code.`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Generate and store OTP
      const otpData = await generateAndStoreOTP(email, 10); // 10 minutes expiry
      
      // Send OTP via email
      await sendOTPEmail(email, otpData.code);
      
      setCurrentStep('otp');
      setTimeRemaining(10 * 60); // 10 minutes in seconds
      setAttemptsRemaining(5);
      setSuccess(`OTP sent to ${email}. Please check your email.`);
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode.trim()) {
      setError('Please enter the OTP code.');
      return;
    }
    
    if (otpCode.length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const validation: OTPValidationResult = await validateOTP(email, otpCode);
      
      if (!validation.isValid) {
        setError(validation.message);
        setAttemptsRemaining(validation.attemptsRemaining || 0);
        setIsLoading(false);
        return;
      }
      
      setCurrentStep('newPassword');
      setSuccess('OTP verified successfully. Please set your new password.');
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || 'OTP validation failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (password: string) => {
    setNewPassword(password);
    
    // Check password strength
    const strength = validatePasswordStrength(password);
    setPasswordStrength(strength);
    
    // Check for breaches on strong passwords
    if (strength.isValid && password.length >= 12) {
      setIsCheckingBreach(true);
      setBreachWarning('');
      
      try {
        const breachResult = await checkPasswordBreach(password);
        if (breachResult.isCompromised) {
          setBreachWarning(`This password has been found in ${breachResult.count.toLocaleString()} data breaches. Please choose a different password.`);
        }
      } catch (error) {
        console.warn('Breach check failed:', error);
      } finally {
        setIsCheckingBreach(false);
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }
    
    if (!passwordStrength.isValid) {
      setError(passwordStrength.message);
      return;
    }
    
    if (breachWarning) {
      setError('Please choose a password that hasn\'t been compromised in data breaches.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Reset the password
      await resetUserPassword(email, newPassword);
      
      // Invalidate all OTPs for this user
      invalidateAllOTPs(email);
      
      setCurrentStep('complete');
      setSuccess('Password reset successfully!');
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const rateLimitCheck = canRequestNewOTP(email);
    if (!rateLimitCheck.canRequest) {
      setCanRequestOTP(false);
      setWaitTime(rateLimitCheck.waitTimeSeconds || 0);
      setError(`Please wait ${formatTimeRemaining(rateLimitCheck.waitTimeSeconds || 0)} before requesting another code.`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const otpData = await generateAndStoreOTP(email, 10);
      await sendOTPEmail(email, otpData.code);
      
      setTimeRemaining(10 * 60);
      setAttemptsRemaining(5);
      setOtpCode('');
      setSuccess('New OTP sent to your email.');
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Step 1: Email Entry
  if (currentStep === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
              <p className="text-slate-400">Enter your email to receive a secure reset code</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-blue-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold text-sm">Secure OTP Process</span>
                </div>
                <ul className="text-blue-200 text-xs space-y-1">
                  <li>• 6-digit code sent to your email</li>
                  <li>• Code expires in 10 minutes</li>
                  <li>• Maximum 5 validation attempts</li>
                  <li>• Rate limited for security</li>
                </ul>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {!canRequestOTP && waitTime > 0 && (
                <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-500/10 p-3 rounded-lg">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Please wait {formatTimeRemaining(waitTime)} before requesting another code
                  </span>
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={isLoading || !canRequestOTP}
                icon={Mail}
              >
                {isLoading ? 'Sending OTP...' : 'Send Reset Code'}
              </Button>

              <Button 
                type="button"
                variant="ghost" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/login')}
                icon={ArrowLeft}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (currentStep === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Enter Verification Code</h1>
              <p className="text-slate-400">
                We sent a 6-digit code to <span className="text-white font-semibold">{email}</span>
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <Input
                type="text"
                label="6-Digit Verification Code"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                  if (error) setError('');
                }}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoComplete="one-time-code"
                autoFocus
              />

              {/* Timer and Attempts Display */}
              <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Time Remaining:
                  </span>
                  <span className={`font-mono font-bold ${timeRemaining <= 60 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Attempts Remaining:</span>
                  <span className={`font-bold ${attemptsRemaining <= 2 ? 'text-red-400' : 'text-blue-400'}`}>
                    {attemptsRemaining}/5
                  </span>
                </div>
              </div>

              {success && (
                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{success}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={isLoading || otpCode.length !== 6 || timeRemaining <= 0}
                icon={Shield}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>

              {/* Resend OTP */}
              <div className="text-center space-y-2">
                <p className="text-slate-400 text-sm">Didn't receive the code?</p>
                {canRequestOTP && timeRemaining <= 300 ? ( // Allow resend when 5 minutes or less remaining
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    icon={RefreshCw}
                  >
                    Resend Code
                  </Button>
                ) : (
                  <p className="text-slate-500 text-xs">
                    {waitTime > 0 
                      ? `Wait ${formatTimeRemaining(waitTime)} to resend`
                      : 'Resend available when timer reaches 5:00'
                    }
                  </p>
                )}
              </div>

              <Button 
                type="button"
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => {
                  setCurrentStep('email');
                  setOtpCode('');
                  setError('');
                  setSuccess('');
                }}
                icon={ArrowLeft}
              >
                Change Email Address
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: New Password
  if (currentStep === 'newPassword') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Create New Password</h1>
              <p className="text-slate-400">Choose a strong, secure password for your account</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-semibold mb-2">Enhanced Password Requirements:</p>
                <ul className="text-blue-200 text-xs space-y-1">
                  <li>• At least 12 characters long (16+ recommended)</li>
                  <li>• At least one uppercase letter (A-Z)</li>
                  <li>• At least one lowercase letter (a-z)</li>
                  <li>• At least one number (0-9)</li>
                  <li>• At least one special character (!@#$%^&*)</li>
                  <li>• Must not appear in known data breaches</li>
                </ul>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Password Strength:</span>
                    <span className={`text-sm font-semibold ${
                      passwordStrength.score >= 6 ? 'text-green-400' :
                      passwordStrength.score >= 4 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {passwordStrength.score >= 6 ? 'Strong' :
                       passwordStrength.score >= 4 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 6 ? 'bg-green-500' :
                        passwordStrength.score >= 4 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(passwordStrength.score * 16.67, 100)}%` }}
                    />
                  </div>
                  {isCheckingBreach && (
                    <p className="text-xs text-blue-400 mt-2">🔍 Checking against known data breaches...</p>
                  )}
                  {breachWarning && (
                    <p className="text-xs text-red-400 mt-2 font-semibold">⚠️ {breachWarning}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={isLoading || !passwordStrength.isValid || !!breachWarning || newPassword !== confirmPassword}
                icon={Shield}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              <Button 
                type="button"
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => setCurrentStep('otp')}
                icon={ArrowLeft}
              >
                Back to OTP Entry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Success
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Password Reset Complete!</h2>
              <p className="text-slate-300">Your password has been successfully updated.</p>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4">
                <p className="text-green-300 text-sm">
                  ✅ Password meets all security requirements<br/>
                  ✅ Not found in known data breaches<br/>
                  ✅ All OTP codes have been invalidated<br/>
                  ✅ Account security enhanced
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
              size="lg"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}