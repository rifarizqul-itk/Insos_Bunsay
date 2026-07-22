import React from 'react';

/**
 * Shared accessibility-first Table wrapper
 * Enforces caption / aria-label, scope="col" on <th>, and WCAG 1.3.1 compliance.
 */
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
}) {
  return (
    <div className={`w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse" aria-label={ariaLabel}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className={headerClassName}>
            {headers.map((head, idx) => (
              <th
                key={idx}
                scope="col"
                className={`py-3 px-4 font-bold text-sm ${head.align === 'center' ? 'text-center' : head.align === 'right' ? 'text-right' : 'text-left'} ${head.className || ''}`}
              >
                {head.label}
              </th>
            ))}
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
