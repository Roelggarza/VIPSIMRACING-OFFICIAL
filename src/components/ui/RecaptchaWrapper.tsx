import React, { useEffect, useRef, useState } from 'react';

interface RecaptchaWrapperProps {
  onVerify: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
  siteKey?: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function RecaptchaWrapper({
  onVerify,
  onExpired,
  onError,
  siteKey = '6LfUH8IrAAAAAAcbbfT9-RAJauBsg0ZwukQHG3rM',
  theme = 'dark',
  size = 'normal'
}: RecaptchaWrapperProps) {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if reCAPTCHA script is already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      setIsLoaded(true);
      renderRecaptcha();
      return;
    }

    // Set up callback for when reCAPTCHA loads
    window.onRecaptchaLoad = () => {
      setIsLoaded(true);
      renderRecaptcha();
    };

    // Load reCAPTCHA script if not already present
    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setError('Failed to load reCAPTCHA. Please check your internet connection.');
      };
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup
      if (widgetId.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetId.current);
        } catch (e) {
          console.warn('Error resetting reCAPTCHA:', e);
        }
      }
    };
  }, []);

  const renderRecaptcha = () => {
    if (!window.grecaptcha || !window.grecaptcha.render || !recaptchaRef.current) {
      return;
    }

    try {
      // Reset existing widget if present
      if (widgetId.current !== null) {
        window.grecaptcha.reset(widgetId.current);
      }

      // Render new widget
      widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        theme: theme,
        size: size,
        callback: (token: string) => {
          console.log('reCAPTCHA verified:', token);
          onVerify(token);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (onExpired) onExpired();
        },
        'error-callback': () => {
          console.log('reCAPTCHA error');
          setError('reCAPTCHA verification failed. Please try again.');
          if (onError) onError();
        }
      });
    } catch (err) {
      console.error('Error rendering reCAPTCHA:', err);
      setError('Failed to initialize reCAPTCHA. Please refresh the page.');
    }
  };

  if (error) {
    return (
      <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => {
            setError('');
            window.location.reload();
          }}
          className="mt-2 text-red-400 hover:text-red-300 underline text-sm"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="text-center p-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-slate-400 text-sm">Loading reCAPTCHA...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div ref={recaptchaRef} className="recaptcha-container" />
    </div>
  );
}