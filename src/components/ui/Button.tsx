import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white',
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-700'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
}