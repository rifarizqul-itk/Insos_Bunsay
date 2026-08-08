import React from 'react';

const variantClasses = {
  primary: 'bg-red text-white hover:bg-red-rich hover:-translate-y-0.5 focus:ring-2 focus:ring-red focus:ring-offset-2 shadow-sm hover:shadow-md active:translate-y-0 active:scale-[0.98]',
  secondary: 'bg-warm-gray text-text border border-border hover:bg-[#E8DFC8] hover:-translate-y-0.5 focus:ring-2 focus:ring-border focus:ring-offset-2 active:translate-y-0 active:scale-[0.98]',
  outline: 'bg-transparent text-red border-2 border-red hover:bg-red-50 hover:-translate-y-0.5 focus:ring-2 focus:ring-red focus:ring-offset-2 active:translate-y-0 active:scale-[0.98]',
  danger: 'bg-red-50 text-red border border-red/30 hover:bg-red-100 hover:-translate-y-0.5 focus:ring-2 focus:ring-red focus:ring-offset-2 active:translate-y-0 active:scale-[0.98]',
  warning: 'bg-[#d97706] text-white hover:bg-[#b45309] hover:-translate-y-0.5 focus:ring-2 focus:ring-[#d97706] focus:ring-offset-2 shadow-md hover:shadow-lg active:translate-y-0 active:scale-[0.98]',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm min-h-[44px]',
  md: 'px-6 py-2.5 text-base min-h-[44px]',
  lg: 'px-8 py-3 text-base min-h-[48px]',
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
  const baseClasses = `
    inline-flex items-center justify-center
    font-bold rounded-md
    transition-all duration-200 ease-out
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  const handleClick = (e) => {
    if (!disabled) {
      triggerHaptic(variant === 'danger' ? 25 : 12);
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={baseClasses}
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
