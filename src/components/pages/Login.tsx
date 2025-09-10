import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Mail, ArrowLeft, AlertTriangle, Key } from 'lucide-react';
import { findUser, saveSession, emailExists, resetUserPassword } from '../../utils/userStorage';
import { generateSecurePassword } from '../../utils/passwordSecurity';
import { get2FAData, verifyTOTP, verifySMSOTP, verifyEmailOTP, verifyRecoveryCode, sendSMSOTP, sendEmailOTP } from '../../utils/twoFactorAuth';
import { recordLoginAttempt, detectAnomalies, requiresAdditionalVerification, getSimulatedIP } from '../../utils/anomalyDetection';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardHeader, CardContent } from '../ui/Card';

interface FormData {
  email: string;
  password: string;
  recaptchaToken: string;
  twoFactorCode: string;
}

export default function Login() {
  const [form, setForm] = useState<FormData>({ email: '', password: '', recaptchaToken: '', twoFactorCode: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'credentials' | '2fa' | 'additional-verification'>('credentials');
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [selectedTwoFactorMethod, setSelectedTwoFactorMethod] = useState<'totp' | 'sms' | 'email' | 'recovery'>('totp');
  const [anomalyFlags, setAnomalyFlags] = useState<any>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleRecaptchaVerify = (token: string) => {
    setForm(prev => ({ ...prev, recaptchaToken: token }));
    if (error.includes('reCAPTCHA')) setError('');
  };

  const handleRecaptchaExpired = () => {
    setForm(prev => ({ ...prev, recaptchaToken: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setIsLoading(true);
    const currentIP = getSimulatedIP();
    
    try {
      const user = await findUser(form.email, form.password);
      if (!user) {
        // Record failed login attempt
        await recordLoginAttempt(form.email, false, currentIP);
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }
      
      // Record successful login attempt
      await recordLoginAttempt(form.email, true, currentIP);
      
      // Check for 2FA
      const userTwoFactorData = get2FAData(form.email);
      if (userTwoFactorData && userTwoFactorData.isEnabled) {
        setTwoFactorData(userTwoFactorData);
        setPendingUser(user);
        setCurrentStep('2fa');
        setIsLoading(false);
        return;
      }
      
      // Check for anomalies
      const anomalies = detectAnomalies(form.email, currentIP, 'current-device-fingerprint');
      if (requiresAdditionalVerification(anomalies)) {
        setAnomalyFlags(anomalies);
        setPendingUser(user);
        setCurrentStep('additional-verification');
        setIsLoading(false);
        return;
      }
      
      // Complete login
      saveSession(user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async () => {
    if (!form.twoFactorCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let isValid = false;

      switch (selectedTwoFactorMethod) {
        case 'totp':
          isValid = verifyTOTP(form.twoFactorCode, twoFactorData.secret);
          break;
        case 'sms':
          isValid = verifySMSOTP(twoFactorData.phoneNumber, form.twoFactorCode);
          break;
        case 'email':
          isValid = verifyEmailOTP(twoFactorData.backupEmail, form.twoFactorCode);
          break;
        case 'recovery':
          isValid = verifyRecoveryCode(form.email, form.twoFactorCode);
          break;
      }

      if (!isValid) {
        setError('Invalid verification code. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check for anomalies after 2FA
      const currentIP = getSimulatedIP();
      const anomalies = detectAnomalies(form.email, currentIP, 'current-device-fingerprint');
      if (requiresAdditionalVerification(anomalies)) {
        setAnomalyFlags(anomalies);
        setCurrentStep('additional-verification');
        setIsLoading(false);
        return;
      }

      // Complete login
      saveSession(pendingUser);
      navigate('/dashboard');
    } catch (error) {
      setError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAdditionalVerification = async () => {
    // For demo purposes, we'll just complete the login after showing the warning
    setIsLoading(true);
    
    // Simulate additional verification delay
    setTimeout(() => {
      saveSession(pendingUser);
      navigate('/dashboard');
    }, 2000);
  };

  const sendTwoFactorCode = async (method: 'sms' | 'email') => {
    try {
      if (method === 'sms' && twoFactorData.phoneNumber) {
        await sendSMSOTP(twoFactorData.phoneNumber);
        setSelectedTwoFactorMethod('sms');
        setError('');
      } else if (method === 'email' && twoFactorData.backupEmail) {
        await sendEmailOTP(twoFactorData.backupEmail);
        setSelectedTwoFactorMethod('email');
        setError('');
      }
    } catch (error) {
      setError(`Failed to send ${method.toUpperCase()} code. Please try again.`);
    }
  };

  // 2FA Step
  if (currentStep === '2fa') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <LogIn className="w-6 h-6 text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Two-Factor Authentication</h1>
              <p className="text-slate-400">Enter your verification code to continue</p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* 2FA Method Selection */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedTwoFactorMethod === 'totp' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTwoFactorMethod('totp')}
                  className="text-xs"
                >
                  Authenticator App
                </Button>
                {twoFactorData.phoneNumber && (
                  <Button
                    variant={selectedTwoFactorMethod === 'sms' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => sendTwoFactorCode('sms')}
                    className="text-xs"
                  >
                    SMS Code
                  </Button>
                )}
                {twoFactorData.backupEmail && (
                  <Button
                    variant={selectedTwoFactorMethod === 'email' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => sendTwoFactorCode('email')}
                    className="text-xs"
                  >
                    Email Code
                  </Button>
                )}
                <Button
                  variant={selectedTwoFactorMethod === 'recovery' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTwoFactorMethod('recovery')}
                  className="text-xs"
                >
                  Recovery Code
                </Button>
              </div>

              <Input
                name="twoFactorCode"
                type="text"
                label={
                  selectedTwoFactorMethod === 'totp' ? 'Authenticator Code' :
                  selectedTwoFactorMethod === 'sms' ? 'SMS Code' :
                  selectedTwoFactorMethod === 'email' ? 'Email Code' :
                  'Recovery Code'
                }
                placeholder={selectedTwoFactorMethod === 'recovery' ? 'Enter recovery code' : '123456'}
                value={form.twoFactorCode}
                onChange={(e) => setForm(prev => ({ ...prev, twoFactorCode: e.target.value }))}
                error={error}
                maxLength={selectedTwoFactorMethod === 'recovery' ? 8 : 6}
                className="text-center text-xl tracking-widest"
              />

              <Button 
                onClick={handle2FASubmit}
                disabled={isLoading || !form.twoFactorCode.trim()}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>

              <Button 
                variant="outline"
                onClick={() => {
                  setCurrentStep('credentials');
                  setForm(prev => ({ ...prev, twoFactorCode: '' }));
                  setError('');
                }}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Additional Verification Step
  if (currentStep === 'additional-verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Additional Verification Required</h1>
              <p className="text-slate-400">We detected unusual activity on your account</p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-300 mb-2">Security Alert</h3>
                <ul className="text-yellow-200 text-sm space-y-1">
                  {anomalyFlags?.newDevice && <li>• Login from a new device</li>}
                  {anomalyFlags?.suspiciousIP && <li>• Login from a new location</li>}
                  {anomalyFlags?.multipleFailedAttempts && <li>• Multiple failed login attempts detected</li>}
                  {anomalyFlags?.rapidAttempts && <li>• Rapid login attempts detected</li>}
                </ul>
              </div>

              <p className="text-slate-300 text-sm">
                For your security, we need to verify this login attempt. This helps protect your account from unauthorized access.
              </p>

              <Button 
                onClick={handleAdditionalVerification}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <Button 
                variant="outline"
                onClick={() => {
                  setCurrentStep('credentials');
                  setPendingUser(null);
                  setAnomalyFlags(null);
                  setError('');
                }}
                className="w-full"
              >
                Cancel Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-slate-400">Sign in to access your Racing Dashboard</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

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
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-red-500 hover:text-red-400 font-semibold underline text-sm"
            >
              Forgot your password?
            </button>
          </div>

          <div className="text-center pt-6 border-t border-slate-700 mt-6">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-red-500 hover:text-red-400 font-semibold underline"
              >
                Register here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}