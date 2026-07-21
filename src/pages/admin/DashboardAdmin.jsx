import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionDomain } from '../../context/TransactionContext';
import { useUI } from '../../context/UIContext';
import { useAdminTenants } from '../../hooks/useAdmin';
import DetailKeuanganTenant from './DetailKeuanganTenant';
import Modal from '../../components/ui/Modal';

function DashboardAdmin() {
  const navigate = useNavigate();
  const { antrean, verifyTransaction } = useTransactionDomain();
  const { addToast } = useUI();
  const { data: tenants, loading, error, refetch } = useAdminTenants();


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

  const handleProsesVerifikasi = async (id, status) => {
    const statusFinal = status === 'konfirmasi' ? 'Lunas' : 'Tertolak';
    const alasan = status === 'konfirmasi' ? null : 'Bukti transfer tidak valid';
    const item = antrean.find(a => a.id === id);
    if (!item) return;

    try {
      const result = await verifyTransaction(id, statusFinal, alasan);
      if (result && result.success) {
        addToast(result.message || `Pembayaran ${id} berhasil di-${status === 'konfirmasi' ? 'setujui' : 'tolak'}.`, status === 'konfirmasi' ? 'success' : 'error');
      } else {
        addToast(result?.message || 'Gagal memverifikasi transaksi.', 'error');
      }
    } catch (_) {
      addToast('Terjadi kesalahan saat memproses verifikasi.', 'error');
    }

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
    return (
      <div className="page-fade-in flex flex-col gap-8">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-warm-gray/70 animate-pulse rounded-md"></div>
          <div className="h-5 w-80 bg-warm-gray/50 animate-pulse rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-28 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-28 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
        </div>
        <div className="h-64 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
      </div>
    );
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
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <span className="label-micro">Menunggu Verifikasi</span>
          <div className="font-tabular-nums" style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--orange)' }}>{antrean.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <span className="label-micro">Dana Terkumpul (Bulan Ini)</span>
          <div className="font-tabular-nums" style={{ fontSize: '24px', fontWeight: '800', marginTop: '10px', color: 'var(--green)' }}>Rp 142.500.000</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" className="w-full md:flex-1" placeholder="Cari nama tenant atau nomor kios..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ minWidth: '200px' }} />
        <select value={statusFilter} className="w-full md:w-auto" onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: '180px', height: '44px' }}>
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
              <th style={{ padding: '8px 12px', fontWeight: '700', fontSize: '14px' }}>Nama Tenant</th>
              <th style={{ padding: '8px 12px', fontWeight: '700', fontSize: '14px' }}>No. Kios</th>
              <th style={{ padding: '8px 12px', fontWeight: '700', fontSize: '14px' }}>Jenis Usaha</th>
              <th style={{ padding: '8px 12px', fontWeight: '700', fontSize: '14px' }}>Tunggakan</th>
              <th style={{ padding: '8px 12px', fontWeight: '700', fontSize: '14px' }}>Status Bulan Ini</th>
              <th style={{ padding: '8px 12px', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>Aksi</th>
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
                    <td data-label="Nama Tenant" style={{ padding: '8px 12px', fontWeight: '600' }}>{tenant.nama}</td>
                    <td data-label="No. Kios" className="font-tabular-nums font-bold" style={{ padding: '8px 12px' }}>{tenant.kios}</td>
                    <td data-label="Jenis Usaha" style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{tenant.usaha}</td>
                    <td data-label="Tunggakan" className="font-tabular-nums" style={{ padding: '8px 12px', fontWeight: '600', color: tenant.tunggakan > 0 ? 'var(--orange)' : 'var(--text)' }}>
                      Rp {tenant.tunggakan.toLocaleString('id-ID')}
                    </td>
                    <td data-label="Status Bulan Ini" style={{ padding: '8px 12px' }}>
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
                    <td data-label="Aksi" style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDetailClick(tenant)} 
                        className="table-action-btn"
                        style={{ 
                          backgroundColor: 'var(--warm-gray)', 
                          color: 'var(--text)', 
                          padding: '10px 16px', 
                          minHeight: '44px',
                          fontSize: '13px', 
                          fontWeight: '600', 
                          border: '1px solid var(--border)', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
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

      <Modal
        isOpen={showVerifikasiModal}
        onClose={() => { setShowVerifikasiModal(false); setVerifikasiTarget(null); }}
        title="Verifikasi Bukti Transfer"
        size="md"
        footer={
          <>
            <button 
              onClick={() => handleProsesVerifikasi(verifikasiTarget.antrean.id, 'tolak')} 
              style={{ 
                backgroundColor: 'var(--warm-gray)', 
                color: 'var(--red)', 
                padding: '0 24px', 
                fontSize: '14px', 
                fontWeight: '600', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Tolak Bukti
            </button>
            <button 
              onClick={() => handleProsesVerifikasi(verifikasiTarget.antrean.id, 'konfirmasi')} 
              style={{ 
                backgroundColor: 'var(--green)', 
                color: '#ffffff', 
                padding: '0 24px', 
                fontSize: '14px', 
                fontWeight: '700', 
                border: 'none', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Konfirmasi Lunas
            </button>
          </>
        }
      >
        {verifikasiTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ color: 'var(--text-2)' }}>Tenant:</span> <strong>{verifikasiTarget.tenant.nama} ({verifikasiTarget.tenant.kios})</strong></div>
              <div><span style={{ color: 'var(--text-2)' }}>Tagihan:</span> <strong>{verifikasiTarget.antrean.tagihan}</strong></div>
              <div><span style={{ color: 'var(--text-2)' }}>Nominal:</span> <strong>{verifikasiTarget.antrean.nominal}</strong></div>
              <div><span style={{ color: 'var(--text-2)' }}>Metode:</span> <strong>{verifikasiTarget.antrean.metode}</strong></div>
              <div><span style={{ color: 'var(--text-2)' }}>Waktu:</span> <strong>{verifikasiTarget.antrean.waktu}</strong></div>
            </div>
            <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--warm-gray)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>[Simulasi Lampiran Bukti_Transfer_{verifikasiTarget.antrean.id}.jpg]</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DashboardAdmin;
