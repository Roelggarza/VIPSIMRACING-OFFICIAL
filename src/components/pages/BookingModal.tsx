import React, { useState } from 'react';
import { Calendar, Clock, Users, CreditCard, CheckCircle, AlertCircle, Timer, Wallet } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import StripeCheckout from './StripeCheckout';
import { User, addCreditsAndBalance, formatCreditsDisplay } from '../../utils/userStorage';

interface BookingModalProps {
  package: any;
  user: User;
  onClose: () => void;
  onComplete: (updatedUser: User) => void;
}

export default function BookingModal({ package: pkg, user, onClose, onComplete }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState<'booking' | 'payment' | 'complete'>('booking');
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: 0,
    specialRequests: '',
    paymentMethod: 'stripe'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [transaction, setTransaction] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // VIP membership doesn't need session booking
    if (pkg.id !== 'vip') {
      if (!bookingData.date) newErrors.date = 'Please select a date';
      if (!bookingData.time) newErrors.time = 'Please select a time';
      
      // Check if date is in the future
      const selectedDate = new Date(bookingData.date + 'T' + bookingData.time);
      if (selectedDate <= new Date()) {
        newErrors.date = 'Please select a future date and time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!validateForm()) return;
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (paymentData: any) => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      try {
        // Add credits and balance to user account
        const newTransaction = addCreditsAndBalance(user.email, pkg);
        setTransaction(newTransaction);
        
        // Get updated user data
        const updatedUser = {
          ...user,
          racingCredits: (user.racingCredits || 0) + (pkg.credits || 0),
          accountBalance: (user.accountBalance || 0) + pkg.price,
          ...(pkg.id === 'vip' && {
            vipMembership: {
              active: true,
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              discount: 25
            }
          })
        };
        
        setIsProcessing(false);
        setIsBooked(true);
        setCurrentStep('complete');
        
        // Auto-close after success and update parent
        setTimeout(() => {
          onComplete(updatedUser);
        }, 3000);
      } catch (error) {
        console.error('Purchase failed:', error);
        setErrors({ general: 'Purchase failed. Please try again.' });
        setIsProcessing(false);
      }
    }, 2000);
  };

  const getMaxGuests = () => {
    if (pkg.id === 'basic') return 0;
    if (pkg.id === 'plus') return 1;
    if (pkg.id === 'pro') return 2;
    if (pkg.id === 'elite') return 3;
    return 0;
  };

  const getTotalPrice = () => {
    let price = pkg.price;
    
    // Apply VIP discount if user has active membership
    if (user.vipMembership?.active && new Date(user.vipMembership.expiryDate) > new Date()) {
      price = price * (1 - user.vipMembership.discount / 100);
    }
    
    return price;
  };

  const getCreditsToAdd = () => {
    return pkg.credits || 0;
  };

  if (currentStep === 'payment') {
    return (
      <StripeCheckout
        package={pkg}
        user={user}
        onBack={() => setCurrentStep('booking')}
        onComplete={handlePaymentComplete}
      />
    );
  }

  if (currentStep === 'complete' && isBooked && transaction) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Purchase Successful!</h3>
          <p className="text-slate-300">Your {pkg.name} has been purchased successfully.</p>
          
          <div className="bg-slate-700/30 rounded-lg p-4 mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Package:</span>
              <span className="text-white font-semibold">{pkg.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Amount Paid:</span>
              <span className="text-green-400 font-semibold">${getTotalPrice().toFixed(2)}</span>
            </div>
            {getCreditsToAdd() > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Credits Added:</span>
                <span className="text-blue-400 font-semibold">{formatCreditsDisplay(getCreditsToAdd())}</span>
              </div>
            )}
            {pkg.id === 'vip' && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">VIP Status:</span>
                <span className="text-red-400 font-semibold">Activated</span>
              </div>
            )}
            
            {pkg.id !== 'vip' && bookingData.date && bookingData.time && (
              <>
                <div className="border-t border-slate-600 pt-3">
                  <p className="text-sm text-slate-400 mb-2">Session Details:</p>
                  <p className="text-white font-semibold">{new Date(bookingData.date + 'T' + bookingData.time).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p className="text-white">{bookingData.time}</p>
                  {bookingData.guests > 0 && (
                    <p className="text-slate-300 text-sm">{bookingData.guests} guest{bookingData.guests > 1 ? 's' : ''} included</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) return null;

  const isVipPurchase = pkg.id === 'vip';
  const currentCredits = user.racingCredits || 0;
  const currentBalance = user.accountBalance || 0;
  const newCredits = currentCredits + getCreditsToAdd();
  const newBalance = currentBalance + getTotalPrice();

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleProceedToPayment(); }} className="space-y-6">
      {/* Package Summary */}
      <div className={`bg-gradient-to-br ${pkg.color} rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
            <p className="text-slate-300">{pkg.description}</p>
            {getCreditsToAdd() > 0 && (
              <p className="text-green-400 text-sm font-semibold mt-1">
                +{formatCreditsDisplay(getCreditsToAdd())} racing credits
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">${getTotalPrice().toFixed(2)}</p>
            <p className="text-slate-400 text-sm">
              {pkg.duration === 'monthly' ? '/month' : `/ ${pkg.duration}`}
            </p>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-semibold text-white">Account Summary</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center">
                <Timer className="w-4 h-4 mr-1" />
                Current Credits:
              </span>
              <span className="text-green-400 font-semibold">{formatCreditsDisplay(currentCredits)}</span>
            </div>
            {getCreditsToAdd() > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">After Purchase:</span>
                <span className="text-green-500 font-bold">{formatCreditsDisplay(newCredits)}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center">
                <Wallet className="w-4 h-4 mr-1" />
                Current Balance:
              </span>
              <span className="text-blue-400 font-semibold">${currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">After Purchase:</span>
              <span className="text-blue-500 font-bold">${newBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Details - Only for non-VIP packages */}
      {!isVipPurchase && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
            Session Details (Optional)
          </h3>
          <p className="text-sm text-slate-400">
            You can book a session now or use your credits later from the dashboard.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              name="date"
              type="date"
              label="Preferred Date (Optional)"
              value={bookingData.date}
              onChange={handleChange}
              error={errors.date}
              min={new Date().toISOString().split('T')[0]}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Preferred Time (Optional)
              </label>
              <select
                name="time"
                value={bookingData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="20:00">8:00 PM</option>
              </select>
              {errors.time && <p className="text-sm text-red-400 font-medium">{errors.time}</p>}
            </div>
          </div>

          {getMaxGuests() > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Number of Guests (Max: {getMaxGuests()})
              </label>
              <select
                name="guests"
                value={bookingData.guests}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Array.from({ length: getMaxGuests() + 1 }, (_, i) => (
                  <option key={i} value={i}>{i} guest{i !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Special Requests (Optional)
            </label>
            <textarea
              name="specialRequests"
              value={bookingData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requirements or preferences..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-semibold text-white">Payment Summary</h3>
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

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            {errors.general || 'Please fix the errors above'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="submit" 
          size="lg" 
          className="flex-1"
          disabled={isProcessing}
          icon={CreditCard}
        >
          Proceed to Secure Checkout
        </Button>
        
        <Button 
          type="button"
          variant="outline" 
          size="lg" 
          className="flex-1"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}