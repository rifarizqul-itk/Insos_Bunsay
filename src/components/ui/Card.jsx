// Komponen Card reusable - kontainer dasar untuk berbagai halaman
import React from 'react';

function Card({
  children,
  className = '',
  padding = 'p-7',
  shadow = true,
  border = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg
        ${border ? 'border border-border' : ''}
        ${shadow ? 'shadow-card' : ''}
        ${onClick ? 'cursor-pointer hover:border-red-rich transition-colors' : ''}
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
