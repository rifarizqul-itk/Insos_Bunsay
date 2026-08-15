import React, { memo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

const Icon = memo(function Icon({ icon, className = '', style, width, height, ariaLabel, ...props }) {
  const isDecorative = !ariaLabel;

  const iconStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    ...style,
  };

  return (
    <IconifyIcon
      data-slot="icon"
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
export { Icon };
