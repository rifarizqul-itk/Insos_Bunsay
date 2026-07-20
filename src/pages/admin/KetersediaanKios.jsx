import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useApi } from '../../hooks/useApi';
import { getAdminKios, createTenant } from '../../api/admin';
import Modal from '../../components/ui/Modal';

function KetersediaanKios({ isAdmin = false }) {
  const navigate = useNavigate();
  const { addToast } = useUI();
  const { data: kiosData, loading, error, refetch } = useApi(getAdminKios, [], true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLantai, setFilterLantai] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [formTenant, setFormTenant] = useState({ nama: '', kios: '', email: '', usaha: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      await createTenant(formTenant);
      addToast(`Tenant ${formTenant.nama} berhasil didaftarkan!`, 'success');
      setShowTambahModal(false);
      setFormTenant({ nama: '', kios: '', email: '', usaha: '' });
      refetch();
    } catch (_) {
      addToast('Gagal mendaftarkan tenant. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>Memuat data kios...</div>;
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
              padding: '0 24px',
              fontSize: '14px',
              fontWeight: '700',
              height: '44px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            + Tambah Tenant Baru
          </button>
        )}
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <input type="text" className="w-full md:flex-2" placeholder="Cari nomor kios atau nama tenant..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ minWidth: '200px' }} />
        <select value={filterLantai} className="w-full md:w-auto" onChange={(e) => setFilterLantai(e.target.value)} style={{ minWidth: '140px', height: '44px' }}>
          <option value="Semua">Semua Lantai</option>
          <option value="Lt. 1">Lantai 1</option>
          <option value="Lt. 2">Lantai 2</option>
          <option value="Lt. 3">Lantai 3</option>
        </select>
        <select value={filterStatus} className="w-full md:w-auto" onChange={(e) => setFilterStatus(e.target.value)} style={{ minWidth: '160px', height: '44px' }}>
          <option value="Semua">Semua Status</option>
          <option value="Terisi">Terisi</option>
          <option value="Kosong">Kosong</option>
          <option value="Perlu Validasi">Perlu Validasi</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
              <th style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700' }}>Lantai</th>
              <th style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700' }}>No. Kios</th>
              <th style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700' }}>Status</th>
              {isAdmin && <th style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700' }}>Nama Pemilik</th>}
              <th style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700' }}>Jenis Usaha</th>
              {isAdmin && <th style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700' }}>Catatan</th>}
              {isAdmin && <th style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filteredKios.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>Data unit kios tidak ditemukan.</td></tr>
            ) : (
              filteredKios.map((kios, index) => (
                <tr key={kios.id} style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#ffffff' }}>
                  <td data-label="Lantai" style={{ padding: '8px 12px', fontWeight: '600' }}>{kios.lantai}</td>
                  <td data-label="No. Kios" style={{ padding: '8px 12px', fontWeight: '800', color: 'var(--text)', fontFamily: 'monospace' }}>{kios.nomorKios}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="tambah-tenant-nama" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nama Lengkap</label>
            <input 
              id="tambah-tenant-nama" 
              type="text" 
              placeholder="Nama pemilik kios" 
              value={formTenant.nama} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, nama: e.target.value }))} 
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} 
              required 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="tambah-tenant-kios" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nomor Kios</label>
            <input 
              id="tambah-tenant-kios" 
              type="text" 
              placeholder="Contoh: B-1001" 
              value={formTenant.kios} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, kios: e.target.value }))} 
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} 
              required 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="tambah-tenant-email" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Email</label>
            <input 
              id="tambah-tenant-email" 
              type="email" 
              placeholder="email@tenant.com" 
              value={formTenant.email} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, email: e.target.value }))} 
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} 
              required 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="tambah-tenant-usaha" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Usaha</label>
            <input 
              id="tambah-tenant-usaha" 
              type="text" 
              placeholder="Contoh: Kerajinan, Fashion" 
              value={formTenant.usaha} 
              onChange={(e) => setFormTenant(prev => ({ ...prev, usaha: e.target.value }))} 
              style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} 
              required 
            />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', backgroundColor: 'var(--warm-gray)', padding: '12px', borderRadius: '6px' }}>
            <strong>Informasi Akun:</strong> Username dan password akan di-generate otomatis dan dikirim ke email tenant.
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KetersediaanKios;
