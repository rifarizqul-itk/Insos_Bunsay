import React from 'react';

function App() {
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }} className="page-fade-in">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--red)' }}>Sistem Manajemen Pembayaran Bunsay</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '16px', marginTop: '8px' }}>
          Plaza Kebun Sayur Balikpapan — Dokumen Penyelarasan Desain Awal
        </p>
      </header>
      
      <main style={{ background: '#ffffff', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Pengujian Token Desain</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ backgroundColor: 'var(--green-bg)', color: 'var(--green)', padding: '6px 12px', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}>
            Lunas
          </span>
          <span style={{ backgroundColor: 'var(--red-100)', color: 'var(--red)', padding: '6px 12px', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}>
            Belum Lunas
          </span>
          <span style={{ backgroundColor: 'var(--orange-bg)', color: 'var(--orange)', padding: '6px 12px', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}>
            Ada Tunggakan
          </span>
        </div>
      </main>
    </div>
  );
}

export default App;