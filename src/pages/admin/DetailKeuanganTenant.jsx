import React, { useState } from 'react';

function DetailKeuanganTenant({ tenant, onBack, onUpdateTenant }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    statusPembayaran: tenant.statusPembayaran,
    tunggakan: tenant.tunggakan,
    rincianTunggakan: tenant.rincianTunggakan || '—'
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    const updated = { 
      ...tenant, 
      statusPembayaran: editData.statusPembayaran,
      tunggakan: editData.tunggakan,
      rincianTunggakan: editData.rincianTunggakan
    };
    onUpdateTenant(updated);
    setShowEditModal(false);
    alert('Data keuangan tenant berhasil diperbarui.');
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      'Lunas': { bg: 'var(--green-bg)', color: 'var(--green)' },
      'Belum Bayar': { bg: 'var(--red-100)', color: 'var(--red)' },
      'Menunggu Verifikasi': { bg: 'var(--orange-bg)', color: 'var(--orange)' }
    };
    return styles[status] || styles['Belum Bayar'];
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'var(--warm-gray)',
            color: 'var(--text)',
            padding: '0 20px',
            fontSize: '14px',
            marginBottom: '16px',
            height: '44px',
            fontWeight: '600',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          ← Kembali ke Dashboard Admin
        </button>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Detail Keuangan: {tenant.nama}
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Status pembayaran, rincian tunggakan, dan riwayat transaksi.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Status Keuangan */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '28px',
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text)' }}>
              Status Rekapitulasi Keuangan
            </h3>
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                backgroundColor: 'var(--warm-gray)',
                color: 'var(--text)',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: '600',
                height: '36px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              Edit Data Keuangan
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Status Pembayaran</span>
              <div style={{ marginTop: '6px' }}>
                <span
                  style={{
                    backgroundColor: getStatusBadgeStyle(tenant.statusPembayaran).bg,
                    color: getStatusBadgeStyle(tenant.statusPembayaran).color,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}
                >
                  {tenant.statusPembayaran}
                </span>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--warm-gray)', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Tunggakan AR</span>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px', color: tenant.tunggakan !== 'Rp 0' ? 'var(--orange)' : 'var(--text)' }}>
                {tenant.tunggakan}
              </div>
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-3)', fontSize: '13px', fontWeight: '600' }}>Rincian Tunggakan:</span>
            <div style={{ fontWeight: '600', fontSize: '14px', marginTop: '2px', color: 'var(--text-2)' }}>{tenant.rincianTunggakan || '—'}</div>
          </div>
        </div>

        {/* Riwayat Transaksi */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '28px',
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)'
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
            Riwayat Transaksi Pelaporan Terdahulu
          </h3>
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--warm-gray)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>ID</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Tanggal</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Jenis</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Nominal</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Metode</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--text-2)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenant.riwayat && tenant.riwayat.length > 0 ? (
                  tenant.riwayat.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--warm-gray)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>{row.id}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{row.tanggal}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{row.tipe}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>{row.nominal}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-3)', fontWeight: '600' }}>{row.metode}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ backgroundColor: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
                      Belum ada riwayat transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Edit Keuangan */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            className="page-fade-in"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                Edit Data Keuangan: {tenant.nama}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: 'var(--text-3)',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Status Pembayaran</label>
                <select
                  name="statusPembayaran"
                  value={editData.statusPembayaran}
                  onChange={handleEditChange}
                  style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
                >
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Bayar">Belum Bayar</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nilai Tunggakan AR (Rp)</label>
                <input
                  type="text"
                  name="tunggakan"
                  value={editData.tunggakan}
                  onChange={handleEditChange}
                  placeholder="Contoh: Rp 5.500.000"
                  style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px', fontSize: '15px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Rincian Tunggakan</label>
                <textarea
                  name="rincianTunggakan"
                  value={editData.rincianTunggakan}
                  onChange={handleEditChange}
                  rows="3"
                  placeholder="Deskripsi rincian tunggakan..."
                  style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '15px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--warm-gray)',
                    color: 'var(--text)',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--red)',
                    color: '#ffffff',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailKeuanganTenant;