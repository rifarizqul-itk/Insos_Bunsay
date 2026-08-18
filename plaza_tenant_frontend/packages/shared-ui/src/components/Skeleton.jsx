import React from 'react';
import { cn } from '../utils/cn';

export function SkeletonText({ className = 'h-4 w-3/4' }) {
  return (
    <div data-slot="skeleton-text" className={cn('bg-warm-gray/60 animate-pulse rounded-md', className)} />
  );
}

export function SkeletonCard({ className = 'h-36 w-full' }) {
  return (
    <div data-slot="skeleton-card" className={cn('bg-white rounded-xl border border-border p-6 shadow-card', className)}>
      <div className="space-y-3">
        <SkeletonText className="h-3 w-1/3" />
        <SkeletonText className="h-8 w-2/3" />
        <SkeletonText className="h-4 w-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 4, className = 'w-full' }) {
  return (
    <div data-slot="skeleton-table" className={cn('bg-white rounded-xl border border-border overflow-hidden p-4 space-y-4 shadow-card', className)}>
      <div className="flex justify-between items-center pb-3 border-b border-border">
        <SkeletonText className="h-5 w-40" />
        <SkeletonText className="h-5 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between py-2 space-x-4">
          <SkeletonText className="h-4 w-1/4" />
          <SkeletonText className="h-4 w-1/3" />
          <SkeletonText className="h-4 w-1/6" />
          <SkeletonText className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default {
  Text: SkeletonText,
  Card: SkeletonCard,
  Table: SkeletonTable,
};
