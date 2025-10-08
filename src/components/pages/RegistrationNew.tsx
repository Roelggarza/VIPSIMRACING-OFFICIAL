import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RELEASE_WAIVER_TEXT } from '../../utils/constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardHeader, CardContent } from '../ui/Card';

interface FormData {
  fullName: string;
  dob: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  state: string;
  zipCode: string;
  emergencyName: string;
  emergencyPhone: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const validatePassword = (pwd: string): string | null => {
  if (pwd.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*]/.test(pwd)) return 'Password must contain at least one special character (!@#$%^&*)';
  return null;
};

export default function RegistrationNew() {
  const [form, setForm] = useState<FormData>({
    fullName: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    state: '',
    zipCode: '',
    emergencyName: '',
    emergencyPhone: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.dob) newErrors.dob = 'Date of birth is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(form.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!form.emergencyName.trim()) newErrors.emergencyName = 'Emergency contact name is required';
    if (!form.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency contact phone is required';

    if (!form.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions to register';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const { confirmPassword, agreeToTerms, ...profileData } = form;

    const { error: signUpError } = await signUp(form.email, form.password, {
      full_name: profileData.fullName,
      dob: profileData.dob,
      phone: profileData.phone,
      address: profileData.address,
      state: profileData.state,
      zip_code: profileData.zipCode,
      emergency_name: profileData.emergencyName,
      emergency_phone: profileData.emergencyPhone,
      racing_credits: 0,
      account_balance: 0,
      is_admin: false,
      is_online: false,
      is_streaming: false,
      status: 'offline'
    });

    setIsLoading(false);

    if (signUpError) {
      setErrors({ general: signUpError.message || 'Registration failed. Please try again.' });
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Registration Complete!</h2>
              <p className="text-slate-300">Welcome to VIP SIM RACING, {form.fullName}!</p>
              <p className="text-slate-400 text-sm">You can now log in to access your Racing Dashboard.</p>
            </div>

            <Button onClick={() => navigate("/login")} className="w-full">
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 py-8 px-6">
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          icon={ArrowLeft}
          className="text-slate-400 hover:text-white"
        >
          Back to Home
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">VIP SIM RACING Registration</h1>
              <p className="text-slate-400">Join VIP SIM RACING for the ultimate racing experience</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold">Liability Waiver</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {RELEASE_WAIVER_TEXT}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="fullName"
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  autoComplete="name"
                />

                <Input
                  name="dob"
                  type="date"
                  label="Date of Birth"
                  value={form.dob}
                  onChange={handleChange}
                  error={errors.dob}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <Input
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="password"
                  type="password"
                  label="Create Password"
                  placeholder="Must include uppercase, lowercase, number, and special character"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="new-password"
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-semibold mb-2">Password Requirements:</p>
                <ul className="text-blue-200 text-xs space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• At least one uppercase letter (A-Z)</li>
                  <li>• At least one lowercase letter (a-z)</li>
                  <li>• At least one number (0-9)</li>
                  <li>• At least one special character (!@#$%^&*)</li>
                </ul>
              </div>

              <Input
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                autoComplete="tel"
              />

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Address Information</h3>
                <Input
                  name="address"
                  type="text"
                  label="Street Address"
                  placeholder="Enter your street address"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                  autoComplete="street-address"
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    name="state"
                    type="text"
                    label="State"
                    placeholder="Enter your state"
                    value={form.state}
                    onChange={handleChange}
                    error={errors.state}
                    autoComplete="address-level1"
                  />

                  <Input
                    name="zipCode"
                    type="text"
                    label="ZIP Code"
                    placeholder="Enter your ZIP code"
                    value={form.zipCode}
                    onChange={handleChange}
                    error={errors.zipCode}
                    autoComplete="postal-code"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Emergency Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    name="emergencyName"
                    type="text"
                    label="Contact Name"
                    placeholder="Emergency contact name"
                    value={form.emergencyName}
                    onChange={handleChange}
                    error={errors.emergencyName}
                  />

                  <Input
                    name="emergencyPhone"
                    type="tel"
                    label="Contact Phone"
                    placeholder="Emergency contact phone"
                    value={form.emergencyPhone}
                    onChange={handleChange}
                    error={errors.emergencyPhone}
                  />
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={form.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <span className="text-white font-semibold">Agree to Terms and Conditions</span>
                    <span className="text-red-400 ml-1">*</span>
                    <p className="text-slate-300 text-sm mt-1">
                      I agree to VIP SIM RACING's Terms of Service, Privacy Policy, and the liability waiver above.
                      I understand the risks associated with racing simulation activities.
                    </p>
                    {errors.agreeToTerms && (
                      <p className="text-red-400 text-sm font-medium mt-2">{errors.agreeToTerms}</p>
                    )}
                  </div>
                </label>
              </div>

              {errors.general && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{errors.general}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-8"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register (Free)'}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-700">
              <p className="text-slate-400">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-red-500 hover:text-red-400 font-semibold underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
