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
    <header 
      className="topbar-container"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '64px',
        height: 'auto',
        paddingTop: '8px',
        paddingBottom: '8px'
      }}
    >
      {/* Sisi Kiri: Tombol Hamburger (Khusus Mobile) + Sapaan Identitas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0', flex: '1', marginRight: '12px' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className={hamburgerClass}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0 12px',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            height: '44px',
            color: 'var(--text)',
            flexShrink: 0
          }}
        >
          <Icon icon="ph:list-bold" width="22" height="22" />
        </button>
        
        <div 
          style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-2)', lineHeight: '1.25' }}
          className="min-w-0 break-words"
        >
          <span className="hidden sm:inline">Sesi Aktif: </span>
          <span style={{ color: 'var(--red)' }}>{userTitle}</span>
        </div>
      </div>

      {/* Sisi Kanan: Dropdown Notifikasi */}
      <div ref={notifikasiRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifikasi"
          aria-expanded={isOpen}
          aria-controls="notifikasi-dropdown"
          style={{
            height: '48px', 
            backgroundColor: isOpen ? 'var(--warm-gray)' : 'transparent',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0 16px',
            fontSize: '15px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Notifikasi</span>
          <span style={{
            backgroundColor: 'var(--red)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '800',
            padding: '2px 8px',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            {daftarNotifikasi.length}
          </span>
        </button>

        {/* Kotak Kontainer Lembar Dropdown Menu */}
        {isOpen && (
          <div 
            id="notifikasi-dropdown"
            role="region"
            aria-label="Panel Notifikasi"
            className="topbar-dropdown"
            style={{
              position: 'absolute',
              top: '56px',
              right: '-8px',
              width: 'calc(100vw - 32px)',
              maxWidth: '360px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'fadeIn 0.15s ease-out',
              zIndex: 40
            }}
          >
            <div style={{
              fontSize: '15px',
              fontWeight: '800',
              color: 'var(--text)',
              borderBottom: '2px solid var(--warm-gray)',
              paddingBottom: '8px',
              margin: 0
            }}>
              Notifikasi
            </div>

            <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {daftarNotifikasi.map((notif) => (
                <div 
                  key={notif.id} 
                  role="listitem"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: notif.tipe === 'penting' ? 'var(--red-50)' : 'var(--cream)',
                    border: notif.tipe === 'penting' ? '1px solid var(--red-100)' : '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: 'var(--text)', 
                    lineHeight: '1.5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {notif.tipe === 'penting' ? (
                      <Icon icon="ph:warning-circle-bold" aria-label="Notifikasi penting" className="text-orange shrink-0 size-4.5" style={{ color: 'var(--orange)' }} />
                    ) : (
                      <Icon icon="ph:check-circle-bold" aria-label="Notifikasi sukses" className="text-green shrink-0 size-4.5" style={{ color: 'var(--green)' }} />
                    )} 
                    <span className="text-pretty">{notif.teks}</span>
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '800', 
                    color: 'var(--text-3)' 
                  }}>
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

