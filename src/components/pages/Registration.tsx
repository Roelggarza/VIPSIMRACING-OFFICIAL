import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertTriangle, CheckCircle, CreditCard, ChevronDown, ChevronUp, Crown, Zap, Gift, FileText } from 'lucide-react';
import { saveUser, emailExists, addCreditsAndBalance } from '../../utils/userStorage';
import { validatePasswordStrength } from '../../utils/passwordSecurity';
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
  optInGiveaway: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function Registration() {
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
    optInGiveaway: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPackages, setShowPackages] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error when user starts typing
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
    } else if (emailExists(form.email)) {
      newErrors.email = 'Email is already registered. Please login instead.';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePasswordStrength(form.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
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
    
    // Terms and conditions validation
    if (!form.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions to register';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Remove confirmPassword, agreeToTerms, and optInGiveaway from the data sent to saveUser
      const { confirmPassword, agreeToTerms, optInGiveaway, ...userData } = form;
      await saveUser(userData);
      setSubmitted(true);
      setIsLoading(false);
    } catch (error: any) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
      setIsLoading(false);
    }
  };

  const handlePackagePurchase = async (packageData: any) => {
    if (!validateForm()) return;

    setIsProcessingPayment(true);
    setSelectedPackage(packageData.id);

    try {
      // Remove confirmPassword, agreeToTerms, and optInGiveaway from the data sent to saveUser
      const { confirmPassword, agreeToTerms, optInGiveaway, ...userData } = form;
      
      // Save user first
      await saveUser(userData);
      
      // Add package to user account
      addCreditsAndBalance(form.email, packageData);
      
      setSubmitted(true);
      setIsProcessingPayment(false);
    } catch (error: any) {
      console.error('Package purchase failed:', error);
      setIsProcessingPayment(false);
      setErrors({ general: error.message || 'Package purchase failed. Please try again.' });
    }
  };

  const racingPackages = [
    {
      id: 'basic',
      name: 'TrackPass Basic',
      price: 30,
      duration: '30 min',
      description: '1 Driver',
      features: ['30 minutes of racing', '1 driver', 'Basic telemetry'],
      color: 'from-slate-500/20 to-slate-600/10',
      credits: 30
    },
    {
      id: 'plus',
      name: 'TrackPass Plus',
      price: 45,
      duration: '30 min',
      description: '2 Drivers',
      features: ['30 minutes of racing', '2 drivers', 'Advanced telemetry', 'Photo package'],
      color: 'from-blue-500/20 to-blue-600/10',
      credits: 30
    },
    {
      id: 'pro',
      name: 'TrackPass Pro',
      price: 60,
      duration: '30 min',
      description: '3 Drivers',
      features: ['30 minutes of racing', '3 drivers', 'Pro telemetry', 'Video recording', 'Coaching tips'],
      color: 'from-purple-500/20 to-purple-600/10',
      credits: 30
    },
    {
      id: 'elite',
      name: 'TrackPass Elite',
      price: 99.99,
      duration: '30 min',
      description: '4 Drivers',
      features: ['30 minutes of racing', '4 drivers', 'Elite telemetry', 'Professional video', 'Personal coaching', 'Priority booking'],
      color: 'from-amber-500/20 to-amber-600/10',
      credits: 30
    }
  ];

  const vipMembership = {
    id: 'vip',
    name: 'TrackPass VIP Membership',
    price: 49.99,
    duration: 'monthly',
    description: '25% discount + 30 minutes included',
    features: [
      '25% discount on all sessions',
      '30 minutes of racing credits included',
      '4 guest passes per month',
      '2 free entries/month to exclusive events',
      'Exclusive merch drops and giveaways',
      'Priority access to bookings',
      'Recognition on VIP leaderboard'
    ],
    color: 'from-red-500/20 to-red-600/10',
    credits: 30,
    savings: 'Save $10.01 vs TrackPass Pro!'
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
              <p className="text-slate-300">Welcome to VIP Edge, {form.fullName}!</p>
              {selectedPackage && (
                <p className="text-green-400 text-sm">
                  Your {selectedPackage === 'vip' ? 'VIP membership' : 'racing package'} has been activated!
                </p>
              )}
              {form.optInGiveaway && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3 mt-4">
                  <div className="flex items-center justify-center space-x-2 text-yellow-300 mb-2">
                    <Gift className="w-5 h-5" />
                    <span className="font-bold">C7 Z06 GIVEAWAY ENTRY CONFIRMED!</span>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    You're entered to win a Chevrolet Corvette C7 Z06! <strong>NO PURCHASE NECESSARY.</strong> 
                    Winner will be announced on our social media channels.
                  </p>
                  <p className="text-yellow-300 text-xs mt-2 font-bold">
                    🏆 FREE TO ENTER • NO PURCHASE REQUIRED • VOID WHERE PROHIBITED 🏆
                  </p>
                </div>
              )}
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
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Racing Simulator Registration</h1>
              <p className="text-slate-400">Join VIP Edge for the ultimate racing experience</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* C7 Z06 Giveaway Banner - Enhanced with NO PURCHASE NECESSARY */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Gift className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-yellow-300">WIN A C7 Z06 CORVETTE!</h2>
                <Gift className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-yellow-200 font-bold text-lg">
                  🏆 FREE GIVEAWAY - NO PURCHASE NECESSARY 🏆
                </p>
                <p className="text-yellow-100 text-sm">
                  Register today and opt-in below for your chance to win a Chevrolet Corvette C7 Z06! 
                  <strong> NO PURCHASE NECESSARY TO ENTER OR WIN.</strong> Registration is completely free.
                </p>
                <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-3 mt-3">
                  <p className="text-yellow-200 text-xs font-bold">
                    ⚖️ LEGAL: NO PURCHASE NECESSARY. A PURCHASE WILL NOT INCREASE YOUR CHANCES OF WINNING. 
                    VOID WHERE PROHIBITED. Winner announced on our social media channels. ⚖️
                  </p>
                </div>
              </div>
            </div>

            {/* Liability Waiver */}
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

              {/* Password Requirements */}
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

              {/* Address Section */}
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

              {/* Terms and Conditions & Giveaway Opt-in */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Agreement & Opt-ins</h3>
                
                {/* Terms and Conditions */}
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
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-semibold">Agree to Terms and Conditions</span>
                        <span className="text-red-400">*</span>
                      </div>
                      <p className="text-slate-300 text-sm">
                        I agree to VIP Edge Racing's Terms of Service, Privacy Policy, and the liability waiver above. 
                        I understand the risks associated with racing simulation activities.
                      </p>
                      {errors.agreeToTerms && (
                        <p className="text-red-400 text-sm font-medium mt-2">{errors.agreeToTerms}</p>
                      )}
                    </div>
                  </label>
                </div>

                {/* C7 Z06 Giveaway Opt-in - Enhanced with NO PURCHASE NECESSARY */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/40 rounded-lg p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="optInGiveaway"
                      checked={form.optInGiveaway}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-yellow-500 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Gift className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 font-bold">ENTER FREE C7 Z06 GIVEAWAY</span>
                      </div>
                      <p className="text-yellow-200 text-sm mb-2">
                        <strong>NO PURCHASE NECESSARY!</strong> Enter me in the free Chevrolet Corvette C7 Z06 giveaway. 
                        I understand this is completely optional and does not affect my registration in any way.
                      </p>
                      <div className="bg-yellow-500/20 border border-yellow-400/50 rounded p-2 mb-2">
                        <p className="text-yellow-200 text-xs">
                          <strong>IMPORTANT:</strong> This giveaway is FREE TO ENTER. You do not need to purchase anything 
                          to enter or win. A purchase will not increase your chances of winning. Winner will be selected 
                          randomly and announced on VIP Edge Racing social media channels.
                        </p>
                      </div>
                      <p className="text-yellow-300 text-xs font-bold">
                        🏆 FREE TO ENTER • NO PURCHASE REQUIRED • VOID WHERE PROHIBITED 🏆
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Display */}
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
                disabled={isLoading || isProcessingPayment}
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

        {/* Racing Packages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-white">Get Started with Racing Packages</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowPackages(!showPackages)}
                icon={showPackages ? ChevronUp : ChevronDown}
              >
                {showPackages ? 'Hide' : 'Show'} Packages
              </Button>
            </div>
          </CardHeader>
          
          {showPackages && (
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-slate-300">
                  Skip the wait! Purchase a racing package during registration and start racing immediately.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> The C7 Z06 giveaway is completely separate and FREE. 
                    You can enter the giveaway without purchasing anything!
                  </p>
                </div>
              </div>

              {/* VIP Membership - Featured */}
              <div className="border-2 border-red-500/50 rounded-lg p-1 bg-gradient-to-r from-red-500/10 to-red-600/5">
                <Card className={`bg-gradient-to-br ${vipMembership.color} border-0`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{vipMembership.name}</h3>
                          <p className="text-red-300 font-semibold">${vipMembership.price}/{vipMembership.duration}</p>
                          <p className="text-green-400 text-sm font-bold">{vipMembership.savings}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="bg-red-500/20 px-3 py-1 rounded-full">
                          <span className="text-red-300 text-sm font-bold flex items-center">
                            <Crown className="w-3 h-3 mr-1" />
                            BEST VALUE
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-4">{vipMembership.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-2 mb-6">
                      {vipMembership.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => handlePackagePurchase(vipMembership)}
                      disabled={isProcessingPayment || isLoading}
                      icon={Crown}
                    >
                      {isProcessingPayment && selectedPackage === 'vip' 
                        ? 'Processing...' 
                        : `Register + VIP Membership ($${vipMembership.price})`
                      }
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Regular Packages */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {racingPackages.map((pkg) => (
                  <Card key={pkg.id} className={`bg-gradient-to-br ${pkg.color}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-slate-700/30 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{pkg.name}</h3>
                          <p className="text-slate-300 text-sm">${pkg.price} / {pkg.duration}</p>
                        </div>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-2">{pkg.description}</p>
                      <p className="text-green-400 text-xs font-semibold mb-4">+{pkg.credits} minutes</p>
                      
                      <div className="space-y-2 mb-6">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-slate-300">
                            <div className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handlePackagePurchase(pkg)}
                        disabled={isProcessingPayment || isLoading}
                      >
                        {isProcessingPayment && selectedPackage === pkg.id 
                          ? 'Processing...' 
                          : `Register + ${pkg.name}`
                        }
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-400 mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold text-sm">Why Purchase During Registration?</span>
                </div>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• Start racing immediately after registration</li>
                  <li>• No additional setup required</li>
                  <li>• VIP membership offers the best value with 25% ongoing savings</li>
                  <li>• All packages include professional telemetry and support</li>
                  <li>• <strong>Remember:</strong> C7 Z06 giveaway entry is FREE regardless of purchase!</li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}