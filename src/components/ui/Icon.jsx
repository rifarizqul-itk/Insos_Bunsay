import React, { memo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

/**
 * Shared accessibility-first Icon wrapper for @iconify/react
 * - Memoized with React.memo to prevent unnecessary re-renders when parent components update.
 * - Prevents Cumulative Layout Shift (CLS) by providing layout reservations.
 * - Automatically adds aria-hidden="true" for decorative icons unless an explicit ariaLabel is provided.
 */
const Icon = memo(function Icon({ icon, className = '', style, width, height, ariaLabel, ...props }) {
  const isDecorative = !ariaLabel;

  // Set explicit fallbacks or inline dimensions to prevent CLS
  const iconStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    ...style,
  };

  return (
    <IconifyIcon
      icon={icon}
      width={width}
      height={height}
      className={className}
      style={iconStyle}
      aria-hidden={isDecorative ? 'true' : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      {...props}
    />
  );
});

export default Icon;
