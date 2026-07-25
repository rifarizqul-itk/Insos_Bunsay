import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

function Topbar({ userTitle, onToggleSidebar, variant = 'tenant' }) {
  const [isOpen, setIsOpen] = useState(false);
  const notifikasiRef = useRef(null);

  const daftarNotifikasi = [
    { id: 1, teks: 'Tunggakan sewa bulan sebelumnya belum lunas.', waktu: 'Hari ini', tipe: 'penting' },
    { id: 2, teks: 'Pembayaran sewa bulan April 2026 sudah lunas.', waktu: '2 hari lalu', tipe: 'sukses' }
  ];

  useEffect(() => {
    function handleKlikLuar(event) {
      if (notifikasiRef.current && !notifikasiRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleKlikLuar);
    document.addEventListener('touchstart', handleKlikLuar);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleKlikLuar);
      document.removeEventListener('touchstart', handleKlikLuar);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const hamburgerClass = variant === 'admin' ? 'topbar-hamburger-admin' : 'topbar-hamburger-tenant';

  return (
    <header className="topbar-container min-h-[64px] py-2 flex justify-between items-center bg-white border-b border-border">
      {/* Sisi Kiri: Tombol Hamburger (Khusus Mobile) + Sapaan Identitas */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className={`${hamburgerClass} bg-transparent border border-border rounded-md px-3 cursor-pointer items-center justify-center h-11 text-text shrink-0`}
        >
          <Icon icon="ph:list-bold" width="22" height="22" />
        </button>
        
        <div className="text-[15px] font-bold text-text-2 leading-tight min-w-0 break-words">
          <span className="hidden sm:inline">Sesi Aktif: </span>
          <span className="text-red font-extrabold">{userTitle}</span>
        </div>
      </div>

      {/* Sisi Kanan: Dropdown Notifikasi */}
      <div ref={notifikasiRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifikasi"
          aria-expanded={isOpen}
          aria-controls="notifikasi-dropdown"
          className={`
            h-11 px-4 text-[15px] font-extrabold cursor-pointer flex items-center gap-2 rounded-md border border-border transition-colors
            ${isOpen ? 'bg-warm-gray text-text' : 'bg-transparent text-text hover:bg-warm-gray/50'}
          `}
        >
          <span>Notifikasi</span>
          <span className="bg-red text-white text-xs font-extrabold px-2 py-0.5 rounded-full inline-block font-tabular-nums">
            {daftarNotifikasi.length}
          </span>
        </button>

        {/* Kotak Kontainer Lembar Dropdown Menu */}
        {isOpen && (
          <div 
            id="notifikasi-dropdown"
            role="region"
            aria-label="Panel Notifikasi"
            className="topbar-dropdown absolute top-14 -right-2 w-[calc(100vw-32px)] max-w-[360px] bg-white border border-border rounded-2xl shadow-card-elevated p-4 flex flex-col gap-3 z-40 animate-[fadeIn_0.15s_ease-out]"
          >
            <div className="text-[15px] font-extrabold text-text border-b-2 border-warm-gray pb-2 m-0">
              Notifikasi
            </div>

            <div role="list" className="flex flex-col gap-2">
              {daftarNotifikasi.map((notif) => (
                <div 
                  key={notif.id} 
                  role="listitem"
                  className={`
                    p-3 rounded-md flex flex-col gap-1 text-left border
                    ${notif.tipe === 'penting' ? 'bg-red-50 border-red-100' : 'bg-cream border-border'}
                  `}
                >
                  <div className="text-sm font-bold text-text leading-snug flex items-center gap-1.5">
                    {notif.tipe === 'penting' ? (
                      <Icon icon="ph:warning-circle-bold" aria-label="Notifikasi penting" className="text-orange shrink-0 size-4.5" />
                    ) : (
                      <Icon icon="ph:check-circle-bold" aria-label="Notifikasi sukses" className="text-green shrink-0 size-4.5" />
                    )} 
                    <span className="text-pretty">{notif.teks}</span>
                  </div>
                  <span className="text-xs font-extrabold text-text-3 font-tabular-nums">
                    {notif.waktu}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;

