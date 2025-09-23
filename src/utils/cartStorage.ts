export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
  lastUpdated: string;
}

/**
 * Get user's cart from localStorage
 * @param userEmail - User's email address
 * @returns Cart - User's cart data
 */
export const getUserCart = (userEmail: string): Cart => {
  const cartData = localStorage.getItem(`cart_${userEmail}`);
  if (!cartData) {
    return {
      items: [],
      total: 0,
      itemCount: 0,
      lastUpdated: new Date().toISOString()
    };
  }
  
  try {
    return JSON.parse(cartData);
  } catch (error) {
    console.error('Error parsing cart data:', error);
    return {
      items: [],
      total: 0,
      itemCount: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Save cart to localStorage
 * @param userEmail - User's email address
 * @param cart - Cart data to save
 */
export const saveUserCart = (userEmail: string, cart: Cart): void => {
  localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));
};

/**
 * Add item to cart
 * @param userEmail - User's email address
 * @param item - Item to add to cart
 * @returns Cart - Updated cart
 */
export const addToCart = (userEmail: string, item: Omit<CartItem, 'id' | 'addedAt'>): Cart => {
  const cart = getUserCart(userEmail);
  
  // Check if item already exists with same product, size, and color
  const existingItemIndex = cart.items.findIndex(
    cartItem => 
      cartItem.productId === item.productId && 
      cartItem.size === item.size && 
      cartItem.color === item.color
  );
  
  if (existingItemIndex !== -1) {
    // Update quantity of existing item
    cart.items[existingItemIndex].quantity += item.quantity;
  } else {
    // Add new item
    const newItem: CartItem = {
      ...item,
      id: Date.now().toString(),
      addedAt: new Date().toISOString()
    };
    cart.items.push(newItem);
  }
  
  // Recalculate totals
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.lastUpdated = new Date().toISOString();
  
  saveUserCart(userEmail, cart);
  return cart;
};

/**
 * Remove item from cart
 * @param userEmail - User's email address
 * @param itemId - ID of item to remove
 * @returns Cart - Updated cart
 */
export const removeFromCart = (userEmail: string, itemId: string): Cart => {
  const cart = getUserCart(userEmail);
  cart.items = cart.items.filter(item => item.id !== itemId);
  
  // Recalculate totals
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.lastUpdated = new Date().toISOString();
  
  saveUserCart(userEmail, cart);
  return cart;
};

/**
 * Update item quantity in cart
 * @param userEmail - User's email address
 * @param itemId - ID of item to update
 * @param quantity - New quantity
 * @returns Cart - Updated cart
 */
export const updateCartItemQuantity = (userEmail: string, itemId: string, quantity: number): Cart => {
  const cart = getUserCart(userEmail);
  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.lastUpdated = new Date().toISOString();
    
    saveUserCart(userEmail, cart);
  }
  
  return cart;
};

/**
 * Clear entire cart
 * @param userEmail - User's email address
 * @returns Cart - Empty cart
 */
export const clearCart = (userEmail: string): Cart => {
  const emptyCart: Cart = {
    items: [],
    total: 0,
    itemCount: 0,
    lastUpdated: new Date().toISOString()
  };
  
  saveUserCart(userEmail, emptyCart);
  return emptyCart;
};

/**
 * Get cart item count for display
 * @param userEmail - User's email address
 * @returns number - Total items in cart
 */
export const getCartItemCount = (userEmail: string): number => {
  const cart = getUserCart(userEmail);
  return cart.itemCount;
};