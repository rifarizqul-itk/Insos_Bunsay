import React, { useMemo } from 'react';
import { cn } from '../utils/cn';
import Icon from './Icon';

export function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = '',
  itemName = 'data'
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate pagination range with ellipses
  const pageNumbers = useMemo(() => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [safeCurrentPage, totalPages]);

  if (totalItems <= 0) return null;

  return (
    <div
      data-slot="pagination"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3.5 px-4 py-3 bg-white border-t border-border/80 text-xs font-sans text-text-2 select-none',
        className
      )}
      role="navigation"
      aria-label="Navigasi Halaman Tabel"
    >
      {/* Kiri: Info Jumlah Data & Pilihan Page Size */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
        <span className="text-xs font-medium text-text-3">
          Menampilkan <strong className="font-bold text-text font-tabular-nums">{startItem}–{endItem}</strong> dari <strong className="font-bold text-text font-tabular-nums">{totalItems}</strong> {itemName}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ms-2">
            <label htmlFor="pagination-page-size" className="sr-only">Baris per halaman</label>
            <select
              id="pagination-page-size"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange?.(1);
              }}
              className="h-9 min-h-[36px] pl-2.5 pr-7 rounded-md border border-border bg-mono-50 font-bold text-xs text-text cursor-pointer focus:outline-none focus:ring-1 focus:ring-red"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / hal
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Kanan: Navigasi Tombol Halaman */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Tombol Sebelumnya */}
        <button
          type="button"
          onClick={() => onPageChange?.(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Halaman sebelumnya"
          className={cn(
            'min-w-[38px] min-h-[38px] sm:size-8 flex items-center justify-center rounded-md border transition-all',
            safeCurrentPage <= 1
              ? 'border-border/60 text-border-2 opacity-40 cursor-not-allowed bg-mono-50'
              : 'border-border bg-white text-text hover:bg-mono-100 hover:border-red/40 cursor-pointer shadow-2xs active:scale-95'
          )}
        >
          <Icon icon="heroicons:chevron-left-20-solid" className="size-4.5 sm:size-4" />
        </button>

        {/* Nomor Halaman */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`dots-${idx}`} className="min-w-[32px] min-h-[38px] sm:size-8 flex items-center justify-center text-text-3 font-bold">
                  …
                </span>
              );
            }

            const isActive = page === safeCurrentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange?.(page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Halaman ${page}`}
                className={cn(
                  'min-w-[38px] min-h-[38px] px-2 sm:px-0 sm:size-8 flex items-center justify-center rounded-md text-xs font-bold font-tabular-nums transition-all cursor-pointer',
                  isActive
                    ? 'bg-red text-white shadow-xs'
                    : 'border border-border bg-white text-text hover:bg-mono-100 hover:border-red/30'
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Tombol Selanjutnya */}
        <button
          type="button"
          onClick={() => onPageChange?.(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          aria-label="Halaman selanjutnya"
          className={cn(
            'min-w-[38px] min-h-[38px] sm:size-8 flex items-center justify-center rounded-md border transition-all',
            safeCurrentPage >= totalPages
              ? 'border-border/60 text-border-2 opacity-40 cursor-not-allowed bg-mono-50'
              : 'border-border bg-white text-text hover:bg-mono-100 hover:border-red/40 cursor-pointer shadow-2xs active:scale-95'
          )}
        >
          <Icon icon="heroicons:chevron-right-20-solid" className="size-4.5 sm:size-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
