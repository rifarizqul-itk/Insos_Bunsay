import React, { useState, useEffect } from 'react';
import { useTransactionDomain } from '../../context/TransactionContext';
import { useUI } from '../../context/UIContext';
import Icon from '../../components/ui/Icon';
import Table from '../../components/ui/Table';

function VerifikasiBuktiTransfer({ selectedTenant = null }) {
  const { antrean, verifyTransaction, isLoading, error } = useTransactionDomain();
  const { addToast } = useUI();
  const [previewItem, setPreviewItem] = useState(null);

  const filteredAntrean = selectedTenant
    ? antrean.filter(item => item.nama === selectedTenant)
    : antrean;

  const tableHeaders = [
    { label: 'Tenant & Kios' },
    { label: 'Jenis Tagihan' },
    { label: 'Nominal' },
    { label: 'Aksi', align: 'center' },
  ];

  useEffect(() => {
    if (selectedTenant && filteredAntrean.length > 0) {
      setPreviewItem(filteredAntrean[0]);
    }
  }, [selectedTenant]);

  const handleAksi = async (id, statusKonfirmasi) => {
    const itemTarget = antrean.find(item => item.id === id);
    if (!itemTarget) return;

    const statusFinal = statusKonfirmasi === 'konfirmasi' ? 'Lunas' : 'Tertolak';
    const alasan = statusKonfirmasi === 'konfirmasi' ? null : 'Bukti transfer tidak sesuai / buram';

    try {
      const result = await verifyTransaction(id, statusFinal, alasan);
      if (result && result.success) {
        addToast(
          result.message || `Pembayaran ${id} berhasil di-${statusKonfirmasi === 'konfirmasi' ? 'setujui (Lunas)' : 'tolak'}.`,
          statusKonfirmasi === 'konfirmasi' ? 'success' : 'error'
        );
      } else {
        addToast(result?.message || 'Gagal memproses verifikasi.', 'error');
      }
    } catch (_) {
      addToast('Terjadi kesalahan saat memverifikasi transaksi.', 'error');
    }
    setPreviewItem(null);
  };


  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Verifikasi Bukti Transfer
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          {selectedTenant 
            ? `Menampilkan antrean bukti transfer untuk: ${selectedTenant}`
            : 'Periksa keaslian bukti transfer yang dikirimkan oleh tenant.'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:flex-[2]">
          <Table
            caption="Antrean Verifikasi Bukti Transfer Tenant"
            ariaLabel="Tabel Antrean Verifikasi Pembayaran Transfer Manual"
            headers={tableHeaders}
            isEmpty={filteredAntrean.length === 0}
            emptyMessage={selectedTenant ? `Tidak ada antrean bukti transfer untuk ${selectedTenant}.` : 'Tidak ada antrean pembayaran yang menunggu verifikasi.'}
            colSpan={4}
          >
            {filteredAntrean.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--warm-gray)' }}>
                <th scope="row" data-label="Tenant & Kios" style={{ padding: '8px 12px', textAlign: 'left' }}>
                  <div style={{ fontWeight: '600' }}>{item.nama}</div>
                  <div className="font-tabular-nums font-bold" style={{ fontSize: '13px', color: 'var(--text-3)' }}>Kios {item.kios}</div>
                </th>
                <td data-label="Jenis Tagihan" style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{item.tagihan}</td>
                <td data-label="Nominal" className="font-tabular-nums font-bold" style={{ padding: '8px 12px' }}>{item.nominal}</td>
                <td data-label="Aksi" style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <button 
                    onClick={() => setPreviewItem(item)}
                    style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '0 14px', fontSize: '13px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', height: '44px', minHeight: '44px' }}
                  >
                    Periksa Bukti
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="w-full md:flex-1">
          {previewItem ? (
            <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="page-fade-in">
              <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                Detail Transaksi <span className="font-tabular-nums font-bold">{previewItem.id}</span>
              </h3>
              <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><span style={{ color: 'var(--text-3)' }}>Tenant:</span> <strong>{previewItem.nama} (<span className="font-tabular-nums">{previewItem.kios}</span>)</strong></div>
                <div><span style={{ color: 'var(--text-3)' }}>Tagihan:</span> <strong>{previewItem.tagihan}</strong></div>
                <div><span style={{ color: 'var(--text-3)' }}>Nominal:</span> <strong className="font-tabular-nums">{previewItem.nominal}</strong></div>
                <div><span style={{ color: 'var(--text-3)' }}>Metode:</span> <strong>{previewItem.metode}</strong></div>
                <div><span style={{ color: 'var(--text-3)' }}>Waktu Kirim:</span> <strong className="font-tabular-nums">{previewItem.waktu}</strong></div>
              </div>

              <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                  [Simulasi Lampiran Bukti_Transfer_{previewItem.id}.jpg]
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  onClick={() => handleAksi(previewItem.id, 'konfirmasi')}
                  style={{ flex: 1, backgroundColor: 'var(--green)', color: '#ffffff', padding: '10px', fontSize: '14px', fontWeight: '700', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Icon icon="ph:check-bold" width="18" height="18" />
                  <span>Konfirmasi Lunas</span>
                </button>
                <button 
                  onClick={() => handleAksi(previewItem.id, 'tolak')}
                  style={{ flex: 1, backgroundColor: 'var(--warm-gray)', color: 'var(--red)', padding: '10px', fontSize: '14px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Icon icon="ph:x-bold" width="18" height="18" />
                  <span>Tolak Bukti</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
              {filteredAntrean.length > 0 
                ? 'Pilih salah satu antrean untuk memeriksa bukti transfer.'
                : 'Tidak ada bukti transfer yang perlu diverifikasi.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifikasiBuktiTransfer;
