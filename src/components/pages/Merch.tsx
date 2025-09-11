import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Star, AlertCircle, Bell, CheckCircle } from 'lucide-react';
import { addAdminNotification } from '../../utils/userStorage';
import Button from '../ui/Button';
import Card, { CardHeader, CardContent } from '../ui/Card';

interface MerchItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  category: 'hoodie' | 'hat' | 'tshirt' | 'longsleeve';
}

export default function Merch() {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null);
  const [email, setEmail] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const merchItems: MerchItem[] = [
    {
      id: 'vip-hoodie',
      name: 'VIP SIM RACING Hoodie',
      price: 50,
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
      description: 'Premium quality hoodie with VIP SIM RACING logo. Perfect for the track or casual wear.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Red', 'Gray'],
      inStock: false,
      category: 'hoodie'
    },
    {
      id: 'racing-hat',
      name: 'VIP SIM RACING Cap',
      price: 30,
      image: 'https://scontent-hou1-1.xx.fbcdn.net/v/t1.15752-9/546324934_776648631730648_2379102014874501461_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_ohc=8iKNRkMmz5oQ7kNvwHxQmqN&_nc_oc=Adn4ORoXXu5hNCV4cG_dVtxpCusgyc8BGy-W026st_F39qdw2kkdU1_kO6oR8SrhE6nSn2b6bhzuW_nksczMhyfj&_nc_zt=23&_nc_ht=scontent-hou1-1.xx&oh=03_Q7cD3QE056990pOMYGvC8zdmg3mJPmmPB49AvHO_Y4fF8vBpCQ&oe=68E89F6B',
      description: 'Adjustable racing cap with embroidered VIP SIM RACING logo. One size fits all.',
      sizes: ['One Size'],
      colors: ['Black', 'Red', 'White'],
      inStock: false,
      category: 'hat'
    },
    {
      id: 'racing-tshirt',
      name: 'VIP SIM RACING T-Shirt',
      price: 25,
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
      description: 'Comfortable cotton t-shirt with VIP SIM RACING design. Perfect for everyday wear.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Red', 'White', 'Gray'],
      inStock: false,
      category: 'tshirt'
    },
    {
      id: 'longsleeve-shirt',
      name: 'VIP SIM RACING Long Sleeve',
      price: 30,
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
      description: 'Long sleeve shirt with VIP SIM RACING branding. Great for cooler weather.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Red', 'Navy'],
      inStock: false,
      category: 'longsleeve'
    }
  ];

  const handleNotifyMe = (itemId: string) => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Store notification request (in a real app, this would go to a backend)
    const existingNotifications = JSON.parse(localStorage.getItem('merch_notifications') || '[]');
    const newNotification = {
      email: email.trim(),
      itemId,
      timestamp: new Date().toISOString()
    };

    existingNotifications.push(newNotification);
    localStorage.setItem('merch_notifications', JSON.stringify(existingNotifications));

    // Add admin notification
    addAdminNotification({
      type: 'merch_notification',
      title: 'New Merch Restock Notification',
      message: `${email.trim()} signed up for merch restock notifications`,
      data: {
        email: email.trim(),
        itemId: itemId === 'all-items' ? 'All Items' : itemId,
        timestamp: new Date().toISOString()
      }
    });

    // Show thank you message
    setShowThankYou(true);
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
    
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            icon={ArrowLeft}
            className="text-slate-400 hover:text-white"
          >
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">VIP SIM RACING Merch</h1>
            <p className="text-xl text-slate-300">Show your racing spirit</p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Coming Soon Banner */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <ShoppingBag className="w-8 h-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Coming Soon!</h2>
              <ShoppingBag className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-purple-200 text-lg mb-4">
              Our exclusive VIP SIM RACING merchandise is currently in production. 
              Get ready to show your racing pride with premium quality gear!
            </p>
            <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg p-4">
              <p className="text-purple-300 text-sm font-semibold">
                🚀 All items are currently sold out but will be restocked soon! 
                Sign up for notifications to be the first to know when they're available.
              </p>
              
              {/* Notification Signup */}
              <div className="mt-4 space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter email for restock alerts"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300"
                  onClick={() => handleNotifyMe('all-items')}
                  icon={Bell}
                >
                  Notify When Available
                </Button>
                
                {/* Thank You Message */}
                {showThankYou && (
                  <div className="flex items-center justify-center space-x-2 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Thank you for signing up! We'll notify you when items are available.</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Merch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {merchItems.map((item) => (
            <Card key={item.id} className="group hover:scale-105 transition-all duration-300">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden rounded-t-xl">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Sold Out Overlay */}
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                      <span className="text-red-400 font-bold text-lg">SOLD OUT</span>
                      <p className="text-slate-300 text-sm mt-1">Restocking Soon</p>
                    </div>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white font-bold">${item.price}</span>
                  </div>
                </div>
                
                {/* Product Details - Simplified */}
                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-1">Available in:</div>
                    <div className="text-white text-sm font-medium">{item.sizes.join(', ')}</div>
                    <div className="text-slate-300 text-sm">{item.colors.join(', ')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Premium Quality</h3>
              <p className="text-slate-300">
                All merchandise is made with high-quality materials and professional printing techniques.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10">
            <CardContent className="p-6 text-center">
              <ShoppingBag className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Exclusive Designs</h3>
              <p className="text-slate-300">
                Unique VIP Edge Racing designs that you won't find anywhere else. Show your racing pride!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10">
            <CardContent className="p-6 text-center">
              <Bell className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Restock Alerts</h3>
              <p className="text-slate-300">
                Be the first to know when your favorite items are back in stock with our notification system.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <Card className="bg-gradient-to-br from-slate-700/50 to-red-900/20">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold text-white mb-4">Questions About Merch?</h3>
            <p className="text-slate-300 mb-6">
              Contact us for custom orders, bulk purchases, or any questions about our merchandise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => window.location.href = 'tel:8324904304'}
              >
                Call (832) 490-4304
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = 'mailto:roel@vipsimracing.com'}
              >
                Email Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}