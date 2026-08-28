import React from 'react';
import { cn } from '../utils/cn';

function Card({
  children,
  className = '',
  padding = 'p-4 sm:p-6',
  shadow = true,
  border = true,
  variant = 'default',
  onClick,
  ...props
}) {
  const variantStyles = {
    default: 'bg-white',
    elevated: 'bg-white shadow-sm',
    glow: 'bg-white border-red/30',
    inset: 'bg-mono-100/50 border-border/80',
    glass: 'bg-white/95 backdrop-blur-md border-border/80 shadow-sm',
  };

  return (
    <div
      data-slot="card"
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-200 ease-out',
        variantStyles[variant] || variantStyles.default,
        border && variant !== 'inset' && 'border border-border/80',
        shadow && variant === 'default' && 'shadow-xs hover:shadow-sm',
        onClick && 'cursor-pointer hover:border-red-rich active:scale-[0.99]',
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
