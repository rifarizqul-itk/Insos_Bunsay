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
      hover:border-border/80 transition-all duration-200
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div>
          <span className="label-micro">
            {label}
          </span>
          <div className={`
            text-2xl font-extrabold mt-1.5 font-tabular-nums tracking-tight
            ${colorClasses[color] || colorClasses.text}
          `}>
            {value}
          </div>
        </div>
        {icon && (
          <div className="text-text-3 opacity-70 p-2 bg-warm-gray/40 rounded-md">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
