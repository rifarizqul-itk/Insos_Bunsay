import React, { useState } from 'react';

// Ganti baris pembuka fungsi utama Anda di DashboardAdmin.jsx menjadi:
function DashboardAdmin({ onSelectTenant }) {
  // Penggunaan data sampel riil dari acuan Excel
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const tenantData = [
    { id: 1, nama: 'Hj. Yuliana', kios: 'B-1001', usaha: 'Kerajinan', gedung: 'Lunas', service: 'Lunas', tunggakan: 'Rp 13.219.998' },
    { id: 2, nama: 'Eva Tauresea', kios: 'B-1004', usaha: 'Fashion', gedung: 'Belum Bayar', service: 'Lunas', tunggakan: 'Rp 0' },
    { id: 3, nama: 'H. Ahmad', kios: 'B-1013', usaha: 'Perhiasan', gedung: 'Ada Tunggakan', service: 'Belum Bayar', tunggakan: 'Rp 5.500.000' },
    { id: 4, nama: 'Toko Kalimantan', kios: 'A-1002', usaha: 'Oleh-oleh', gedung: 'Lunas', service: 'Belum Bayar', tunggakan: 'Rp 0' }
  ];

  // Logika filter reaktif pencarian nama atau nomor kios
  const filteredTenants = tenantData.filter(tenant => {
    const matchesSearch = tenant.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tenant.kios.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'Semua') return matchesSearch;
    if (statusFilter === 'Lunas') return matchesSearch && tenant.gedung === 'Lunas';
    if (statusFilter === 'Belum Bayar') return matchesSearch && tenant.gedung === 'Belum Bayar';
    if (statusFilter === 'Menunggak') return matchesSearch && tenant.gedung === 'Ada Tunggakan';
    return matchesSearch;
  });

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Judul Panel */}
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>Panel Kendali Admin Plaza</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '4px' }}>
          Ringkasan data transaksi berjalan, verifikasi pembayaran mandiri, dan status unit 250 tenant aktif.
        </p>
      </div>

      {/* Baris Statistik Ringkasan Utama */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Tenant Aktif</span>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>250</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Menunggu Verifikasi</span>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--orange)' }}>5 Antrean</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>Dana Terkumpul (Bulan Ini)</span>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '10px', color: 'var(--green)' }}>Rp 142.500.000</div>
        </div>
      </div>

      {/* Komponen Pencarian & Filter Bar */}
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
          <option value="Semua">Semua Status Gedung</option>
          <option value="Lunas">Lunas</option>
          <option value="Belum Bayar">Belum Bayar</option>
          <option value="Menunggak">Ada Tunggakan</option>
        </select>
      </div>

      {/* Tabel Utama Berdasarkan Spesifikasi Desain Handover */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--red)', color: '#ffffff' }}>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Nama Tenant</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>No. Kios</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Jenis Usaha</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Status Gedung</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Service Charge</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px' }}>Nilai Tunggakan AR</th>
              <th style={{ padding: '14px 16px', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
                  Data tenant tidak ditemukan.
                </td>
              </tr>
            ) : (
              filteredTenants.map((tenant, index) => (
                <tr key={tenant.id} style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--warm-gray)'
                }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>{tenant.nama}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '700' }}>{tenant.kios}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{tenant.usaha}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      backgroundColor: tenant.gedung === 'Lunas' ? 'var(--green-bg)' : tenant.gedung === 'Belum Bayar' ? 'var(--red-100)' : 'var(--orange-bg)', 
                      color: tenant.gedung === 'Lunas' ? 'var(--green)' : tenant.gedung === 'Belum Bayar' ? 'var(--red)' : 'var(--orange)', 
                      padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '12px' 
                    }}>
                      {tenant.gedung}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      backgroundColor: tenant.service === 'Lunas' ? 'var(--green-bg)' : 'var(--red-100)', 
                      color: tenant.service === 'Lunas' ? 'var(--green)' : 'var(--red)', 
                      padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '12px' 
                    }}>
                      {tenant.service}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: tenant.tunggakan !== 'Rp 0' ? 'var(--orange)' : 'var(--text)' }}>
                    {tenant.tunggakan}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button style={{ 
                      backgroundColor: 'var(--warm-gray)', 
                      color: 'var(--text)', 
                      padding: '6px 12px', 
                      fontSize: '13px',
                      fontWeight: '600'
                    }} onClick={() => onSelectTenant(tenant.nama)}>
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardAdmin;