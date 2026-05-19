import React, { useState } from 'react';

function KetersediaanKios({ isAdmin = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLantai, setFilterLantai] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Contoh sampel riil mengikuti aturan pengecualian data ambigu di dokumen handover
  const masterKiosData = [
    { id: 1, lantai: 'Lt. 1', nomorKios: 'B-1001', status: 'Terisi', tenant: 'Hj. Yuliana', usaha: 'Kerajinan', catatan: 'Sertifikat diambil BPD Syariah' },
    { id: 2, lantai: 'Lt. 1', nomorKios: 'B-1004', status: 'Kosong', tenant: '—', usaha: '—', catatan: 'Unit tersedia' },
    { id: 3, lantai: 'Lt. 1', nomorKios: 'B-1013', status: 'Perlu Validasi', tenant: '(ambigu)', usaha: '—', catatan: 'Kios dalam proses pengalihan kepemilikan' },
    { id: 4, lantai: 'Lt. 2', nomorKios: 'A-2005', status: 'Terisi', tenant: 'Eva Tauresea', usaha: 'Fashion', catatan: 'Data lengkap terverifikasi' },
    { id: 5, lantai: 'Lt. 3', nomorKios: 'C-3002', status: 'Perlu Validasi', tenant: '—', usaha: '—', catatan: 'Belum dibuatkan sertifikat / unit sewa' }
  ];

  // Logika penyaringan multi-kriteria
  const filteredKios = masterKiosData.filter(kios => {
    const matchesSearch = kios.nomorKios.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          kios.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLantai = filterLantai === 'Semua' || kios.lantai === filterLantai;
    const matchesStatus = filterStatus === 'Semua' || kios.status === filterStatus;

    return matchesSearch && matchesLantai && matchesStatus;
  });

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800' }}>Tabel Pemetaan Ketersediaan Kios</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          {isAdmin 
            ? 'Panel internal pengelola untuk memantau utilitas unit, data legalitas sertifikat, dan mendeteksi baris klaim ambigu.' 
            : 'Informasi direktori resmi unit kios kosong yang tersedia untuk disewa oleh calon pedagang baru.'}
        </p>
      </div>

      {/* Bar Filter & Pencarian Target Minimal 44px */}
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
          <option value="Terisi">Status Terisi</option>
          <option value="Kosong">Status Kosong</option>
          <option value="Perlu Validasi">Perlu Validasi Manual</option>
        </select>
      </div>

      {/* Kontainer Tabel Flat Design */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Lantai / Posisi</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>No. Kios</th>
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Status Unit</th>
              {isAdmin && <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Nama Pemilik (Admin)</th>}
              <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Jenis Usaha</th>
              {isAdmin && <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700' }}>Catatan Internal Arsip</th>}
            </tr>
          </thead>
          <tbody>
            {filteredKios.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
                  Data unit kios berdasarkan kriteria filter tidak ditemukan.
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
                      backgroundColor: kios.status === 'Terisi' ? 'var(--green-bg)' : kios.status === 'Kosong' ? 'var(--red-100)' : 'var(--orange-bg)', 
                      color: kios.status === 'Terisi' ? 'var(--green)' : kios.status === 'Kosong' ? 'var(--red)' : 'var(--orange)', 
                      padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '12px'
                    }}>
                      {kios.status === 'Perlu Validasi' ? 'Perlu Validasi Manual' : kios.status}
                    </span>
                  </td>
                  {isAdmin && <td style={{ padding: '14px 16px', fontWeight: '600' }}>{kios.tenant}</td>}
                  <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{kios.usaha}</td>
                  {isAdmin && <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-2)' }}>{kios.catatan}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KetersediaanKios;