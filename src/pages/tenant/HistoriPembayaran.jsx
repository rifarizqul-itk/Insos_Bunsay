import React, { useState } from 'react';
import { useTransactionDomain } from '../../context/TransactionContext';

import Table from '../../components/ui/Table';

function HistoriPembayaran() {
  const { riwayat } = useTransactionDomain();
  const [filterStatus, setFilterStatus] = useState('Semua');

  const transaksiDifilter = riwayat.filter((item) => {
    if (filterStatus === 'Semua') return true;
    return item.status === filterStatus;
  });

  const tableHeaders = [
    { label: 'ID' },
    { label: 'Tanggal' },
    { label: 'Jenis' },
    { label: 'Nominal' },
    { label: 'Metode' },
    { label: 'Status' },
  ];

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
          aria-label="Filter status riwayat pembayaran"
          style={{ minWidth: '220px', height: '48px', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: '700', color: 'var(--text)', border: '1px solid var(--border)', padding: '0 12px', backgroundColor: '#ffffff' }}
        >
          <option value="Semua">Semua Riwayat</option>
          <option value="Lunas">Status Lunas</option>
          <option value="Pending">Menunggu Verifikasi</option>
          <option value="Tertolak">Ditolak</option>
        </select>
      </div>

      <Table
        caption="Arsip Riwayat Pembayaran Tenant"
        ariaLabel="Tabel Riwayat Pembayaran Tenant"
        headers={tableHeaders}
        isEmpty={transaksiDifilter.length === 0}
        emptyMessage={`Tidak ada riwayat dengan status "${filterStatus}".`}
        colSpan={6}
      >
        {transaksiDifilter.map((item) => (
          <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
            <td data-label="ID" className="py-2 px-0 md:px-3 font-extrabold text-text font-mono">{item.id}</td>
            <td data-label="Tanggal" className="py-2 px-0 md:px-3 text-text font-bold">{item.waktu?.split(',')[0] || item.tanggal || '—'}</td>
            <td data-label="Jenis" className="py-2 px-0 md:px-3 text-text font-bold">{item.tagihan}</td>
            <td data-label="Nominal" className="py-2 px-0 md:px-3 font-extrabold text-text font-mono">{item.nominal}</td>
            <td data-label="Metode" className="py-2 px-0 md:px-3 text-text-2 font-bold">{item.metode}</td>
            <td data-label="Status" className="py-2 px-0 md:px-3">
              <span style={{
                backgroundColor: item.status === 'Lunas' ? 'var(--green-bg)' : item.status === 'Pending' ? 'var(--orange-bg)' : 'var(--red-100)',
                color: item.status === 'Lunas' ? 'var(--green)' : item.status === 'Pending' ? 'var(--orange)' : 'var(--red)',
                padding: '6px 14px', borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '13px',
                border: `2px solid ${item.status === 'Lunas' ? 'var(--green)' : item.status === 'Pending' ? 'var(--orange)' : 'var(--red)'}`,
                display: 'inline-block'
              }}>
                <span aria-hidden="true">{item.status === 'Lunas' ? '✓ ' : item.status === 'Pending' ? '⏳ ' : '✕ '}</span>
                {item.status === 'Lunas' ? 'Lunas' : item.status === 'Pending' ? 'Pending' : 'Ditolak'}
              </span>
              {item.alasan && (
                <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px', fontStyle: 'italic' }}>
                  {item.alasan}
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export default HistoriPembayaran;
