import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { findUser, saveSession } from '../../utils/userStorage';
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