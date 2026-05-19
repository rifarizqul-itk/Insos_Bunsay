import React, { useState } from 'react';

function HistoriPembayaran() {
  const [filterStatus, setFilterStatus] = useState('Semua');

  const dataTransaksi = [
    { id: 'TX-4001', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' },
    { id: 'TX-4002', tanggal: '02 Mei 2026', tipe: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' },
    { id: 'TX-4003', tanggal: '19 Mei 2026', tipe: 'Cicilan Tunggakan AR', nominal: 'Rp 2.000.000', metode: 'Transfer Bank', status: 'Menunggu Verifikasi' }
  ];

  const filteredTransaksi = dataTransaksi.filter(item => {
    if (filterStatus === 'Semua') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Arsip Riwayat Pembayaran</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Daftar pelaporan transaksi digital Anda yang terekam di dalam sistem pengelola plaza.</p>
        </div>
        
        {/* Bilah Saringan */}
        <div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ minWidth: '180px' }}>
            <option value="Semua">Semua Riwayat</option>
            <option value="Lunas">Status Lunas</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--warm-gray)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-2)', fontWeight: '700' }}>ID Transaksi</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-2)', fontWeight: '700' }}>Tanggal Pembayaran</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-2)', fontWeight: '700' }}>Jenis Tagihan</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-2)', fontWeight: '700' }}>Nominal Setoran</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-2)', fontWeight: '700' }}>Kanal Metode</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-2)', fontWeight: '700' }}>Status Akhir</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransaksi.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--cream)' }}>
                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{item.id}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{item.tanggal}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{item.tipe}</td>
                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{item.nominal}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-3)', fontWeight: '600' }}>{item.metode}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ 
                    backgroundColor: item.status === 'Lunas' ? 'var(--green-bg)' : 'var(--orange-bg)', 
                    color: item.status === 'Lunas' ? 'var(--green)' : 'var(--orange)', 
                    padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '12px' 
                  }}>
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

export default HistoriPembayaran;