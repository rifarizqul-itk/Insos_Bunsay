import React from 'react';
import { cn } from '../utils/cn';

const variantClasses = {
  primary: 'bg-red text-white hover:bg-red-rich focus:ring-2 focus:ring-red focus:ring-offset-2 shadow-xs hover:shadow-sm active:scale-[0.98]',
  secondary: 'bg-mono-100 text-text border border-border hover:bg-mono-200 focus:ring-2 focus:ring-red focus:ring-offset-2 active:scale-[0.98]',
  outline: 'bg-transparent text-red border border-red hover:bg-red-50 focus:ring-2 focus:ring-red focus:ring-offset-2 active:scale-[0.98]',
  danger: 'bg-red-50 text-red border border-red/30 hover:bg-red-100 focus:ring-2 focus:ring-red focus:ring-offset-2 active:scale-[0.98]',
  warning: 'bg-amber text-amber-950 font-bold hover:bg-amber-600 hover:text-white focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 shadow-xs hover:shadow-sm active:scale-[0.98]',
};

const sizeClasses = {
  xs: 'px-2.5 py-1 text-xs min-h-8 rounded-lg font-bold',
  sm: 'px-3.5 py-1.5 text-xs sm:text-sm min-h-9 rounded-lg font-bold',
  md: 'px-5 py-2 text-xs sm:text-sm min-h-10 rounded-xl font-bold',
  lg: 'px-6 py-2.5 text-sm sm:text-base min-h-11 rounded-xl font-bold',
};

const triggerHaptic = (duration = 15) => {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof window.navigator.vibrate === 'function') {
    try {
      window.navigator.vibrate(duration);
    } catch {
      // Safely ignore browser restriction
    }
  }
};

const Button = React.memo(function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const handleClick = (e) => {
    if (!disabled) {
      triggerHaptic(variant === 'danger' ? 25 : 12);
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      type={type}
      data-slot="button"
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all duration-200 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
export { Button };
