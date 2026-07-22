import React, { useState } from 'react';
import { useTransactionDomain } from '../../context/TransactionContext';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

function RiwayatTransaksiAdmin() {
  const { riwayat } = useTransactionDomain();
  const [selectedBukti, setSelectedBukti] = useState(null);

  const tableHeaders = [
    { label: 'ID TRX' },
    { label: 'Tenant & Kios' },
    { label: 'Jenis Tagihan' },
    { label: 'Nominal' },
    { label: 'Metode & Waktu' },
    { label: 'Status', align: 'center' },
    { label: 'Aksi', align: 'center' },
  ];

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Riwayat Transaksi Admin</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Menampilkan seluruh rekaman transaksi yang telah dikonfirmasi atau ditolak.
        </p>
      </div>

      <Table
        caption="Riwayat Transaksi Lintas Metode Pengelola Plaza"
        ariaLabel="Tabel Riwayat Seluruh Transaksi Admin"
        headers={tableHeaders}
        isEmpty={riwayat.length === 0}
        emptyMessage="Belum ada riwayat verifikasi transaksi."
        colSpan={7}
      >
        {riwayat.map((item) => (
          <tr key={item.id} style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#ffffff' }}>
            <td data-label="ID TRX" className="font-tabular-nums font-bold" style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{item.id}</td>
            <th scope="row" data-label="Tenant & Kios" style={{ padding: '8px 12px', textAlign: 'left' }}>
              <div style={{ fontWeight: '600' }}>{item.nama}</div>
              <div className="font-tabular-nums font-bold" style={{ fontSize: '13px', color: 'var(--text-3)' }}>Kios {item.kios}</div>
            </th>
            <td data-label="Jenis Tagihan" style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{item.tagihan}</td>
            <td data-label="Nominal" className="font-tabular-nums font-bold" style={{ padding: '8px 12px' }}>{item.nominal}</td>
            <td data-label="Metode & Waktu" style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-2)' }}>
              <div>{item.metode}</div>
              <div style={{ color: 'var(--text-3)', fontSize: '12px' }}>{item.waktu}</div>
            </td>
            <td data-label="Status" style={{ padding: '8px 12px', textAlign: 'center' }}>
              <span style={{ 
                backgroundColor: item.status === 'Lunas' ? '#E8F5EE' : '#FDF2F2', 
                color: item.status === 'Lunas' ? '#1A6B3A' : '#8B1A1A', 
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: '700',
                display: 'inline-block'
              }}>
                {item.status}
              </span>
              {item.alasan && (
                <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px', fontStyle: 'italic', fontWeight: '500' }}>
                  {item.alasan}
                </div>
              )}
            </td>
            <td data-label="Aksi" style={{ padding: '8px 12px', textAlign: 'center' }}>
              <button 
                onClick={() => setSelectedBukti(item)}
                className="table-action-btn"
                style={{ 
                  backgroundColor: 'transparent', 
                  color: 'var(--red)', 
                  border: '1px solid var(--red)', 
                  padding: '10px 16px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  cursor: 'pointer', 
                  borderRadius: '4px',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Lihat Bukti
              </button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={!!selectedBukti}
        onClose={() => setSelectedBukti(null)}
        title={selectedBukti ? `Bukti ${selectedBukti.id}` : ''}
        size="sm"
        footer={
          <button 
            onClick={() => setSelectedBukti(null)} 
            style={{ 
              backgroundColor: 'var(--warm-gray)', 
              color: 'var(--text)', 
              padding: '0 20px', 
              fontSize: '14px', 
              fontWeight: '600', 
              borderRadius: 'var(--radius-md)', 
              border: 'none', 
              cursor: 'pointer',
              height: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            Tutup
          </button>
        }
      >
        {selectedBukti && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ color: 'var(--text-3)' }}>Tenant:</span> <strong>{selectedBukti.nama} ({selectedBukti.kios})</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Nominal:</span> <strong>{selectedBukti.nominal}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Metode:</span> <strong>{selectedBukti.metode}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Waktu:</span> <strong>{selectedBukti.waktu}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Status:</span> <strong style={{ color: selectedBukti.status === 'Lunas' ? '#1A6B3A' : '#8B1A1A' }}>{selectedBukti.status}</strong></div>
              {selectedBukti.alasan && <div><span style={{ color: 'var(--text-3)' }}>Alasan Tolak:</span> <strong style={{ color: 'var(--red)' }}>{selectedBukti.alasan}</strong></div>}
            </div>
            <div style={{ width: '100%', height: '220px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>[Simulasi Lampiran Bukti_Transfer_{selectedBukti.id}.jpg]</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RiwayatTransaksiAdmin;
