import React from 'react';

function Topbar({ userTitle }) {
  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'fixed',
      top: 0,
      left: '240px',
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 90
    }}>
      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-2)' }}>
        Sistem Pembayaran Digital Plaza Kebun Sayur Balikpapan
      </div>
      
      {/* Informasi Pengguna & Notifikasi Mentah */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: '600' }}>Notifikasi</span>
        </div>
        <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }}></div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
          {userTitle}
        </div>
      </div>
    </header>
  );
}

export default Topbar;