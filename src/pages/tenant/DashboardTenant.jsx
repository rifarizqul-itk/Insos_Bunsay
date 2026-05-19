import React from 'react';

function DashboardTenant() {
  // Contoh riil rekap aktivitas data
  const aktivitasTerbaru = [
    { id: 'TX01', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', status: 'Lunas' },
    { id: 'TX02', tanggal: '02 Mei 2026', tipe: 'Sewa Gedung', nominal: 'Rp 1.500.000', status: 'Lunas' },
    { id: 'TX03', tanggal: '05 April 2026', tipe: 'Cicilan Tunggakan AR', nominal: 'Rp 1.000.000', status: 'Lunas' }
  ];

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Sapaan Utama */}
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Halo, Hj. Yuliana
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Pemilik Sah Kios Blok B-1001 — Selamat datang di panel administrasi mandiri Anda.
        </p>
      </div>

      {/* Baris Ringkasan Kartu / Stat Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' /* , boxShadow: 'var(--shadow-sm)' */ }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Sisa Masa Gedung</span>
          <div style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0', color: 'var(--text)' }}>12 Nopember 2026</div>
          <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>Masa sewa aktif berjalan</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' /* , boxShadow: 'var(--shadow-sm)' */ }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Status Sewa Bulan Ini</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0' }}>
            <span style={{ backgroundColor: 'var(--green-bg)', color: 'var(--green)', padding: '6px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '14px' }}>
              Lunas
            </span>
          </div>
          <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>Tagihan gedung bersih</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' /* , boxShadow: 'var(--shadow-sm)' */ }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Tunggakan Historis (AR)</span>
          <div style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0', color: 'var(--orange)' }}>Rp 13.219.998</div>
          <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>Data tercatat s/d Sept 2024</span>
        </div>
      </div>

      {/* Tabel Ringkasan Aktivitas Terbaru */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)', 
        /* boxShadow: 'var(--shadow-sm)', */
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '700' }}>Ringkasan Aktivitas Terbaru</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--warm-gray)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '14px', color: 'var(--text-2)' }}>ID Transaksi</th>
              <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '14px', color: 'var(--text-2)' }}>Tanggal</th>
              <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '14px', color: 'var(--text-2)' }}>Jenis Tagihan</th>
              <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '14px', color: 'var(--text-2)' }}>Nominal</th>
              <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '14px', color: 'var(--text-2)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {aktivitasTerbaru.map((item, index) => (
              <tr key={item.id} style={{ 
                borderBottom: '1px solid var(--border)',
                backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--cream)'
              }}>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>{item.id}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{item.tanggal}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{item.tipe}</td>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>{item.nominal}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ backgroundColor: 'var(--green-bg)', color: 'var(--green)', padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '12px' }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardTenant;