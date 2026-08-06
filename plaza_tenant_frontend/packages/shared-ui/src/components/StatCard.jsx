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
      bg-white rounded-xl border border-border p-6 shadow-card
      hover:border-red/30 hover:shadow-card-elevated hover:-translate-y-0.5 transition-all duration-200 ease-out
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div>
          <span className="label-micro">
            {label}
          </span>
          <div className={`
            text-2xl sm:text-3xl font-extrabold mt-1.5 font-tabular-nums tracking-tight
            ${colorClasses[color] || colorClasses.text}
          `}>
            {value}
          </div>
        </div>
        {icon && (
          <div className="text-text-2 p-2.5 bg-warm-gray/50 rounded-lg border border-border/40 shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
export { StatCard };
