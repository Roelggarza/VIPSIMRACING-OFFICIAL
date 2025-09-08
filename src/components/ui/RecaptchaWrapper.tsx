import React, { useEffect, useRef } from 'react';

interface RecaptchaWrapperProps {
  onVerify: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
  siteKey?: string;
  secretKey?: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function RecaptchaWrapper({
  onVerify,
  onExpired,
  onError,
  siteKey = '6LfUH8IrAAAAAAcbbfT9-RAJauBsg0ZwukQHG3rM',
  secretKey = '6LfUH8IrAAAAAMwZToyLYVgWn2i_NI-rHX4HHigj',
  theme = 'dark',
  size = 'normal'
}: RecaptchaWrapperProps) {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render && recaptchaRef.current) {
        // Reset if already rendered
        if (widgetId.current !== null) {
          window.grecaptcha.reset(widgetId.current);
        } else {
          // Render new reCAPTCHA
          widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: siteKey,
            theme: theme,
            size: size,
            callback: onVerify,
            'expired-callback': onExpired,
            'error-callback': onError
          });
        }
      }
    };

    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      loadRecaptcha();
    } else {
      // Wait for reCAPTCHA to load
      const checkRecaptcha = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          clearInterval(checkRecaptcha);
          loadRecaptcha();
        }
      }, 100);

      return () => clearInterval(checkRecaptcha);
    }
  }, [siteKey, theme, size, onVerify, onExpired, onError]);

  return (
    <div className="flex justify-center">
      <div ref={recaptchaRef} />
    </div>
  );
}