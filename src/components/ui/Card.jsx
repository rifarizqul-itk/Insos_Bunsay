// Komponen Card reusable - kontainer dasar untuk berbagai halaman
import React from 'react';

function Card({
  children,
  className = '',
  padding = 'p-7',
  shadow = true,
  border = true,
  ...props
}) {
  return (
    <div
      className={`
        bg-white rounded-lg
        ${border ? 'border border-border' : ''}
        ${shadow ? 'shadow-card' : ''}
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
