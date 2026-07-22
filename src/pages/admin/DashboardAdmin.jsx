import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionDomain } from '../../context/TransactionContext';
import { useUI } from '../../context/UIContext';
import { useAdminTenants } from '../../hooks/useAdmin';
import DetailKeuanganTenant from './DetailKeuanganTenant';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

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

  const tableHeaders = [
    { label: 'Nama Tenant' },
    { label: 'No. Kios' },
    { label: 'Jenis Usaha' },
    { label: 'Tunggakan' },
    { label: 'Status Bulan Ini' },
    { label: 'Aksi', align: 'center' },
  ];

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
    return styles[status] || { bg: 'var(--warm-gray)', color: 'var(--text-2)', label: status, clickable: false };
  };

  const totalTenant = (tenants || []).length;
  const belumBayarCount = (tenants || []).filter(t => t.statusPembayaran === 'Belum Bayar').length;

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)' }}>Dashboard Pengelola Plaza</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>Ringkasan statistik real-time dan pemantauan administrasi pembayaran kios.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <span className="label-micro">Total Kios Terisi</span>
          <div className="font-tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--red)', marginTop: '8px' }}>{totalTenant}</div>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Aktif beroperasi di Plaza</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <span className="label-micro">Menunggu Verifikasi</span>
          <div className="font-tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--orange)', marginTop: '8px' }}>{antrean.length}</div>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Memerlukan konfirmasi admin</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <span className="label-micro">Belum Bayar Bulan Ini</span>
          <div className="font-tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--red)', marginTop: '8px' }}>{belumBayarCount}</div>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Memiliki tagihan aktif</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>Daftar Administrasi Kios</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Cari nama atau no kios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari nama tenant atau nomor kios"
            style={{ height: '44px', padding: '0 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '15px', backgroundColor: '#ffffff', width: '220px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status pembayaran bulan ini"
            style={{ height: '44px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '15px', fontWeight: '600', backgroundColor: '#ffffff' }}
          >
            <option value="Semua">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Belum Bayar">Belum Bayar</option>
          </select>
        </div>
      </div>

      <Table
        caption="Daftar Status Pembayaran Tenant Bulan Ini"
        ariaLabel="Tabel Status Pembayaran Kios Plaza Kebun Sayur"
        headers={tableHeaders}
        isEmpty={filteredTenants.length === 0}
        emptyMessage="Data tenant tidak ditemukan."
        colSpan={6}
      >
        {filteredTenants.map((tenant) => {
          const badge = getStatusBadge(tenant.statusPembayaran);
          return (
            <tr key={tenant.id} style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#ffffff' }}>
              <th scope="row" data-label="Nama Tenant" style={{ padding: '8px 12px', fontWeight: '600', textAlign: 'left' }}>{tenant.nama}</th>
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
        })}
      </Table>

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
