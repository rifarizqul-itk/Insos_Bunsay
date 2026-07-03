import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useApi } from '../../hooks/useApi';
import { getAdminKios, createTenant } from '../../api/admin';

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
        <input type="text" placeholder="Cari nomor kios atau nama tenant..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 2, minWidth: '240px' }} />
        <select value={filterLantai} onChange={(e) => setFilterLantai(e.target.value)} style={{ flex: 1, minWidth: '140px' }}>
          <option value="Semua">Semua Lantai</option>
          <option value="Lt. 1">Lantai 1</option>
          <option value="Lt. 2">Lantai 2</option>
          <option value="Lt. 3">Lantai 3</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ flex: 1, minWidth: '160px' }}>
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
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Lantai</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>No. Kios</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Status</th>
              {isAdmin && <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Nama Pemilik</th>}
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Jenis Usaha</th>
              {isAdmin && <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Catatan</th>}
              {isAdmin && <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filteredKios.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>Data unit kios tidak ditemukan.</td></tr>
            ) : (
              filteredKios.map((kios, index) => (
                <tr key={kios.id} style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#ffffff' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>{kios.lantai}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '800', color: 'var(--text)' }}>{kios.nomorKios}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      backgroundColor: kios.statusKios === 'Terisi' ? 'var(--green-bg)' : kios.statusKios === 'Kosong' ? 'var(--red-100)' : 'var(--orange-bg)', 
                      color: kios.statusKios === 'Terisi' ? 'var(--green)' : kios.statusKios === 'Kosong' ? 'var(--red)' : 'var(--orange)', 
                      padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '12px'
                    }}>
                      {kios.statusKios}
                    </span>
                  </td>
                  {isAdmin && <td style={{ padding: '14px 16px', fontWeight: '600' }}>{kios.tenant}</td>}
                  <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{kios.usaha}</td>
                  {isAdmin && <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-2)' }}>{kios.catatan}</td>}
                  {isAdmin && (
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button onClick={() => handleDetailClick(kios)} style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '6px 12px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Detail</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showTambahModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="page-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '28px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Daftarkan Tenant Baru</h3>
              <button onClick={() => setShowTambahModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-3)', padding: '4px' }}>✕</button>
            </div>
            <form onSubmit={handleTambahTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nama Lengkap</label>
                <input type="text" placeholder="Nama pemilik kios" value={formTenant.nama} onChange={(e) => setFormTenant(prev => ({ ...prev, nama: e.target.value }))} style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nomor Kios</label>
                <input type="text" placeholder="Contoh: B-1001" value={formTenant.kios} onChange={(e) => setFormTenant(prev => ({ ...prev, kios: e.target.value }))} style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Email</label>
                <input type="email" placeholder="email@tenant.com" value={formTenant.email} onChange={(e) => setFormTenant(prev => ({ ...prev, email: e.target.value }))} style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Usaha</label>
                <input type="text" placeholder="Contoh: Kerajinan, Fashion" value={formTenant.usaha} onChange={(e) => setFormTenant(prev => ({ ...prev, usaha: e.target.value }))} style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} required />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-3)', backgroundColor: 'var(--warm-gray)', padding: '12px', borderRadius: '6px' }}>
                <strong>Informasi Akun:</strong> Username dan password akan di-generate otomatis dan dikirim ke email tenant.
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowTambahModal(false)} style={{ flex: 1, backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '12px', fontSize: '14px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, backgroundColor: isSubmitting ? 'var(--text-3)' : 'var(--red)', color: '#ffffff', padding: '12px', fontSize: '14px', fontWeight: '700', border: 'none', borderRadius: 'var(--radius-md)', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default KetersediaanKios;
