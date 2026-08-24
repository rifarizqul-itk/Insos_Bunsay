import React from 'react';
import { cn } from '../utils/cn';
import Icon from './Icon';

function Table({
  caption,
  ariaLabel,
  headers = [],
  children,
  className = '',
  headerClassName = 'bg-red text-white font-extrabold text-sm sm:text-base',
  emptyMessage = 'Data tidak ditemukan.',
  isEmpty = false,
  colSpan = 6,
  sortConfig = null, // { key: string, direction: 'asc' | 'desc' }
  onSort = null, // function(key)
  footer = null,
}) {
  return (
    <div data-slot="table" className={cn('w-full overflow-hidden rounded-2xl border border-border/90 bg-white shadow-card', className)}>
      {/* Mobile Touch Scroll Affordance Hint (WCAG & Touch Discovery) */}
      <div className="sm:hidden flex items-center justify-between px-3.5 py-1.5 bg-mono-50/90 border-b border-border/60 text-[11px] font-bold text-text-3 select-none">
        <span className="flex items-center gap-1.5">
          <Icon icon="heroicons:arrows-right-left-20-solid" className="size-3.5 text-red" />
          <span>Geser tabel ke samping untuk kolom lengkap</span>
        </span>
      </div>
      <div className="w-full overflow-x-auto custom-scrollbar touch-pan-x">
        <table 
          className="w-full text-start border-collapse min-w-full [&_tbody_td]:border-r [&_tbody_td]:border-border/70 [&_tbody_td:last-child]:border-r-0 [&_tbody_th]:border-r [&_tbody_th]:border-border/70 [&_tbody_th:last-child]:border-r-0" 
          aria-label={ariaLabel}
        >
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className={headerClassName}>
              {headers.map((head, idx) => {
                const key = head.key || head.sortKey || head.label;
                const isSortable = head.sortable !== false && Boolean(onSort);
                const isSorted = sortConfig && sortConfig.key === key;
                const sortDirection = isSorted ? sortConfig.direction : null;

                const ariaSortValue = isSorted
                  ? (sortDirection === 'asc' ? 'ascending' : 'descending')
                  : (isSortable ? 'none' : undefined);

                return (
                  <th
                    key={idx}
                    scope="col"
                    aria-sort={ariaSortValue}
                    className={cn(
                      'py-3.5 px-4 sm:px-5 font-extrabold text-sm sm:text-base select-none transition-colors whitespace-nowrap text-white border-r border-red-dark/40 last:border-r-0',
                      head.align === 'center' ? 'text-center' : head.align === 'right' ? 'text-end' : 'text-start',
                      isSorted ? 'bg-[#5C1010] text-white shadow-inner font-black' : 'bg-red text-white',
                      isSortable && !isSorted && 'hover:bg-red-dark/30',
                      head.className
                    )}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => onSort(key)}
                        className={cn(
                          'w-full inline-flex items-center gap-2 font-extrabold text-sm sm:text-base text-white hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-1 -mx-1 group transition-colors cursor-pointer min-h-0 bg-transparent border-none p-0 shadow-none',
                          head.align === 'center' ? 'justify-center mx-auto' : head.align === 'right' ? 'justify-end ms-auto' : 'justify-start'
                        )}
                        aria-label={`Urutkan berdasarkan ${head.label}${isSorted ? ` (saat ini ${sortDirection === 'asc' ? 'menaik' : 'menurun'})` : ''}`}
                      >
                        <span>{head.label}</span>
                        <span aria-hidden="true" className={cn(
                          'transition-opacity',
                          isSorted ? 'opacity-100 text-amber-300' : 'opacity-70 group-hover:opacity-100 text-white/90'
                        )}>
                          {sortDirection === 'asc' ? (
                            <Icon icon="heroicons:chevron-up-20-solid" className="size-4.5" />
                          ) : sortDirection === 'desc' ? (
                            <Icon icon="heroicons:chevron-down-20-solid" className="size-4.5" />
                          ) : (
                            <Icon icon="heroicons:chevron-up-down-20-solid" className="size-4.5" />
                          )}
                        </span>
                      </button>
                    ) : (
                      <div className={cn(
                        'inline-flex items-center gap-2 font-extrabold text-sm sm:text-base text-white',
                        head.align === 'center' ? 'justify-center' : head.align === 'right' ? 'justify-end' : 'justify-start'
                      )}>
                        <span>{head.label}</span>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80 bg-white">
            {isEmpty ? (
              <tr>
                <td colSpan={colSpan || headers.length} className="py-12 px-4 text-center text-text-3 font-semibold text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}

export default Table;
export { Table };

