import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardHeader, CardContent } from '../ui/Card';

interface StripeCheckoutProps {
  package: any;
  user: any;
  onBack: () => void;
  onComplete: (paymentData: any) => void;
}

export default function StripeCheckout({ package: pkg, user, onBack, onComplete }: StripeCheckoutProps) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('billing.')) {
      const field = name.split('.')[1];
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      let formattedValue = value;
      
      // Format card number
      if (name === 'cardNumber') {
        formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
        if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
      }
      
      // Format expiry date
      if (name === 'expiryDate') {
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
        if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
      }
      
      // Format CVV
      if (name === 'cvv') {
        formattedValue = value.replace(/\D/g, '').slice(0, 4);
      }
      
      setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!paymentData.cardNumber.replace(/\s/g, '') || paymentData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!paymentData.billingAddress.street.trim()) {
      newErrors['billing.street'] = 'Street address is required';
    }
    
    if (!paymentData.billingAddress.city.trim()) {
      newErrors['billing.city'] = 'City is required';
    }
    
    if (!paymentData.billingAddress.state.trim()) {
      newErrors['billing.state'] = 'State is required';
    }
    
    if (!paymentData.billingAddress.zipCode.trim()) {
      newErrors['billing.zipCode'] = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowDemo(true);
    }, 3000);
  };

  const getTotalPrice = () => {
    let price = pkg.price;
    
    // Apply VIP discount if user has active membership
    if (user.vipMembership?.active && new Date(user.vipMembership.expiryDate) > new Date()) {
      price = price * (1 - user.vipMembership.discount / 100);
    }
    
    return price;
  };

  if (showDemo) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-blue-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Payment Integration Demo</h3>
          <p className="text-slate-300">This is a demonstration of the Stripe checkout flow.</p>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Package:</span>
              <span className="text-white font-semibold">{pkg.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Amount:</span>
              <span className="text-green-400 font-semibold">${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Payment Method:</span>
              <span className="text-white">**** **** **** {paymentData.cardNumber.slice(-4)}</span>
            </div>
            
            <div className="border-t border-blue-500/30 pt-3">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> This is a demo environment. No actual payment has been processed. 
                In production, this would integrate with Stripe's secure payment processing.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={() => onComplete({ demo: true, package: pkg })}>
            Continue with Demo Purchase
          </Button>
          <Button variant="outline" onClick={onBack}>
            Back to Package Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack} icon={ArrowLeft}>
          Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white">Secure Checkout</h2>
          <p className="text-slate-400 text-sm">Complete your purchase with Stripe</p>
        </div>
      </div>

      {/* Package Summary */}
      <Card className={`bg-gradient-to-br ${pkg.color}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
              <p className="text-slate-300">{pkg.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">${getTotalPrice().toFixed(2)}</p>
              {user.vipMembership?.active && (
                <p className="text-green-400 text-sm">VIP Discount Applied</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-400 mb-2">
          <Lock className="w-5 h-5" />
          <span className="font-semibold">Secure Payment</span>
        </div>
        <p className="text-sm text-green-300">
          Your payment information is encrypted and processed securely by Stripe. 
          We never store your card details on our servers.
        </p>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              name="cardNumber"
              type="text"
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={handleChange}
              error={errors.cardNumber}
              autoComplete="cc-number"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="expiryDate"
                type="text"
                label="Expiry Date"
                placeholder="MM/YY"
                value={paymentData.expiryDate}
                onChange={handleChange}
                error={errors.expiryDate}
                autoComplete="cc-exp"
              />

              <Input
                name="cvv"
                type="text"
                label="CVV"
                placeholder="123"
                value={paymentData.cvv}
                onChange={handleChange}
                error={errors.cvv}
                autoComplete="cc-csc"
              />
            </div>

            <Input
              name="cardholderName"
              type="text"
              label="Cardholder Name"
              placeholder="John Doe"
              value={paymentData.cardholderName}
              onChange={handleChange}
              error={errors.cardholderName}
              autoComplete="cc-name"
            />
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">Billing Address</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              name="billing.street"
              type="text"
              label="Street Address"
              placeholder="123 Main Street"
              value={paymentData.billingAddress.street}
              onChange={handleChange}
              error={errors['billing.street']}
              autoComplete="billing street-address"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="billing.city"
                type="text"
                label="City"
                placeholder="New York"
                value={paymentData.billingAddress.city}
                onChange={handleChange}
                error={errors['billing.city']}
                autoComplete="billing address-level2"
              />

              <Input
                name="billing.state"
                type="text"
                label="State"
                placeholder="NY"
                value={paymentData.billingAddress.state}
                onChange={handleChange}
                error={errors['billing.state']}
                autoComplete="billing address-level1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="billing.zipCode"
                type="text"
                label="ZIP Code"
                placeholder="10001"
                value={paymentData.billingAddress.zipCode}
                onChange={handleChange}
                error={errors['billing.zipCode']}
                autoComplete="billing postal-code"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Country</label>
                <select
                  name="billing.country"
                  value={paymentData.billingAddress.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">Order Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">{pkg.name}</span>
                <span className="text-white font-semibold">${pkg.price}</span>
              </div>
              
              {user.vipMembership?.active && new Date(user.vipMembership.expiryDate) > new Date() && (
                <div className="flex justify-between items-center text-green-400">
                  <span>VIP Discount (25%)</span>
                  <span>-${(pkg.price * 0.25).toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-slate-600 pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-red-400">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Please fix the errors above</span>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          size="lg" 
          className="w-full"
          disabled={isProcessing}
          icon={isProcessing ? undefined : Lock}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            `Pay $${getTotalPrice().toFixed(2)} Securely`
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
          This is a demo environment - no actual charges will be made.
        </p>
      </form>
    </div>
  );
}