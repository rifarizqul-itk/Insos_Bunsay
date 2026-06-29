import React, { useState } from 'react';

function RiwayatTransaksiAdmin({ riwayat }) {
  // State untuk menyimpan data transaksi yang ingin dilihat bukti transfernya
  const [selectedBukti, setSelectedBukti] = useState(null);

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Riwayat Transaksi Admin</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Menampilkan seluruh rekaman transaksi dari tenant yang telah dikonfirmasi Lunas maupun yang buktinya telah Ditolak oleh pengelola beserta lampiran buktinya.
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontSize: '14px' }}>ID TRX</th>
              <th style={{ padding: '14px 16px', fontSize: '14px' }}>Tenant & Kios</th>
              <th style={{ padding: '14px 16px', fontSize: '14px' }}>Jenis Tagihan</th>
              <th style={{ padding: '14px 16px', fontSize: '14px' }}>Nominal</th>
              <th style={{ padding: '14px 16px', fontSize: '14px' }}>Metode & Waktu</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', textAlign: 'center' }}>Status Akhir</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                  Belum ada riwayat verifikasi transaksi yang tersimpan.
                </td>
              </tr>
            ) : (
              riwayat.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#ffffff' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--text-2)' }}>{item.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600' }}>{item.nama}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: '700' }}>Kios {item.kios}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{item.tagihan}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>{item.nominal}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-2)' }}>
                    <div>{item.metode}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: '12px' }}>{item.waktu}</div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
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
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button 
                      onClick={() => setSelectedBukti(item)}
                      style={{ 
                        backgroundColor: 'transparent', 
                        color: 'var(--red)', 
                        border: '1px solid var(--red)',
                        padding: '6px 12px', 
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Lihat Bukti
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup Tampilan Bukti Transfer */}
      {selectedBukti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="page-fade-in" style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                Bukti Transaksi {selectedBukti.id}
              </h3>
              <button 
                onClick={() => setSelectedBukti(null)}
                style={{ backgroundColor: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-3)', minHeight: 'auto', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><span style={{ color: 'var(--text-3)' }}>Tenant:</span> <strong>{selectedBukti.nama} ({selectedBukti.kios})</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Nominal:</span> <strong>{selectedBukti.nominal}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Metode:</span> <strong>{selectedBukti.metode}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Waktu:</span> <strong>{selectedBukti.waktu}</strong></div>
              <div>
                <span style={{ color: 'var(--text-3)' }}>Status Akhir:</span>{' '}
                <span style={{ 
                  color: selectedBukti.status === 'Lunas' ? '#1A6B3A' : '#8B1A1A',
                  fontWeight: '700'
                }}>
                  {selectedBukti.status}
                </span>
              </div>
              {selectedBukti.alasan && (
                <div><span style={{ color: 'var(--text-3)' }}>Keterangan Tolak:</span> <strong style={{ color: 'var(--red)' }}>{selectedBukti.alasan}</strong></div>
              )}
            </div>

            {/* Simulasi Gambar Bukti Transfer */}
            <div style={{ width: '100%', height: '220px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                [Simulasi Lampiran File Bukti Bukti_Transfer_{selectedBukti.id}.jpg]
              </span>
            </div>

            <button 
              onClick={() => setSelectedBukti(null)}
              style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '10px', fontSize: '14px', fontWeight: '600' }}
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiwayatTransaksiAdmin;