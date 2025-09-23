import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Star, AlertCircle, Bell, CheckCircle, Plus, ShoppingCart } from 'lucide-react';
import { addAdminNotification, getSession } from '../../utils/userStorage';
import { addToCart, getCartItemCount } from '../../utils/cartStorage';
import Button from '../ui/Button';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Modal from '../ui/Modal';
import CartIcon from '../ui/CartIcon';

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

interface MerchProps {
  showCartIcon?: boolean;
  onCartClick?: () => void;
}

export default function Merch({ showCartIcon = false, onCartClick }: MerchProps) {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [email, setEmail] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const currentUser = getSession();

  React.useEffect(() => {
    if (currentUser) {
      setCartItemCount(getCartItemCount(currentUser.email));
    }
  }, [currentUser]);

  const merchItems: MerchItem[] = [
    {
      id: 'vip-tshirt',
      name: 'VIP SIM RACING T-Shirt',
      price: 25,
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
      description: 'Premium cotton blend t-shirt featuring the iconic VIP SIM RACING logo. Engineered for comfort during intense racing sessions and designed to showcase your passion for motorsport excellence.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Red', 'White', 'Gray'],
      inStock: false,
      category: 'tshirt'
    },
    {
      id: 'racing-hat',
      name: 'VIP SIM RACING Cap',
      price: 30,
      image: 'https://scontent-hou1-1.xx.fbcdn.net/v/t1.15752-9/546324934_776648631730648_2379102014874501461_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_ohc=8iKNRkMmz5oQ7kNvwHxQmqN&_nc_oc=Adn4ORoXXu5hNCV4cG_dVtxpCusgyc8BGy-W026st_F39qdw2kkdU1_kO6oR8SrhE6nSn2b6bhzuW_nksczMhyfj&_nc_zt=23&_nc_ht=scontent-hou1-1.xx&oh=03_Q7cD3QE056990pOMYGvC8zdmg3mJPmmPB49AvHO_Y4fF8vBpCQ&oe=68E89F6B',
      description: 'Performance racing cap with premium embroidered VIP SIM RACING logo. Features moisture-wicking technology and adjustable fit, perfect for track days and representing the racing community.',
      sizes: ['One Size'],
      colors: ['Black', 'White'],
      inStock: false,
      category: 'hat'
    },
    {
      id: 'vip-hoodie',
      name: 'VIP SIM RACING Hoodie',
      price: 50,
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
      description: 'Luxury fleece hoodie crafted for ultimate comfort and style. Features the exclusive VIP SIM RACING design with premium materials that deliver warmth and performance for the dedicated racing enthusiast.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Red', 'Gray'],
      inStock: false,
      category: 'hoodie'
    },
    {
      id: 'longsleeve-shirt',
      name: 'VIP SIM RACING Long Sleeve',
      price: 30,
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
      description: 'High-performance long sleeve shirt with moisture-wicking fabric and VIP SIM RACING branding. Designed for extended racing sessions with superior comfort and professional racing aesthetics.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Red', 'Navy'],
      inStock: false,
      category: 'longsleeve'
    }
  ];

  const handleProductClick = (item: MerchItem) => {
    if (!currentUser) {
      alert('Please log in to add items to cart');
      navigate('/login');
      return;
    }
    
    setSelectedItem(item);
    setSelectedSize(item.sizes[0]);
    setSelectedColor(item.colors[0]);
    setShowSizeModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedItem || !currentUser) return;

    const cartItem = {
      productId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      image: selectedItem.image,
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    };

    addToCart(currentUser.email, cartItem);
    setCartItemCount(getCartItemCount(currentUser.email));
    setAddedToCart(true);
    
    setTimeout(() => {
      setAddedToCart(false);
      setShowSizeModal(false);
      setSelectedItem(null);
    }, 1500);
  };

  const handleNotifyMe = (itemId: string) => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const existingNotifications = JSON.parse(localStorage.getItem('merch_notifications') || '[]');
    const newNotification = {
      email: email.trim(),
      itemId,
      timestamp: new Date().toISOString()
    };

    existingNotifications.push(newNotification);
    localStorage.setItem('merch_notifications', JSON.stringify(existingNotifications));

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
          
          {showCartIcon && currentUser && onCartClick && (
            <CartIcon 
              itemCount={cartItemCount} 
              onClick={onCartClick}
              className="bg-slate-800/50 rounded-lg"
            />
          )}
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
            <Card key={item.id} className="group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => handleProductClick(item)}>
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
                
                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  
                  {/* Product Details */}
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <div className="text-center">
                      <div className="text-sm text-slate-400 mb-1">Available in:</div>
                      <div className="text-white text-sm font-medium">{item.sizes.join(', ')}</div>
                      <div className="text-slate-300 text-sm">{item.colors.join(', ')}</div>
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(item);
                    }}
                    icon={Plus}
                  >
                    Select Size & Add to Cart
                  </Button>
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
                Unique VIP SIM RACING designs that you won't find anywhere else. Show your racing pride!
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
                onClick={() => window.location.href = 'tel:8008975419'}
              >
                Call (800) 897-5419
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

      {/* Size Selection Modal */}
      <Modal
        isOpen={showSizeModal}
        onClose={() => {
          setShowSizeModal(false);
          setSelectedItem(null);
          setAddedToCart(false);
        }}
        title={selectedItem?.name || 'Select Options'}
      >
        {selectedItem && (
          <div className="space-y-6">
            {addedToCart ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Added to Cart!</h3>
                <p className="text-slate-300">
                  {selectedItem.name} ({selectedSize}, {selectedColor}) has been added to your cart.
                </p>
              </div>
            ) : (
              <>
                {/* Product Preview */}
                <div className="flex items-center space-x-4">
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedItem.name}</h3>
                    <p className="text-red-400 font-semibold">${selectedItem.price}</p>
                    <p className="text-sm text-slate-400">{selectedItem.description}</p>
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedItem.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">Color</label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItem.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm font-semibold">
                    🚧 This item is currently sold out but will be restocked soon! 
                    Your selection will be saved for when items become available.
                  </p>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  onClick={handleAddToCart}
                  className="w-full"
                  icon={ShoppingCart}
                  disabled={!selectedSize || !selectedColor}
                >
                  Add to Cart (Coming Soon)
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}