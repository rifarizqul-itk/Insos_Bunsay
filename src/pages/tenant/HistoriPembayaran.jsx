import React, { useState } from 'react';

function HistoriPembayaran() {
  const [filterStatus, setFilterStatus] = useState('Semua');

  const dataTransaksi = [
    { id: 'TX-4001', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' },
    { id: 'TX-4002', tanggal: '02 Mei 2026', tipe: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' },
    { id: 'TX-4003', tanggal: '19 Mei 2026', tipe: 'Cicilan Tunggakan (Piutang)', nominal: 'Rp 2.000.000', metode: 'Transfer Bank', status: 'Menunggu Verifikasi' }
  ];

  // PERBAIKAN LOGIKA: Menyaring data transaksi berdasarkan pilihan menu dropdown
  const transaksiDifilter = dataTransaksi.filter((item) => {
    if (filterStatus === 'Semua') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1A1410' }}>Arsip Riwayat Pembayaran</h2>
          <p style={{ color: '#4A3F35', fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>Daftar pelaporan transaksi digital Anda yang terekam di dalam sistem pengelola plaza.</p>
        </div>
        
        {/* Dropdown status filter dengan area klik tinggi 48px untuk kemudahan motorik lansia */}
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          style={{ minWidth: '220px', height: '48px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', color: '#1A1410', border: '1px solid #D6C8BC', padding: '0 12px', backgroundColor: '#ffffff' }}
        >
          <option value="Semua">Semua Riwayat</option>
          <option value="Lunas">Status Lunas</option>
          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #D6C8BC', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F5F0EB', borderBottom: '3px solid #1A1410' }}>
              <th style={{ padding: '16px', fontSize: '15px', color: '#1A1410', fontWeight: '800' }}>ID Transaksi</th>
              <th style={{ padding: '16px', fontSize: '15px', color: '#1A1410', fontWeight: '800' }}>Tanggal Pembayaran</th>
              <th style={{ padding: '16px', fontSize: '15px', color: '#1A1410', fontWeight: '800' }}>Jenis Tagihan</th>
              <th style={{ padding: '16px', fontSize: '15px', color: '#1A1410', fontWeight: '800' }}>Nominal Setoran</th>
              <th style={{ padding: '16px', fontSize: '15px', color: '#1A1410', fontWeight: '800' }}>Kanal Metode</th>
              <th style={{ padding: '16px', fontSize: '15px', color: '#1A1410', fontWeight: '800' }}>Status Akhir</th>
            </tr>
          </thead>
          <tbody>
            {/* PENANGANAN EMPTY STATE: Menampilkan baris pemberitahuan ramah jika data filter kosong */}
            {transaksiDifilter.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px 16px', textAlign: 'center', color: '#1A1410', fontWeight: '700', fontSize: '16px' }}>
                  Tidak ada data laporan transaksi dengan status "{filterStatus}".
                </td>
              </tr>
            ) : (
              transaksiDifilter.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #C4B9AF', backgroundColor: index % 2 === 0 ? '#ffffff' : '#F9F6F0' }}>
                  <td style={{ padding: '18px 16px', fontWeight: '800', color: '#1A1410' }}>{item.id}</td>
                  <td style={{ padding: '18px 16px', color: '#1A1410', fontWeight: '700' }}>{item.tanggal}</td>
                  <td style={{ padding: '18px 16px', color: '#1A1410', fontWeight: '700' }}>{item.tipe}</td>
                  <td style={{ padding: '18px 16px', fontWeight: '800', color: '#1A1410' }}>{item.nominal}</td>
                  <td style={{ padding: '18px 16px', color: '#4A3F35', fontWeight: '700' }}>{item.metode}</td>
                  <td style={{ padding: '18px 16px' }}>
                    <span style={{ 
                      backgroundColor: item.status === 'Lunas' ? '#E8F5EE' : '#FEF3E6', 
                      color: item.status === 'Lunas' ? '#1A6B3A' : '#C05C00', 
                      padding: '6px 14px', borderRadius: '4px', fontWeight: '800', fontSize: '13px',
                      border: item.status === 'Lunas' ? '2px solid #1A6B3A' : '2px solid #C05C00',
                      display: 'inline-block'
                    }}>
                      {item.status === 'Lunas' ? '✓ Lunas' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoriPembayaran;