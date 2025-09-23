import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface CartIconProps {
  itemCount: number;
  onClick: () => void;
  className?: string;
}

export default function CartIcon({ itemCount, onClick, className = '' }: CartIconProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-slate-400 hover:text-white transition-colors ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}