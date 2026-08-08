import React from 'react';

import Icon from './Icon';

function Table({
  caption,
  ariaLabel,
  headers = [],
  children,
  className = '',
  headerClassName = 'bg-red text-white',
  emptyMessage = 'Data tidak ditemukan.',
  isEmpty = false,
  colSpan = 6,
  sortConfig = null, // { key: string, direction: 'asc' | 'desc' }
  onSort = null, // function(key)
}) {
  return (
    <div className={`w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse" aria-label={ariaLabel}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className={headerClassName}>
            {headers.map((head, idx) => {
              const key = head.key || head.sortKey || head.label;
              const isSortable = head.sortable !== false && onSort;
              const isSorted = sortConfig && sortConfig.key === key;
              const sortDirection = isSorted ? sortConfig.direction : null;

              return (
                <th
                  key={idx}
                  scope="col"
                  onClick={isSortable ? () => onSort(key) : undefined}
                  className={`
                    py-3 px-4 font-bold text-sm select-none transition-colors
                    ${head.align === 'center' ? 'text-center' : head.align === 'right' ? 'text-right' : 'text-left'}
                    ${isSortable ? 'cursor-pointer hover:bg-black/15 group' : ''}
                    ${isSorted ? 'bg-[#6B1414] text-white shadow-inner' : ''}
                    ${head.className || ''}
                  `}
                  title={isSortable ? `Urutkan berdasarkan ${head.label}` : undefined}
                >
                  <div className={`inline-flex items-center gap-1.5 ${head.align === 'center' ? 'justify-center' : head.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <span>{head.label}</span>
                    {isSortable && (
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {sortDirection === 'asc' ? (
                          <Icon icon="heroicons:chevron-up-20-solid" width="14" height="14" />
                        ) : sortDirection === 'desc' ? (
                          <Icon icon="heroicons:chevron-down-20-solid" width="14" height="14" />
                        ) : (
                          <Icon icon="heroicons:chevron-up-down-20-solid" width="14" height="14" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={colSpan || headers.length} className="py-8 px-4 text-center text-text-3 font-semibold text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
export { Table };
