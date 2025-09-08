import React, { useState } from 'react';
import { Key, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { validatePasswordStrength, checkPasswordBreach, hashPassword } from '../../utils/passwordSecurity';
import { verifyPassword } from '../../utils/passwordSecurity';
import { getUsers, updateUser } from '../../utils/userStorage';
import Button from './Button';
import Input from './Input';

interface PasswordResetProps {
  userEmail: string;
  onComplete: () => void;
}

export default function PasswordReset({ userEmail, onComplete }: PasswordResetProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', isValid: false });
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachWarning, setBreachWarning] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNewPasswordChange = async (password: string) => {
    setNewPassword(password);
    
    // Clear previous errors
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: '' }));
    }
    
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

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (!passwordStrength.isValid) {
      newErrors.newPassword = passwordStrength.message;
    } else if (breachWarning) {
      newErrors.newPassword = 'Please choose a password that hasn\'t been compromised in data breaches';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Get current user data
      const users = getUsers();
      const user = users.find(u => u.email === userEmail);
      
      if (!user) {
        setErrors({ general: 'User not found' });
        setIsLoading(false);
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        setIsLoading(false);
        return;
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update user password
      const updatedUser = { ...user, passwordHash: newPasswordHash };
      updateUser(updatedUser);

      // Show success
      setSuccess(true);

      // Auto-complete after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      setErrors({ general: 'Failed to update password. Please try again.' });
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Password Updated Successfully!</h3>
          <p className="text-slate-300">Your password has been changed and your account is now more secure.</p>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4">
            <p className="text-green-300 text-sm">
              ✅ Password meets all security requirements<br/>
              ✅ Not found in known data breaches<br/>
              ✅ All other sessions have been logged out
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <Key className="w-12 h-12 text-blue-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Change Password</h2>
        <p className="text-slate-400">Update your password to keep your account secure</p>
      </div>

      {/* Current Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Current Password</label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your current password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-sm text-red-400 font-medium">{errors.currentPassword}</p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">New Password</label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => handleNewPasswordChange(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-sm text-red-400 font-medium">{errors.newPassword}</p>
        )}
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
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-400 font-medium">{errors.confirmPassword}</p>
        )}
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

      {/* Error Display */}
      {errors.general && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{errors.general}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading || !passwordStrength.isValid || !!breachWarning}
        icon={Key}
      >
        {isLoading ? 'Updating Password...' : 'Update Password'}
      </Button>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <p className="text-yellow-300 text-sm">
          <strong>Security Note:</strong> Changing your password will log you out of all other devices and sessions for security.
        </p>
      </div>
    </form>
  );
}