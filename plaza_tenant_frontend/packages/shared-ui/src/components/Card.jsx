import React from 'react';
import { cn } from '../utils/cn';

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
    inset: 'bg-mono-100/50 border-border/80',
    glass: 'bg-white/80 backdrop-blur-xl border-white/60 shadow-card',
  };

  return (
    <div
      data-slot="card"
      onClick={onClick}
      className={cn(
        'rounded-xl transition-all duration-250 ease-out',
        variantStyles[variant] || variantStyles.default,
        border && variant !== 'inset' && 'border border-border/80',
        shadow && variant === 'default' && 'shadow-card hover:shadow-card-elevated',
        onClick && 'cursor-pointer hover:border-red-rich hover:-translate-y-0.5 active:scale-[0.99]',
        padding,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
export { Card };
