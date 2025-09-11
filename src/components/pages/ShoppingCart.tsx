import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, ArrowLeft, Package, CheckCircle } from 'lucide-react';
import { getUserCart, updateCartItemQuantity, removeFromCart, clearCart, CartItem, Cart } from '../../utils/cartStorage';
import { User } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface ShoppingCartProps {
  user: User;
  onBack: () => void;
}

export default function ShoppingCart({ user, onBack }: ShoppingCartProps) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0, lastUpdated: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    const userCart = getUserCart(user.email);
    setCart(userCart);
  }, [user.email]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const updatedCart = updateCartItemQuantity(user.email, itemId, newQuantity);
    setCart(updatedCart);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = removeFromCart(user.email, itemId);
    setCart(updatedCart);
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      const emptyCart = clearCart(user.email);
      setCart(emptyCart);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate checkout process
    setTimeout(() => {
      // Clear cart after successful order
      const emptyCart = clearCart(user.email);
      setCart(emptyCart);
      setOrderComplete(true);
      setIsProcessing(false);
    }, 3000);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08; // 8% tax rate
  };

  const calculateShipping = (subtotal: number) => {
    return subtotal >= 75 ? 0 : 9.99; // Free shipping over $75
  };

  const subtotal = cart.total;
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;

  if (orderComplete) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Order Placed Successfully!</h2>
            <p className="text-slate-300">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
              <p className="text-green-300 text-sm">
                ✅ Order confirmed and processing<br/>
                ✅ Confirmation email sent<br/>
                ✅ Estimated delivery: 5-7 business days<br/>
                ✅ Tracking information will be provided
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={onBack} className="flex-1">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => window.location.href = 'mailto:roel@vipsimracing.com'}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} icon={ArrowLeft}>
          Back to Merch
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            My Cart
          </h1>
          <p className="text-slate-400">{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in cart</p>
        </div>
        <div className="w-24"></div>
      </div>

      {cart.items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
            <p className="text-slate-400 mb-6">
              Add some VIP SIM RACING merchandise to get started!
            </p>
            <Button onClick={onBack} icon={Package}>
              Browse Merch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Cart Items</h2>
                <Button variant="ghost" size="sm" onClick={handleClearCart} icon={Trash2}>
                  Clear Cart
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-slate-400">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <p className="text-sm text-green-400 font-semibold">${item.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="text-white font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-white">Order Summary</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Subtotal ({cart.itemCount} items)</span>
                  <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Tax</span>
                  <span className="text-white font-semibold">${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-400' : 'text-white'}`}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <p className="text-xs text-slate-500">
                    Free shipping on orders over $75
                  </p>
                )}
                
                <div className="border-t border-slate-600 pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-red-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                  icon={CreditCard}
                >
                  {isProcessing ? 'Processing Order...' : 'Proceed to Checkout'}
                </Button>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> This is a demo checkout. In production, this would integrate 
                    with Stripe for secure payment processing and inventory management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}