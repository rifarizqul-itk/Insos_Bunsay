import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../../context/TransactionContext';
import { useUI } from '../../context/UIContext';
import { useApi } from '../../hooks/useApi';
import { getAdminTenants } from '../../api/admin';
import DetailKeuanganTenant from './DetailKeuanganTenant';

function DashboardAdmin() {
  const navigate = useNavigate();
  const { antrean, prosesVerifikasi } = useTransactions();
  const { addToast } = useUI();
  const { data: tenants, loading, error, refetch } = useApi(getAdminTenants, [], true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showVerifikasiModal, setShowVerifikasiModal] = useState(false);
  const [verifikasiTarget, setVerifikasiTarget] = useState(null);

  const filteredTenants = (tenants || []).filter(tenant => {
    const matchesSearch = tenant.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.kios.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'Semua') return matchesSearch;
    return matchesSearch && tenant.statusPembayaran === statusFilter;
  });

  const handleOpenVerifikasi = (tenant) => {
    const antreanItem = antrean.find(a => a.nama === tenant.nama);
    if (!antreanItem) {
      addToast('Tidak ada bukti transfer yang menunggu verifikasi untuk tenant ini.', 'info');
      return;
    }
    setVerifikasiTarget({ tenant, antrean: antreanItem });
    setShowVerifikasiModal(true);
  };

  const handleProsesVerifikasi = (id, status) => {
    const statusFinal = status === 'konfirmasi' ? 'Lunas' : 'Tertolak';
    const alasan = status === 'konfirmasi' ? null : 'Bukti transfer tidak valid';
    const item = antrean.find(a => a.id === id);
    if (!item) return;

    prosesVerifikasi({
      ...item,
      status: statusFinal,
      alasan
    });
    addToast(`Pembayaran ${id} berhasil di-${status === 'konfirmasi' ? 'setujui' : 'tolak'}.`, status === 'konfirmasi' ? 'success' : 'error');
    setShowVerifikasiModal(false);
    setVerifikasiTarget(null);
    refetch();
  };

  const handleDetailClick = (tenant) => {
    setSelectedTenant(tenant);
  };

  if (selectedTenant) {
    return <DetailKeuanganTenant tenant={selectedTenant} onBack={() => setSelectedTenant(null)} onUpdateTenant={() => {}} />;
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>Memuat data tenant...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--red)' }}>Gagal memuat data.</p>
        <button onClick={refetch} style={{ marginTop: '16px', backgroundColor: 'var(--red)', color: '#fff', padding: '0 24px', height: '44px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' }}>Muat Ulang</button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      'Lunas': { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Lunas (Bulan Ini)', clickable: false },
      'Belum Bayar': { bg: 'var(--red-100)', color: 'var(--red)', label: 'Belum Bayar', clickable: false },
      'Menunggu Verifikasi': { bg: 'var(--orange-bg)', color: 'var(--orange)', label: 'Menunggu Verifikasi', clickable: true }
    };
    return styles[status] || styles['Belum Bayar'];
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Panel Kendali Admin Plaza</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Ringkasan status pembayaran dan verifikasi bukti transfer.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Total Tenant Aktif</span>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>{tenants?.length || 0}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Menunggu Verifikasi</span>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--orange)' }}>{antrean.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-2)', textTransform: 'uppercase' }}>Dana Terkumpul (Bulan Ini)</span>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '10px', color: 'var(--green)' }}>Rp 142.500.000</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="Cari nama tenant atau nomor kios..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, minWidth: '260px' }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: '180px', height: '44px' }}>
          <option value="Semua">Semua Status</option>
          <option value="Lunas">Lunas</option>
          <option value="Belum Bayar">Belum Bayar</option>
          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Nama Tenant</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>No. Kios</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Jenis Usaha</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Tunggakan</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Status Bulan Ini</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>Data tenant tidak ditemukan.</td></tr>
            ) : (
              filteredTenants.map((tenant, index) => {
                const badge = getStatusBadge(tenant.statusPembayaran);
                return (
                  <tr key={tenant.id} style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#ffffff' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{tenant.nama}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>{tenant.kios}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{tenant.usaha}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: tenant.tunggakan > 0 ? 'var(--orange)' : 'var(--text)' }}>
                      Rp {tenant.tunggakan.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        onClick={() => { if (badge.clickable) handleOpenVerifikasi(tenant); }}
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
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button onClick={() => handleDetailClick(tenant)} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Detail</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showVerifikasiModal && verifikasiTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="page-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Verifikasi Bukti Transfer</h3>
              <button onClick={() => { setShowVerifikasiModal(false); setVerifikasiTarget(null); }} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-3)', padding: '4px' }}>✕</button>
            </div>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ color: 'var(--text-2)' }}>Tenant:</span> <strong>{verifikasiTarget.tenant.nama} ({verifikasiTarget.tenant.kios})</strong></div>
              <div><span style={{ color: 'var(--text-2)' }}>Tagihan:</span> <strong>{verifikasiTarget.antrean.tagihan}</strong></div>
              <div><span style={{ color: 'var(--text-2)' }}>Nominal:</span> <strong>{verifikasiTarget.antrean.nominal}</strong></div>
              <div><span style={{ color: 'var(--text-2)' }}>Metode:</span> <strong>{verifikasiTarget.antrean.metode}</strong></div>
              <div><span style={{ color: 'var(--text-2)' }}>Waktu:</span> <strong>{verifikasiTarget.antrean.waktu}</strong></div>
            </div>
            <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px', margin: '16px 0' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>[Simulasi Lampiran Bukti_Transfer_{verifikasiTarget.antrean.id}.jpg]</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleProsesVerifikasi(verifikasiTarget.antrean.id, 'konfirmasi')} style={{ flex: 1, backgroundColor: 'var(--green)', color: '#ffffff', padding: '12px', fontSize: '14px', fontWeight: '700', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Konfirmasi Lunas</button>
              <button onClick={() => handleProsesVerifikasi(verifikasiTarget.antrean.id, 'tolak')} style={{ flex: 1, backgroundColor: 'var(--warm-gray)', color: 'var(--red)', padding: '12px', fontSize: '14px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Tolak Bukti</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;
