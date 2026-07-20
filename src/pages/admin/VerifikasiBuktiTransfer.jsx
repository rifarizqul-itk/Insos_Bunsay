import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { useUI } from '../../context/UIContext';

function VerifikasiBuktiTransfer({ selectedTenant = null }) {
  const { antrean, prosesVerifikasi } = useTransactions();
  const { addToast } = useUI();
  const [previewItem, setPreviewItem] = useState(null);

  const filteredAntrean = selectedTenant
    ? antrean.filter(item => item.nama === selectedTenant)
    : antrean;

  useEffect(() => {
    if (selectedTenant && filteredAntrean.length > 0) {
      setPreviewItem(filteredAntrean[0]);
    }
  }, [selectedTenant]);

  const handleAksi = (id, statusKonfirmasi) => {
    const itemTarget = antrean.find(item => item.id === id);
    if (!itemTarget) return;

    const statusFinal = statusKonfirmasi === 'konfirmasi' ? 'Lunas' : 'Tertolak';
    const alasan = statusKonfirmasi === 'konfirmasi' ? null : 'Bukti transfer tidak sesuai / buram';

    prosesVerifikasi({
      ...itemTarget,
      status: statusFinal,
      alasan
    });

    addToast(
      `Pembayaran ${id} berhasil di-${statusKonfirmasi === 'konfirmasi' ? 'setujui (Lunas)' : 'tolak'}.`,
      statusKonfirmasi === 'konfirmasi' ? 'success' : 'error'
    );
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
        <div className="w-full md:flex-[2]" style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
                <th style={{ padding: '8px 12px', fontSize: '14px' }}>Tenant & Kios</th>
                <th style={{ padding: '8px 12px', fontSize: '14px' }}>Jenis Tagihan</th>
                <th style={{ padding: '8px 12px', fontSize: '14px' }}>Nominal</th>
                <th style={{ padding: '8px 12px', fontSize: '14px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAntrean.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    {selectedTenant 
                      ? `Tidak ada antrean bukti transfer untuk ${selectedTenant}.`
                      : 'Tidak ada antrean pembayaran yang menunggu verifikasi.'}
                  </td>
                </tr>
              ) : (
                filteredAntrean.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--warm-gray)' }}>
                    <td data-label="Tenant & Kios" style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: '600' }}>{item.nama}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: '700', fontFamily: 'monospace' }}>Kios {item.kios}</div>
                    </td>
                    <td data-label="Jenis Tagihan" style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{item.tagihan}</td>
                    <td data-label="Nominal" style={{ padding: '8px 12px', fontWeight: '600', fontFamily: 'monospace' }}>{item.nominal}</td>
                    <td data-label="Aksi" style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => setPreviewItem(item)}
                        style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '0 14px', fontSize: '13px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', height: '44px', minHeight: '44px' }}
                      >
                        Periksa Bukti
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full md:flex-1">
          {previewItem ? (
            <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="page-fade-in">
              <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                Detail Transaksi <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{previewItem.id}</span>
              </h3>
              <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><span style={{ color: 'var(--text-3)' }}>Tenant:</span> <strong>{previewItem.nama} (<span style={{ fontFamily: 'monospace' }}>{previewItem.kios}</span>)</strong></div>
                <div><span style={{ color: 'var(--text-3)' }}>Tagihan:</span> <strong>{previewItem.tagihan}</strong></div>
                <div><span style={{ color: 'var(--text-3)' }}>Nominal:</span> <strong style={{ fontFamily: 'monospace' }}>{previewItem.nominal}</strong></div>
                <div><span style={{ color: 'var(--text-3)' }}>Metode:</span> <strong>{previewItem.metode}</strong></div>
                <div><span style={{ color: 'var(--text-3)' }}>Waktu Kirim:</span> <strong style={{ fontFamily: 'monospace' }}>{previewItem.waktu}</strong></div>
              </div>

              <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                  [Simulasi Lampiran Bukti_Transfer_{previewItem.id}.jpg]
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  onClick={() => handleAksi(previewItem.id, 'konfirmasi')}
                  style={{ flex: 1, backgroundColor: 'var(--green)', color: '#ffffff', padding: '10px', fontSize: '14px', fontWeight: '700', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: '44px' }}
                >
                  Konfirmasi Lunas
                </button>
                <button 
                  onClick={() => handleAksi(previewItem.id, 'tolak')}
                  style={{ flex: 1, backgroundColor: 'var(--warm-gray)', color: 'var(--red)', padding: '10px', fontSize: '14px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: '44px' }}
                >
                  Tolak Bukti
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
