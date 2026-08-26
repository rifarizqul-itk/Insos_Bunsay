import React from 'react';
import { cn } from '../utils/cn';

function StatCard({
  label,
  value,
  color = 'text',
  icon,
  subtext,
  trend,
  trendLabel,
  className = '',
}) {
  const colorClasses = {
    text: 'text-text',
    red: 'text-red',
    green: 'text-green',
    orange: 'text-orange',
    amber: 'text-amber',
  };

  const iconBgClasses = {
    text: 'bg-mono-100 text-text-2 border-border/80',
    red: 'bg-red-50 text-red border-red/20',
    green: 'bg-green-bg text-green border-green/20',
    orange: 'bg-orange-bg text-orange border-orange/20',
    amber: 'bg-amber-bg text-amber border-amber/20',
  };

  return (
    <div
      data-slot="stat-card"
      role="region"
      aria-label={`Statistik ${label}: ${value}`}
      className={cn(
        'bg-white rounded-2xl border border-border/80 p-5 sm:p-6 shadow-2xs hover:border-red/30 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col justify-between gap-3 relative overflow-hidden group',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-text-3 block truncate">
            {label}
          </span>
          <div className={cn(
            'text-2xl sm:text-3xl lg:text-3.5xl font-black mt-1 font-tabular-nums tracking-tight leading-tight',
            colorClasses[color] || colorClasses.text
          )}>
            {value}
          </div>
        </div>
        {icon && (
          <div
            aria-hidden="true"
            className={cn(
              'p-2.5 sm:p-3 rounded-xl border shrink-0 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform',
              iconBgClasses[color] || iconBgClasses.text
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtext || trendLabel) && (
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs sm:text-[13px] font-semibold text-text-3">
          {subtext && <span className="truncate">{subtext}</span>}
          {trendLabel && (
            <span className={cn(
              'px-2.5 py-0.5 rounded-lg font-extrabold text-xs uppercase tracking-wide shrink-0',
              trend === 'up' || trend === 'positive' || trend === 'optimal'
                ? 'bg-green-bg text-green border border-green/20'
                : trend === 'warning' || trend === 'action'
                ? 'bg-orange-bg text-orange border border-orange/20'
                : 'bg-mono-100 text-text-2 border border-border'
            )}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
export { StatCard };

