import React, { useState } from 'react';

function VerifikasiPembayaran({ antrean, onProsesVerifikasi }) {
  const [previewItem, setPreviewItem] = useState(null);

  const handleAksi = (id, statusKonfirmasi) => {
    const itemTarget = antrean.find(item => item.id === id);
    if (!itemTarget) return;

    const statusFinal = statusKonfirmasi === 'konfirmasi' ? 'Lunas' : 'Tertolak';
    const alasanFinal = statusKonfirmasi === 'konfirmasi' ? null : 'Bukti transfer tidak sesuai / buram';

    alert(`Pembayaran dengan ID ${id} berhasil di-${statusKonfirmasi === 'konfirmasi' ? 'setujui (Lunas)' : 'tolak (Tertolak)'}.`);
    
    // Kirim data ke state global App.jsx untuk diarsipkan di riwayat
    onProsesVerifikasi({
      ...itemTarget,
      status: statusFinal,
      alasan: alasanFinal
    });

    setPreviewItem(null);
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Antrean Verifikasi Pembayaran</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Periksa keaslian bukti transfer atau struk QRIS yang dikirimkan oleh tenant sebelum melakukan konfirmasi saldo masuk.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Daftar Antrean Kiri */}
        <div style={{ flex: '2', minWidth: '400px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
                <th style={{ padding: '14px 16px', fontSize: '14px' }}>Tenant & Kios</th>
                <th style={{ padding: '14px 16px', fontSize: '14px' }}>Jenis Tagihan</th>
                <th style={{ padding: '14px 16px', fontSize: '14px' }}>Nominal</th>
                <th style={{ padding: '14px 16px', fontSize: '14px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {antrean.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    Tidak ada antrean pembayaran yang menunggu verifikasi.
                  </td>
                </tr>
              ) : (
                antrean.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--warm-gray)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600' }}>{item.nama}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: '700' }}>Kios {item.kios}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{item.tagihan}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{item.nominal}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => setPreviewItem(item)}
                        style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '6px 12px', fontSize: '13px' }}
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

        {/* Panel Kanan Preview Bukti Potret */}
        {previewItem && (
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="page-fade-in">
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              Detail Transaksi {previewItem.id}
            </h3>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ color: 'var(--text-3)' }}>Waktu Kirim:</span> <strong style={{ color: 'var(--text)' }}>{previewItem.waktu}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Metode:</span> <strong style={{ color: 'var(--text)' }}>{previewItem.metode}</strong></div>
            </div>

            {/* Simulasi Bentuk Dokumen Bukti Transfer */}
            <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                [Simulasi Lampiran File Bukti Bukti_Transfer_{previewItem.id}.jpg]
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                onClick={() => handleAksi(previewItem.id, 'konfirmasi')}
                style={{ flex: 1, backgroundColor: 'var(--green)', color: '#ffffff', padding: '10px', fontSize: '14px' }}
              >
                Konfirmasi Lunas
              </button>
              <button 
                onClick={() => handleAksi(previewItem.id, 'tolak')}
                style={{ flex: 1, backgroundColor: 'var(--warm-gray)', color: 'var(--red)', padding: '10px', fontSize: '14px' }}
              >
                Tolak Bukti
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifikasiPembayaran;