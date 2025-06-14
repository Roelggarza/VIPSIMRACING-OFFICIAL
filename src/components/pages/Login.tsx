import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { findUser, saveSession, emailExists, resetUserPassword } from '../../utils/userStorage';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardHeader, CardContent } from '../ui/Card';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const user = findUser(form.email, form.password);
      if (!user) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }
      
      saveSession(user);
      navigate('/dashboard');
    }, 800);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!emailExists(resetEmail)) {
      setError('No account found with this email address.');
      return;
    }

    setIsLoading(true);
    
    // Simulate sending reset email and actually reset password
    setTimeout(() => {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Reset the user's password
      resetUserPassword(resetEmail, tempPassword);
      
      setResetSent(true);
      setIsLoading(false);
      setError('');
      
      // Store temp password for display (in real app, this would be sent via email)
      localStorage.setItem('tempPassword', tempPassword);
    }, 1000);
  };

  if (showResetPassword) {
    if (resetSent) {
      const tempPassword = localStorage.getItem('tempPassword');
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-white">Password Reset</h1>
                <p className="text-slate-400">Your password has been reset</p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-300 mb-3">
                    Your password has been reset successfully. Please use the temporary password below to log in:
                  </p>
                  <div className="bg-slate-800/50 rounded p-3 font-mono text-center">
                    <span className="text-white font-bold text-lg">{tempPassword}</span>
                  </div>
                  <p className="text-xs text-green-300 mt-3">
                    Please change this password after logging in for security.
                  </p>
                </div>
                
                <Button 
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetSent(false);
                    setResetEmail('');
                    localStorage.removeItem('tempPassword');
                  }}
                  variant="outline"
                  size="lg" 
                  className="w-full"
                  icon={ArrowLeft}
                >
                  Back to Login
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
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Reset Password</h1>
              <p className="text-slate-400">Enter your email to reset your password</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                name="resetEmail"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                autoComplete="email"
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
                icon={Mail}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <Button 
                type="button"
                variant="ghost" 
                size="lg" 
                className="w-full"
                onClick={() => {
                  setShowResetPassword(false);
                  setError('');
                  setResetEmail('');
                }}
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
              onClick={() => setShowResetPassword(true)}
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