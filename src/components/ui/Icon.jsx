import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

/**
 * Shared accessibility-first Icon wrapper for @iconify/react
 * Automatically adds aria-hidden="true" for decorative icons unless an explicit aria-label is provided.
 */
function Icon({ icon, className = '', style, ariaLabel, ...props }) {
  const isDecorative = !ariaLabel;

  return (
    <IconifyIcon
      icon={icon}
      className={className}
      style={style}
      aria-hidden={isDecorative ? 'true' : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      {...props}
    />
  );
}

export default Icon;
