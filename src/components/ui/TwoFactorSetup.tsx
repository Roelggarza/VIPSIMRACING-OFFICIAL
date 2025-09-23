import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, Key, Copy, Check, AlertTriangle, QrCode } from 'lucide-react';
import { generate2FASetup, enable2FA, sendSMSOTP, sendEmailOTP } from '../../utils/twoFactorAuth';
import Button from './Button';
import Input from './Input';
import Card, { CardHeader, CardContent } from './Card';

interface TwoFactorSetupProps {
  userEmail: string;
  onComplete: (backupCodes: string[]) => void;
  onSkip?: () => void;
}

export default function TwoFactorSetup({ userEmail, onComplete, onSkip }: TwoFactorSetupProps) {
  const [currentStep, setCurrentStep] = useState<'method' | 'setup' | 'verify' | 'backup'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [setupData, setSetupData] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [backupEmail, setBackupEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copiedCodes, setCopiedCodes] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (currentStep === 'setup' && selectedMethod === 'totp') {
      generateTOTPSetup();
    }
  }, [currentStep, selectedMethod]);

  const generateTOTPSetup = async () => {
    try {
      const setup = await generate2FASetup(userEmail);
      setSetupData(setup);
    } catch (error) {
      setError('Failed to generate 2FA setup. Please try again.');
    }
  };

  const handleMethodSelect = (method: 'totp' | 'sms' | 'email') => {
    setSelectedMethod(method);
    setCurrentStep('setup');
    setError('');
  };

  const handleSetupComplete = async () => {
    if (selectedMethod === 'sms' && !phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (selectedMethod === 'email' && !backupEmail.trim()) {
      setError('Please enter your backup email address');
      return;
    }

    if (selectedMethod === 'sms') {
      try {
        await sendSMSOTP(phoneNumber);
        setCurrentStep('verify');
      } catch (error) {
        setError('Failed to send SMS. Please check your phone number.');
      }
    } else if (selectedMethod === 'email') {
      try {
        await sendEmailOTP(backupEmail);
        setCurrentStep('verify');
      } catch (error) {
        setError('Failed to send email. Please check your email address.');
      }
    } else {
      setCurrentStep('verify');
    }
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // In a real app, you would verify the code here
      // For demo purposes, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Enable 2FA
      enable2FA(
        userEmail,
        setupData?.secret || 'demo-secret',
        setupData?.backupCodes || [],
        selectedMethod === 'sms' ? phoneNumber : undefined,
        selectedMethod === 'email' ? backupEmail : undefined
      );

      setCurrentStep('backup');
    } catch (error) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string, codeId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCodes(prev => ({ ...prev, [codeId]: true }));
      setTimeout(() => {
        setCopiedCodes(prev => ({ ...prev, [codeId]: false }));
      }, 2000);
    });
  };

  const handleBackupComplete = () => {
    onComplete(setupData?.backupCodes || []);
  };

  if (currentStep === 'method') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Secure Your Account</h2>
          <p className="text-slate-300">
            Set up two-factor authentication to add an extra layer of security to your account.
          </p>
        </div>

        <div className="space-y-4">
          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'totp' ? 'ring-2 ring-green-500' : 'hover:bg-slate-700/50'}`}
            onClick={() => setSelectedMethod('totp')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Authenticator App (Recommended)</h3>
                  <p className="text-sm text-slate-400">
                    Use Google Authenticator, Authy, or similar apps for the most secure option.
                  </p>
                </div>
                <div className="bg-green-500/20 px-2 py-1 rounded text-xs text-green-300 font-bold">
                  MOST SECURE
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'sms' ? 'ring-2 ring-blue-500' : 'hover:bg-slate-700/50'}`}
            onClick={() => setSelectedMethod('sms')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">SMS Text Message</h3>
                  <p className="text-sm text-slate-400">
                    Receive verification codes via text message to your phone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'email' ? 'ring-2 ring-purple-500' : 'hover:bg-slate-700/50'}`}
            onClick={() => setSelectedMethod('email')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Backup Email</h3>
                  <p className="text-sm text-slate-400">
                    Use a different email address as a backup verification method.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-3">
          <Button onClick={() => handleMethodSelect(selectedMethod)} className="flex-1">
            Continue with {selectedMethod === 'totp' ? 'Authenticator App' : selectedMethod === 'sms' ? 'SMS' : 'Email'}
          </Button>
          {onSkip && (
            <Button variant="outline" onClick={onSkip}>
              Skip for Now
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'setup') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Set up {selectedMethod === 'totp' ? 'Authenticator App' : selectedMethod === 'sms' ? 'SMS' : 'Email'} Authentication
          </h2>
        </div>

        {selectedMethod === 'totp' && setupData && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img src={setupData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-slate-300 text-sm">
                Scan this QR code with your authenticator app
              </p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Manual Entry</h3>
              <p className="text-sm text-slate-400 mb-2">
                If you can't scan the QR code, enter this secret key manually:
              </p>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-800 px-3 py-2 rounded text-green-400 font-mono text-sm flex-1">
                  {setupData.secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(setupData.secret, 'secret')}
                  icon={copiedCodes.secret ? Check : Copy}
                >
                  {copiedCodes.secret ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'sms' && (
          <div className="space-y-4">
            <Input
              type="tel"
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={error}
            />
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> SMS 2FA is convenient but can be vulnerable to SIM-swapping attacks. 
                We recommend using an authenticator app for maximum security.
              </p>
            </div>
          </div>
        )}

        {selectedMethod === 'email' && (
          <div className="space-y-4">
            <Input
              type="email"
              label="Backup Email Address"
              placeholder="backup@example.com"
              value={backupEmail}
              onChange={(e) => setBackupEmail(e.target.value)}
              error={error}
            />
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-300 text-sm">
                <strong>Important:</strong> Use a different email address than your main account email. 
                This will be used as a backup verification method.
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button onClick={handleSetupComplete} className="flex-1">
            Continue
          </Button>
          <Button variant="outline" onClick={() => setCurrentStep('method')}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'verify') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Key className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verify Your Setup</h2>
          <p className="text-slate-300">
            {selectedMethod === 'totp' 
              ? 'Enter the 6-digit code from your authenticator app'
              : selectedMethod === 'sms'
              ? `Enter the code sent to ${phoneNumber}`
              : `Enter the code sent to ${backupEmail}`
            }
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            label="Verification Code"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={error}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />

          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={handleVerification} 
            disabled={isVerifying || verificationCode.length !== 6}
            className="flex-1"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Enable 2FA'}
          </Button>
          <Button variant="outline" onClick={() => setCurrentStep('setup')}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'backup') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">2FA Enabled Successfully!</h2>
          <p className="text-slate-300">
            Save these backup codes in a secure location. You can use them to access your account if you lose your device.
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-400 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Important: Save These Codes</span>
          </div>
          <ul className="text-red-300 text-sm space-y-1">
            <li>• Each code can only be used once</li>
            <li>• Store them in a password manager or write them down</li>
            <li>• Keep them in a secure, offline location</li>
            <li>• These codes cannot be regenerated</li>
          </ul>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4">Backup Recovery Codes</h3>
          <div className="grid grid-cols-2 gap-2">
            {setupData?.backupCodes?.map((code: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <code className="bg-slate-800 px-3 py-2 rounded text-green-400 font-mono text-sm flex-1">
                  {code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(code, `code-${index}`)}
                  className="p-1"
                >
                  {copiedCodes[`code-${index}`] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                const allCodes = setupData?.backupCodes?.join('\n') || '';
                copyToClipboard(allCodes, 'all-codes');
              }}
              icon={copiedCodes['all-codes'] ? Check : Copy}
              className="w-full"
            >
              {copiedCodes['all-codes'] ? 'All Codes Copied!' : 'Copy All Codes'}
            </Button>
          </div>
        </div>

        <Button onClick={handleBackupComplete} className="w-full">
          I've Saved My Backup Codes
        </Button>
      </div>
    );
  }

  return null;
}