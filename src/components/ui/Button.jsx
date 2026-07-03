// Komponen Button reusable dengan Tailwind
// Mendukung varian: primary, secondary, outline, danger
// Mendukung ukuran: sm, md, lg

import React from 'react';

const variantClasses = {
  primary: 'bg-red text-white hover:bg-red-dark focus:ring-2 focus:ring-red focus:ring-offset-2',
  secondary: 'bg-warm-gray text-text hover:bg-[#EBE3DB] focus:ring-2 focus:ring-border focus:ring-offset-2',
  outline: 'bg-transparent text-red border-2 border-red hover:bg-red-50 focus:ring-2 focus:ring-red focus:ring-offset-2',
  danger: 'bg-red-100 text-red hover:bg-red-200 focus:ring-2 focus:ring-red focus:ring-offset-2',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm h-10',
  md: 'px-6 py-2.5 text-base h-11',
  lg: 'px-8 py-3 text-base h-12',
};

function Button({
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
    transition-colors duration-200
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
