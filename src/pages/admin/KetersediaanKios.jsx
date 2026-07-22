import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useAdminKios, useTenantRegistration } from '../../hooks/useAdmin';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';

function KetersediaanKios({ isAdmin = false }) {
  const navigate = useNavigate();
  const { addToast } = useUI();
  const { data: kiosData, loading, error, refetch } = useAdminKios();
  const { registerTenant } = useTenantRegistration();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLantai, setFilterLantai] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [formTenant, setFormTenant] = useState({ nama: '', kios: '', email: '', usaha: '' });
  const [fieldError, setFieldError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableHeaders = [
    { label: 'Lantai' },
    { label: 'No. Kios' },
    { label: 'Status' },
    ...(isAdmin ? [{ label: 'Nama Pemilik' }] : []),
    { label: 'Jenis Usaha' },
    ...(isAdmin ? [{ label: 'Catatan' }] : []),
    ...(isAdmin ? [{ label: 'Aksi', align: 'center' }] : []),
  ];

  const filteredKios = (kiosData || []).filter(kios => {
    const matchesSearch = kios.nomorKios.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          kios.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLantai = filterLantai === 'Semua' || kios.lantai === filterLantai;
    const matchesStatus = filterStatus === 'Semua' || kios.statusKios === filterStatus;
    return matchesSearch && matchesLantai && matchesStatus;
  });

  const handleDetailClick = (kios) => {
    navigate('/admin/detail-administrasi', { state: { kiosId: kios.id } });
  };

  const handleTambahTenant = async (e) => {
    e.preventDefault();
    setFieldError(null);
    setIsSubmitting(true);
    try {
      const result = await registerTenant(formTenant);
      if (result && result.success) {
        addToast(result.message || `Tenant ${formTenant.nama} berhasil didaftarkan!`, 'success');
        setShowTambahModal(false);
        setFormTenant({ nama: '', kios: '', email: '', usaha: '' });
        refetch();
      } else if (result && !result.success) {
        addToast(result.message || 'Gagal mendaftarkan tenant.', 'error');
        if (result.field) {
          setFieldError({ field: result.field, message: result.message });
        }
      }
    } catch (_) {
      addToast('Gagal mendaftarkan tenant. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="page-fade-in flex flex-col gap-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-warm-gray/70 animate-pulse rounded-md"></div>
            <div className="h-5 w-80 bg-warm-gray/50 animate-pulse rounded-md"></div>
          </div>
          <div className="h-11 w-44 bg-warm-gray/60 animate-pulse rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-24 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-24 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
          <div className="h-24 bg-warm-gray/40 animate-pulse rounded-xl border border-border"></div>
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

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Tabel Pemetaan Ketersediaan Kios</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
            {isAdmin 
              ? 'Panel internal pengelola untuk memantau utilitas unit dan data legalitas sertifikat.'
              : 'Informasi direktori resmi unit kios kosong yang tersedia untuk disewa.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowTambahModal(true)}
            style={{
              backgroundColor: 'var(--red)',
              color: '#ffffff',
              padding: '0 20px',
              fontSize: '14px',
              fontWeight: '700',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              height: '44px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Icon icon="ph:plus-bold" width="18" height="18" />
            <span>Daftarkan Tenant Baru</span>
          </button>
        )}
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', boxShadow: 'var(--shadow-card)' }}>
        <input 
          type="text" 
          placeholder="Cari nomor kios atau nama tenant..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          aria-label="Cari nomor kios atau nama tenant"
          style={{ height: '44px', padding: '0 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '15px', minWidth: '240px', flex: 1 }} 
        />
        <select value={filterLantai} onChange={(e) => setFilterLantai(e.target.value)} aria-label="Filter berdasarkan lantai" style={{ height: '44px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '15px', fontWeight: '600', backgroundColor: '#ffffff' }}>
          <option value="Semua">Semua Lantai</option>
          <option value="Lt. 1">Lantai 1</option>
          <option value="Lt. 2">Lantai 2</option>
          <option value="Lt. 3">Lantai 3</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter berdasarkan status ketersediaan kios" style={{ height: '44px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '15px', fontWeight: '600', backgroundColor: '#ffffff' }}>
          <option value="Semua">Semua Status</option>
          <option value="Terisi">Terisi</option>
          <option value="Kosong">Kosong</option>
          <option value="Perlu Validasi">Perlu Validasi</option>
        </select>
      </div>

      <Table
        caption="Tabel Pemetaan Utilitas & Ketersediaan Kios Plaza Kebun Sayur"
        ariaLabel="Tabel Pemetaan Kios Pengelola Plaza"
        headers={tableHeaders}
        isEmpty={filteredKios.length === 0}
        emptyMessage="Data unit kios tidak ditemukan."
        colSpan={isAdmin ? 7 : 4}
      >
        {filteredKios.map((kios) => (
          <tr key={kios.id} style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#ffffff' }}>
            <td data-label="Lantai" style={{ padding: '8px 12px', fontWeight: '600' }}>{kios.lantai}</td>
            <th scope="row" data-label="No. Kios" className="font-tabular-nums font-bold" style={{ padding: '8px 12px', color: 'var(--text)', textAlign: 'left' }}>{kios.nomorKios}</th>
            <td data-label="Status" style={{ padding: '8px 12px' }}>
              <span style={{ 
                 backgroundColor: kios.statusKios === 'Terisi' ? 'var(--green-bg)' : kios.statusKios === 'Kosong' ? 'var(--red-100)' : 'var(--orange-bg)', 
                 color: kios.statusKios === 'Terisi' ? 'var(--green)' : kios.statusKios === 'Kosong' ? 'var(--red)' : 'var(--orange)', 
                 padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '12px'
              }}>
                {kios.statusKios}
              </span>
            </td>
            {isAdmin && <td data-label="Nama Pemilik" style={{ padding: '8px 12px', fontWeight: '600' }}>{kios.tenant}</td>}
            <td data-label="Jenis Usaha" style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{kios.usaha}</td>
            {isAdmin && <td data-label="Catatan" style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-2)' }}>{kios.catatan}</td>}
            {isAdmin && (
              <td data-label="Aksi" style={{ padding: '14px 16px', textAlign: 'center' }}>
                <button 
                  onClick={() => handleDetailClick(kios)} 
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
            )}
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={showTambahModal}
        onClose={() => setShowTambahModal(false)}
        title="Daftarkan Tenant Baru"
        size="md"
        footer={
          <>
            <button 
              type="button" 
              onClick={() => setShowTambahModal(false)} 
              style={{ 
                flex: 1, 
                backgroundColor: 'var(--warm-gray)', 
                color: 'var(--text)', 
                padding: '12px', 
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
              Batal
            </button>
            <button 
              type="button" 
              onClick={handleTambahTenant} 
              disabled={isSubmitting} 
              style={{ 
                flex: 1, 
                backgroundColor: isSubmitting ? 'var(--disabled-bg)' : 'var(--red)', 
                color: '#ffffff', 
                padding: '12px', 
                fontSize: '14px', 
                fontWeight: '700', 
                border: 'none', 
                borderRadius: 'var(--radius-md)', 
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tenant'}
            </button>
          </>
        }
      >
        <form onSubmit={handleTambahTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Nama Lengkap" id="tambah-tenant-nama" required error={fieldError?.field === 'nama' ? fieldError.message : undefined}>
            <input 
              type="text" 
              placeholder="Nama pemilik kios" 
              value={formTenant.nama} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, nama: e.target.value }))} 
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} 
            />
          </FormField>

          <FormField label="Nomor Kios" id="tambah-tenant-kios" required error={fieldError?.field === 'kios' ? fieldError.message : undefined}>
            <input 
              type="text" 
              placeholder="Contoh: B-1001" 
              value={formTenant.kios} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, kios: e.target.value }))} 
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} 
            />
          </FormField>

          <FormField label="Email" id="tambah-tenant-email" required error={fieldError?.field === 'email' ? fieldError.message : undefined}>
            <input 
              type="email" 
              placeholder="email@tenant.com" 
              value={formTenant.email} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, email: e.target.value }))} 
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} 
            />
          </FormField>

          <FormField label="Jenis Usaha" id="tambah-tenant-usaha" required error={fieldError?.field === 'usaha' ? fieldError.message : undefined}>
            <input 
              type="text" 
              placeholder="Contoh: Kerajinan, Fashion" 
              value={formTenant.usaha} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, usaha: e.target.value }))} 
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} 
            />
          </FormField>

          <div style={{ fontSize: '13px', color: 'var(--text-3)', backgroundColor: 'var(--warm-gray)', padding: '12px', borderRadius: '6px' }}>
            <strong>Informasi Akun:</strong> Username dan password akan di-generate otomatis dan dikirim ke email tenant.
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KetersediaanKios;
