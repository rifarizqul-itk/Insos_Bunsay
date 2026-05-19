import React, { useState, useEffect, useRef } from 'react';

function Topbar({ userTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Memasang jangkar referensi (Ref) pada kontainer dropdown notifikasi
  const notifikasiRef = useRef(null);

  const daftarNotifikasi = [
    { id: 1, teks: 'Tagihan Tunggakan (Piutang) historis Anda terdeteksi belum lunas.', waktu: 'Hari ini', tipe: 'penting' },
    { id: 2, teks: 'Pembayaran Service Charge bulan April 2026 telah tervalidasi lunas.', waktu: '2 hari lalu', tipe: 'sukses' }
  ];

  // LOGIKA UTAMA: Mendeteksi klik di luar area komponen untuk menutup dropdown secara otomatis
  useEffect(() => {
    function handleKlikLuar(event) {
      if (notifikasiRef.current && !notifikasiRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Mendaftarkan event listener ke sistem dokumen peramban
    document.addEventListener('mousedown', handleKlikLuar);
    
    // Membersihkan event listener saat komponen tidak lagi digunakan (unmount)
    return () => {
      document.removeEventListener('mousedown', handleKlikLuar);
    };
  }, []);

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #D6C8BC',
      position: 'fixed',
      top: 0,
      left: '240px',
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 32px',
      zIndex: 90
    }}>
      {/* Sisi Kiri: Sapaan Identitas Sesi Aktif */}
      <div style={{ fontSize: '16px', fontWeight: '700', color: '#4A3F35' }}>
        Sesi Aktif: <span style={{ color: '#8B1A1A' }}>{userTitle}</span>
      </div>

      {/* Sisi Kanan: Menu Dropdown Notifikasi dengan Jangkar Ref */}
      <div ref={notifikasiRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            height: '48px', // Target klik minimal 48px presisi sesuai WCAG 2.2 AA
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
          <div style={{
            position: 'absolute',
            top: '56px',
            right: 0,
            width: '360px',
            backgroundColor: '#ffffff',
            border: '1px solid #D6C8BC',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)', // Micro-shadow tipis halus
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.15s ease-out'
          }}>
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
                    border: notif.tipe === 'penting' ? '1px solid #FADADD' : '1px solid #E6DBCF', // Full border halus sesuai panduan premium
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