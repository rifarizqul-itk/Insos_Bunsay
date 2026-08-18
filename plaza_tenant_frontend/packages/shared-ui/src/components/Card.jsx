import React from 'react';

function Card({
  children,
  className = '',
  padding = 'p-6 sm:p-7',
  shadow = true,
  border = true,
  variant = 'default',
  onClick,
  ...props
}) {
  const variantStyles = {
    default: 'bg-white',
    elevated: 'bg-white shadow-card-elevated',
    glow: 'bg-white border-red/30 shadow-glow-maroon',
    inset: 'bg-warm-gray/40 border-border/80',
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl transition-all duration-200 ease-out
        ${variantStyles[variant] || variantStyles.default}
        ${border && variant !== 'inset' ? 'border border-border' : ''}
        ${shadow && variant === 'default' ? 'shadow-card hover:shadow-card-elevated' : ''}
        ${onClick ? 'cursor-pointer hover:border-red-rich hover:-translate-y-0.5' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
export { Card };
