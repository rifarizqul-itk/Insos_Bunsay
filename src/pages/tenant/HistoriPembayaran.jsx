import React, { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';

function HistoriPembayaran() {
  const { riwayat } = useTransactions();
  const [filterStatus, setFilterStatus] = useState('Semua');

  const transaksiDifilter = riwayat.filter((item) => {
    if (filterStatus === 'Semua') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)' }}>Arsip Riwayat Pembayaran</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>Daftar pelaporan transaksi digital Anda yang terekam di dalam sistem.</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ minWidth: '220px', height: '48px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '700', color: 'var(--text)', border: '1px solid var(--border)', padding: '0 12px', backgroundColor: '#ffffff' }}
        >
          <option value="Semua">Semua Riwayat</option>
          <option value="Lunas">Status Lunas</option>
          <option value="Pending">Menunggu Verifikasi</option>
          <option value="Tertolak">Ditolak</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(139,26,26,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--warm-gray)', borderBottom: '3px solid var(--border)' }}>
              <th style={{ padding: '16px', fontSize: '15px', color: 'var(--text-2)', fontWeight: '800' }}>ID</th>
              <th style={{ padding: '16px', fontSize: '15px', color: 'var(--text-2)', fontWeight: '800' }}>Tanggal</th>
              <th style={{ padding: '16px', fontSize: '15px', color: 'var(--text-2)', fontWeight: '800' }}>Jenis</th>
              <th style={{ padding: '16px', fontSize: '15px', color: 'var(--text-2)', fontWeight: '800' }}>Nominal</th>
              <th style={{ padding: '16px', fontSize: '15px', color: 'var(--text-2)', fontWeight: '800' }}>Metode</th>
              <th style={{ padding: '16px', fontSize: '15px', color: 'var(--text-2)', fontWeight: '800' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {transaksiDifilter.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text)', fontWeight: '700', fontSize: '16px' }}>
                  Tidak ada riwayat dengan status "{filterStatus}".
                </td>
              </tr>
            ) : (
              transaksiDifilter.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--warm-gray)' }}>
                  <td style={{ padding: '18px 16px', fontWeight: '800', color: 'var(--text)' }}>{item.id}</td>
                  <td style={{ padding: '18px 16px', color: 'var(--text)', fontWeight: '700' }}>{item.waktu?.split(',')[0] || item.tanggal || '—'}</td>
                  <td style={{ padding: '18px 16px', color: 'var(--text)', fontWeight: '700' }}>{item.tagihan}</td>
                  <td style={{ padding: '18px 16px', fontWeight: '800', color: 'var(--text)' }}>{item.nominal}</td>
                  <td style={{ padding: '18px 16px', color: 'var(--text-2)', fontWeight: '700' }}>{item.metode}</td>
                  <td style={{ padding: '18px 16px' }}>
                    <span style={{
                      backgroundColor: item.status === 'Lunas' ? 'var(--green-bg)' : item.status === 'Pending' ? 'var(--orange-bg)' : 'var(--red-100)',
                      color: item.status === 'Lunas' ? 'var(--green)' : item.status === 'Pending' ? 'var(--orange)' : 'var(--red)',
                      padding: '6px 14px', borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '13px',
                      border: `2px solid ${item.status === 'Lunas' ? 'var(--green)' : item.status === 'Pending' ? 'var(--orange)' : 'var(--red)'}`,
                      display: 'inline-block'
                    }}>
                      {item.status === 'Lunas' ? '✓ Lunas' : item.status === 'Pending' ? '⏳ Pending' : '✕ Ditolak'}
                    </span>
                    {item.alasan && (
                      <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px', fontStyle: 'italic' }}>
                        {item.alasan}
                      </div>
                    )}
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
