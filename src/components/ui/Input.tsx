import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}