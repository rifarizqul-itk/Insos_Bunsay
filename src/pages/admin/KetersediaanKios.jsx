import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function KetersediaanKios({ isAdmin = false }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLantai, setFilterLantai] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // State untuk modal tambah tenant
  const [showTambahModal, setShowTambahModal] = useState(false);

  // Data kios (single source of truth)
  const [kiosData, setKiosData] = useState([
    { 
      id: 1, 
      lantai: 'Lt. 1', 
      nomorKios: 'B-1001', 
      statusKios: 'Terisi', 
      tenant: 'Hj. Yuliana', 
      usaha: 'Kerajinan', 
      catatan: 'Sertifikat diambil BPD Syariah',
      detailAdministrasi: {
        ktp: '175102.460772.0005',
        alamat: 'Jl. Adil Makmur No. 42 Balikpapan',
        kontak: '0812-5564-593',
        sp: '423 / 5 Mei 2008',
        ppjb: '423 / 5 Mei 2008',
        bast: '1 Januari 2010',
        ukuran: '6 Meter Persegi',
        sertifikat: '422 / 12 April 2012',
        keterangan: 'Sertifikat diambil BPD Syariah'
      }
    },
    { 
      id: 2, 
      lantai: 'Lt. 1', 
      nomorKios: 'B-1004', 
      statusKios: 'Kosong', 
      tenant: '—', 
      usaha: '—', 
      catatan: 'Unit tersedia',
      detailAdministrasi: null
    },
    { 
      id: 3, 
      lantai: 'Lt. 1', 
      nomorKios: 'B-1013', 
      statusKios: 'Perlu Validasi', 
      tenant: '(ambigu)', 
      usaha: '—', 
      catatan: 'Kios dalam proses pengalihan kepemilikan',
      detailAdministrasi: null
    },
    { 
      id: 4, 
      lantai: 'Lt. 2', 
      nomorKios: 'A-2005', 
      statusKios: 'Terisi', 
      tenant: 'Eva Tauresea', 
      usaha: 'Fashion', 
      catatan: 'Data lengkap terverifikasi',
      detailAdministrasi: {
        ktp: '175102.889712.0001',
        alamat: 'Jl. Letjen Suprapto No. 12 Balikpapan',
        kontak: '0813-4455-6677',
        sp: '112 / 10 Juni 2011',
        ppjb: '112 / 10 Juni 2011',
        bast: '15 Agustus 2011',
        ukuran: '12 Meter Persegi',
        sertifikat: 'Belum Diambil',
        keterangan: 'Menunggu konfirmasi kedatangan pemilik di kantor pengelola'
      }
    },
    { 
      id: 5, 
      lantai: 'Lt. 3', 
      nomorKios: 'C-3002', 
      statusKios: 'Perlu Validasi', 
      tenant: '—', 
      usaha: '—', 
      catatan: 'Belum dibuatkan sertifikat / unit sewa',
      detailAdministrasi: null
    }
  ]);

  const filteredKios = kiosData.filter(kios => {
    const matchesSearch = kios.nomorKios.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          kios.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLantai = filterLantai === 'Semua' || kios.lantai === filterLantai;
    const matchesStatus = filterStatus === 'Semua' || kios.statusKios === filterStatus;
    return matchesSearch && matchesLantai && matchesStatus;
  });

  const handleDetailClick = (kios) => {
    navigate('/admin/detail-administrasi', { state: { kiosId: kios.id } });
  };

  const handleTambahTenant = (e) => {
    e.preventDefault();
    // Simulasi: data dari form
    alert('Tenant baru berhasil didaftarkan! Username dan password akan dikirimkan ke email tenant.');
    setShowTambahModal(false);
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Tabel Pemetaan Ketersediaan Kios</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
            {isAdmin 
              ? 'Panel internal pengelola untuk memantau utilitas unit, data legalitas sertifikat, dan mendaftarkan tenant baru.'
              : 'Informasi direktori resmi unit kios kosong yang tersedia untuk disewa oleh calon pedagang baru.'}
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

      {/* Filter */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <input 
          type="text" 
          placeholder="Cari nomor kios atau nama tenant..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 2, minWidth: '240px' }}
        />
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

      {/* Tabel */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Lantai</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>No. Kios</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Status Kios</th>
              {isAdmin && <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Nama Pemilik</th>}
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Jenis Usaha</th>
              {isAdmin && <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Catatan</th>}
              {isAdmin && <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filteredKios.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
                  Data unit kios tidak ditemukan.
                </td>
              </tr>
            ) : (
              filteredKios.map((kios, index) => (
                <tr key={kios.id} style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--warm-gray)'
                }}>
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
                      <button
                        onClick={() => handleDetailClick(kios)}
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
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Tenant */}
      {showTambahModal && (
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
                Daftarkan Tenant Baru
              </h3>
              <button
                onClick={() => setShowTambahModal(false)}
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

            <form onSubmit={handleTambahTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nama Lengkap</label>
                <input type="text" placeholder="Nama pemilik kios" style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Nomor Kios</label>
                <input type="text" placeholder="Contoh: B-1001" style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Email</label>
                <input type="email" placeholder="email@tenant.com" style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-2)' }}>Jenis Usaha</label>
                <input type="text" placeholder="Contoh: Kerajinan, Fashion, dll." style={{ height: '44px', borderRadius: '6px', border: '1px solid var(--border)', padding: '0 12px' }} required />
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-3)', backgroundColor: 'var(--warm-gray)', padding: '12px', borderRadius: '6px' }}>
                <strong>Informasi Akun:</strong> Username dan password akan di-generate secara otomatis oleh sistem dan dikirim ke email tenant.
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
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
                  Daftarkan Tenant
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