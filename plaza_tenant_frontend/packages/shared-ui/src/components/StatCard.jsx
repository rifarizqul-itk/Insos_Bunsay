import React from 'react';
import { cn } from '../utils/cn';

function StatCard({ label, value, color = 'text', icon, className = '' }) {
  const colorClasses = {
    text: 'text-text',
    red: 'text-red',
    green: 'text-green',
    orange: 'text-orange',
  };

  return (
    <div
      data-slot="stat-card"
      className={cn(
        'bg-white rounded-xl border border-border/80 p-6 shadow-card hover:border-red/30 hover:shadow-card-elevated hover:-translate-y-0.5 transition-all duration-200 ease-out',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="label-micro">
            {label}
          </span>
          <div className={cn(
            'text-2xl sm:text-3xl font-extrabold mt-1.5 font-tabular-nums tracking-tight',
            colorClasses[color] || colorClasses.text
          )}>
            {value}
          </div>
        </div>
        {icon && (
          <div className="text-text-2 p-2.5 bg-mono-100/70 rounded-lg border border-border/60 shadow-xs">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
export { StatCard };
