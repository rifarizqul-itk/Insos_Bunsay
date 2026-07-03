import React from 'react';
import Card from './Card';

function FilterBar({
  searchPlaceholder = 'Cari...',
  searchValue,
  onSearchChange,
  filterOptions = [],
  filterValue,
  onFilterChange,
  className = '',
  children,
  searchId = 'filter-search',
  filterId = 'filter-select',
}) {
  return (
    <Card padding="p-5" className={`flex flex-wrap items-center gap-4 ${className}`}>
      {/* Search Input dengan label tersembunyi tapi tetap terhubung */}
      <div className="flex-1 min-w-[240px]">
        <label htmlFor={searchId} className="sr-only">
          {searchPlaceholder}
        </label>
        <input
          id={searchId}
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full h-11 rounded-md border border-border bg-warm-gray px-4 text-text placeholder:text-text-3 focus:border-red focus:ring-0 outline-none"
        />
      </div>

      {/* Filter Dropdown */}
      {filterOptions.length > 0 && (
        <div className="min-w-[160px]">
          <label htmlFor={filterId} className="sr-only">
            Filter
          </label>
          <select
            id={filterId}
            value={filterValue || ''}
            onChange={(e) => onFilterChange?.(e.target.value)}
            className="w-full h-11 rounded-md border border-border bg-white px-3 text-text font-semibold focus:border-red focus:ring-0 outline-none"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Additional content */}
      {children}
    </Card>
  );
}

export default FilterBar;