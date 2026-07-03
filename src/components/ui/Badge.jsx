// Komponen Badge reusable - contoh migrasi ke Tailwind
// Penggunaan: <Badge status="Lunas" />
// Status yang didukung: Lunas, Belum Bayar, Menunggu Verifikasi, Terisi, Kosong, Perlu Validasi

import React from 'react';

const statusConfig = {
  'Lunas': { bg: 'bg-green-bg', text: 'text-green', label: 'Lunas' },
  'Belum Bayar': { bg: 'bg-red-100', text: 'text-red', label: 'Belum Bayar' },
  'Menunggu Verifikasi': { bg: 'bg-orange-bg', text: 'text-orange', label: 'Menunggu Verifikasi' },
  'Terisi': { bg: 'bg-green-bg', text: 'text-green', label: 'Terisi' },
  'Kosong': { bg: 'bg-red-100', text: 'text-red', label: 'Kosong' },
  'Perlu Validasi': { bg: 'bg-orange-bg', text: 'text-orange', label: 'Perlu Validasi' },
};

function Badge({ status, className = '', clickable = false, onClick }) {
  const config = statusConfig[status] || statusConfig['Belum Bayar'];
  const isClickable = clickable && typeof onClick === 'function';

  return (
    <span
      onClick={isClickable ? onClick : undefined}
      className={`
        inline-block px-3 py-1 rounded font-bold text-xs
        ${config.bg} ${config.text}
        ${isClickable ? 'cursor-pointer border-2 border-orange hover:shadow-[0_2px_8px_rgba(192,92,0,0.3)] transition-shadow' : ''}
        ${className}
      `}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {config.label}
    </span>
  );
}

export default Badge;
