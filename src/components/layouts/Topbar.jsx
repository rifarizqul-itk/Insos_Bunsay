import React, { useState, useEffect, useRef } from 'react';

function Topbar({ userTitle, onToggleSidebar, variant = 'tenant' }) {
  const [isOpen, setIsOpen] = useState(false);
  const notifikasiRef = useRef(null);

  const daftarNotifikasi = [
    { id: 1, teks: 'Tagihan Tunggakan (Piutang) historis Anda terdeteksi belum lunas.', waktu: 'Hari ini', tipe: 'penting' },
    { id: 2, teks: 'Pembayaran Service Charge bulan April 2026 telah tervalidasi lunas.', waktu: '2 hari lalu', tipe: 'sukses' }
  ];

  useEffect(() => {
    function handleKlikLuar(event) {
      if (notifikasiRef.current && !notifikasiRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleKlikLuar);
    return () => {
      document.removeEventListener('mousedown', handleKlikLuar);
    };
  }, []);

  const hamburgerClass = variant === 'admin' ? 'topbar-hamburger-admin' : 'topbar-hamburger-tenant';

  return (
    <header 
      className="topbar-container"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #D6C8BC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {/* Sisi Kiri: Tombol Hamburger (Khusus Mobile) + Sapaan Identitas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          className={hamburgerClass}
          style={{
            display: 'none', /* default akan di-override oleh CSS */
            backgroundColor: 'transparent',
            border: '1px solid #D6C8BC',
            borderRadius: '8px',
            padding: '0 12px',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            height: '42px',
            fontSize: '20px',
            color: 'var(--text)'
          }}
        >
          ☰
        </button>
        
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#4A3F35' }}>
          Sesi Aktif: <span style={{ color: '#8B1A1A' }}>{userTitle}</span>
        </div>
      </div>

      {/* Sisi Kanan: Dropdown Notifikasi */}
      <div ref={notifikasiRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            height: '48px', 
            backgroundColor: isOpen ? '#F5F0EB' : 'transparent',
            color: '#1A1410',
            border: '1px solid #D6C8BC',
            borderRadius: '8px',
            padding: '0 16px',
            fontSize: '15px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onFocus={(e) => e.target.style.outline = '3px solid #1A1410'}
          onBlur={(e) => e.target.style.outline = 'none'}
        >
          <span>Notifikasi</span>
          <span style={{
            backgroundColor: '#D32F2F',
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
            className="topbar-dropdown"
            style={{
              position: 'absolute',
              top: '56px',
              right: 0,
              width: '360px',
              backgroundColor: '#ffffff',
              border: '1px solid #D6C8BC',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'fadeIn 0.15s ease-out',
              zIndex: 110
            }}
          >
            <div style={{
              fontSize: '15px',
              fontWeight: '800',
              color: '#1A1410',
              borderBottom: '2px solid #F5F0EB',
              paddingBottom: '8px',
              margin: 0
            }}>
              Pemberitahuan Terbaru
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {daftarNotifikasi.map((notif) => (
                <div 
                  key={notif.id} 
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: notif.tipe === 'penting' ? '#FFF5F5' : '#F9F6F0',
                    border: notif.tipe === 'penting' ? '1px solid #FADADD' : '1px solid #E6DBCF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: '#1A1410', 
                    lineHeight: '1.5' 
                  }}>
                    {notif.tipe === 'penting' ? '⚠ ' : '✓ '} 
                    {notif.teks}
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '800', 
                    color: '#4A3F35' 
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
