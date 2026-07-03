import React from 'react';

function StatCard({ label, value, color = 'text', icon, className = '' }) {
  const colorClasses = {
    text: 'text-text',
    red: 'text-red',
    green: 'text-green',
    orange: 'text-orange',
  };

  return (
    <div className={`
      bg-white rounded-lg border border-border p-6 shadow-card
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-text-3 uppercase tracking-wide">
            {label}
          </span>
          <div className={`
            text-2xl font-extrabold mt-1.5
            ${colorClasses[color] || colorClasses.text}
          `}>
            {value}
          </div>
        </div>
        {icon && (
          <div className="text-text-3 opacity-60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
