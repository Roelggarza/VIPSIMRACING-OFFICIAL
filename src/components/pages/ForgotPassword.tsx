import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardHeader, CardContent } from '../ui/Card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error: resetError } = await resetPassword(email);

    setIsLoading(false);

    if (resetError) {
      setError('An error occurred. Please try again.');
      return;
    }

    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
              <p className="text-slate-400">Password reset instructions sent</p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-300">
                  If an account exists for <strong>{email}</strong>, a password reset link has been sent.
                  Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Didn't receive an email? Check your spam folder or try again.
              </p>

              <Button
                onClick={() => navigate('/login')}
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
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/login')}
          icon={ArrowLeft}
          className="text-slate-400 hover:text-white"
        >
          Back to Login
        </Button>
      </div>

      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
            <p className="text-slate-400">Enter your email to receive reset instructions</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                For security reasons, we'll send a reset link if an account exists for this email.
                This helps protect your privacy.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
