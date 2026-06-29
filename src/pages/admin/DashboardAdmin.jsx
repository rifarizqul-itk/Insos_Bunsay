import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailKeuanganTenant from './DetailKeuanganTenant';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedTenant, setSelectedTenant] = useState(null);

  // State untuk modal verifikasi
  const [showVerifikasiModal, setShowVerifikasiModal] = useState(false);
  const [verifikasiTarget, setVerifikasiTarget] = useState(null);

  // Data tenant (single source of truth)
  const [tenantData, setTenantData] = useState([
    { 
      id: 1, 
      nama: 'Hj. Yuliana', 
      kios: 'B-1001', 
      usaha: 'Kerajinan', 
      statusPembayaran: 'Lunas', 
      tunggakan: 'Rp 13.219.998',
      rincianTunggakan: 'Tunggakan historis s/d September 2024',
      riwayat: [
        { id: 'TX-3011', tanggal: '10 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' },
        { id: 'TX-3010', tanggal: '02 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ]
    },
    { 
      id: 2, 
      nama: 'Eva Tauresea', 
      kios: 'B-1004', 
      usaha: 'Fashion', 
      statusPembayaran: 'Menunggu Verifikasi', 
      tunggakan: 'Rp 0',
      rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-2088', tanggal: '01 Mei 2026', tipe: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', status: 'Lunas' }
      ]
    },
    { 
      id: 3, 
      nama: 'H. Ahmad', 
      kios: 'B-1013', 
      usaha: 'Perhiasan', 
      statusPembayaran: 'Belum Bayar', 
      tunggakan: 'Rp 5.500.000',
      rincianTunggakan: 'Service Charge Bulan Berjalan (Rp 4.000.000) + Denda (Rp 1.500.000)',
      riwayat: []
    },
    { 
      id: 4, 
      nama: 'Toko Kalimantan', 
      kios: 'A-1002', 
      usaha: 'Oleh-oleh', 
      statusPembayaran: 'Lunas', 
      tunggakan: 'Rp 0',
      rincianTunggakan: '—',
      riwayat: [
        { id: 'TX-1044', tanggal: '28 April 2026', tipe: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank', status: 'Lunas' }
      ]
    }
  ]);

  // Data antrean verifikasi (mock)
  const [antreanVerifikasi, setAntreanVerifikasi] = useState([
    { id: 'TRX-1092', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (BNI)', waktu: '19 Mei 2026, 14:20 WITA' }
  ]);

  const filteredTenants = tenantData.filter(tenant => {
    const matchesSearch = tenant.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tenant.kios.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'Semua') return matchesSearch;
    return matchesSearch && tenant.statusPembayaran === statusFilter;
  });

  // Handler buka modal verifikasi
  const handleOpenVerifikasi = (tenant) => {
    const antrean = antreanVerifikasi.find(a => a.nama === tenant.nama);
    if (!antrean) {
      alert('Tidak ada bukti transfer yang menunggu verifikasi untuk tenant ini.');
      return;
    }
    setVerifikasiTarget({ tenant, antrean });
    setShowVerifikasiModal(true);
  };

  // Handler proses verifikasi
  const handleProsesVerifikasi = (id, status) => {
    const statusFinal = status === 'konfirmasi' ? 'Lunas' : 'Tertolak';
    alert(`Pembayaran ${id} berhasil di-${status === 'konfirmasi' ? 'setujui (Lunas)' : 'tolak'}.`);
    
    // Update status tenant
    if (status === 'konfirmasi') {
      setTenantData(prev => prev.map(t => 
        t.nama === verifikasiTarget.tenant.nama 
          ? { ...t, statusPembayaran: 'Lunas' } 
          : t
      ));
    }
    
    // Hapus dari antrean
    setAntreanVerifikasi(prev => prev.filter(item => item.id !== id));
    setShowVerifikasiModal(false);
    setVerifikasiTarget(null);
  };

  const handleDetailClick = (tenant) => {
    setSelectedTenant(tenant);
  };

  // Jika ada tenant terpilih, tampilkan DetailKeuanganTenant
  if (selectedTenant) {
    return (
      <DetailKeuanganTenant 
        tenant={selectedTenant}
        onBack={() => setSelectedTenant(null)}
        onUpdateTenant={(updated) => {
          setTenantData(prev => prev.map(t => t.id === updated.id ? updated : t));
          setSelectedTenant(updated);
        }}
      />
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      'Lunas': { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Lunas', clickable: false },
      'Belum Bayar': { bg: 'var(--red-100)', color: 'var(--red)', label: 'Belum Bayar', clickable: false },
      'Menunggu Verifikasi': { bg: 'var(--orange-bg)', color: 'var(--orange)', label: 'Menunggu Verifikasi', clickable: true }
    };
    return styles[status] || styles['Belum Bayar'];
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Panel Kendali Admin Plaza</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Ringkasan status pembayaran, verifikasi bukti transfer, dan data keuangan 250 tenant aktif.
        </p>
      </div>

      {/* Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Tenant Aktif</span>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>{tenantData.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Menunggu Verifikasi</span>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--orange)' }}>{antreanVerifikasi.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Dana Terkumpul (Bulan Ini)</span>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '10px', color: 'var(--green)' }}>Rp 142.500.000</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          placeholder="Cari nama tenant atau nomor kios..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '260px' }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: '180px', height: '44px' }}
        >
          <option value="Semua">Semua Status</option>
          <option value="Lunas">Lunas</option>
          <option value="Belum Bayar">Belum Bayar</option>
          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
        </select>
      </div>

      {/* Tabel */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Nama Tenant</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>No. Kios</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Jenis Usaha</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Nilai Tunggakan AR</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Status Pembayaran</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
                  Data tenant tidak ditemukan.
                </td>
              </tr>
            ) : (
              filteredTenants.map((tenant, index) => {
                const badge = getStatusBadge(tenant.statusPembayaran);
                return (
                  <tr key={tenant.id} style={{ 
                    borderBottom: '2px solid var(--border)',
                    backgroundColor: '#ffffff'
                  }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{tenant.nama}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>{tenant.kios}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{tenant.usaha}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: tenant.tunggakan !== 'Rp 0' ? 'var(--orange)' : 'var(--text)' }}>
                      {tenant.tunggakan}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        onClick={() => {
                          if (badge.clickable) {
                            handleOpenVerifikasi(tenant);
                          }
                        }}
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: badge.clickable ? 'pointer' : 'default',
                          display: 'inline-block',
                          border: badge.clickable ? '2px solid var(--orange)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (badge.clickable) {
                            e.target.style.boxShadow = '0 2px 8px rgba(192,92,0,0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (badge.clickable) {
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDetailClick(tenant)}
                        style={{ 
                          backgroundColor: 'var(--warm-gray)', 
                          color: 'var(--text)', 
                          padding: '6px 12px', 
                          fontSize: '13px',
                          fontWeight: '600',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Verifikasi */}
      {showVerifikasiModal && verifikasiTarget && (
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
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                Verifikasi Bukti Transfer
              </h3>
              <button
                onClick={() => { setShowVerifikasiModal(false); setVerifikasiTarget(null); }}
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

            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ color: 'var(--text-3)' }}>Tenant:</span> <strong>{verifikasiTarget.tenant.nama} ({verifikasiTarget.tenant.kios})</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Tagihan:</span> <strong>{verifikasiTarget.antrean.tagihan}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Nominal:</span> <strong>{verifikasiTarget.antrean.nominal}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Metode:</span> <strong>{verifikasiTarget.antrean.metode}</strong></div>
              <div><span style={{ color: 'var(--text-3)' }}>Waktu Kirim:</span> <strong>{verifikasiTarget.antrean.waktu}</strong></div>
            </div>

            <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px', margin: '16px 0' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                [Simulasi Lampiran Bukti_Transfer_{verifikasiTarget.antrean.id}.jpg]
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleProsesVerifikasi(verifikasiTarget.antrean.id, 'konfirmasi')}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--green)',
                  color: '#ffffff',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                Konfirmasi Lunas
              </button>
              <button
                onClick={() => handleProsesVerifikasi(verifikasiTarget.antrean.id, 'tolak')}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--warm-gray)',
                  color: 'var(--red)',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                Tolak Bukti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;