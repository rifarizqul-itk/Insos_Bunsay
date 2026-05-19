import React, { useState } from 'react';
import KetersediaanKios from '../admin/KetersediaanKios';

function LandingPage({ onNavigasiMasuk }) {
  const [subMenu, setSubMenu] = useState('informasi');

  return (
    <div className="page-fade-in" style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      
      {/* Top Navbar Publik */}
      <nav style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 200
      }}>
        <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '800', fontSize: '20px', color: 'var(--red)', letterSpacing: '-0.5px' }}>
          Plaza Kebun Sayur
        </div>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          <button 
            onClick={() => setSubMenu('informasi')}
            style={{ backgroundColor: 'transparent', color: subMenu === 'informasi' ? 'var(--red)' : 'var(--text-2)', fontWeight: subMenu === 'informasi' ? '700' : '500', minHeight: 'auto' }}
          >
            Informasi Umum
          </button>
          <button 
            onClick={() => setSubMenu('direktori')}
            style={{ backgroundColor: 'transparent', color: subMenu === 'direktori' ? 'var(--red)' : 'var(--text-2)', fontWeight: subMenu === 'direktori' ? '700' : '500', minHeight: 'auto' }}
          >
            Cari Kios Kosong
          </button>
        </div>

        <button 
          onClick={onNavigasiMasuk}
          style={{ backgroundColor: 'var(--red)', color: '#ffffff', padding: '8px 20px', fontSize: '14px', fontWeight: '700' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--red-dark)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--red)'}
        >
          Portal Tenant & Admin →
        </button>
      </nav>

      {/* Konten Utama Berdasarkan Menu Terpilih */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        
        {subMenu === 'informasi' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }} className="page-fade-in">
            {/* Hero Section Banner */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '32px', 
              backgroundColor: '#ffffff', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)',
              overflow: 'hidden',
              alignItems: 'center'
            }}>
              <div style={{ padding: '48px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '1px' }}>Informasi Resmi Pelayanan</span>
                <h1 style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1.2', margin: '12px 0 20px 0', letterSpacing: '-1px' }}>
                  Selamat Datang di Portal Digital Perwalian Kios Bunsay
                </h1>
                <p style={{ color: 'var(--text-2)', fontSize: '15px', marginBottom: '24px' }}>
                  Sistem integrasi transparansi data ketersediaan unit properti pasar, rekap administrasi, serta standardisasi loket pelaporan transaksi bagi seluruh pedagang Plaza Kebun Sayur Balikpapan.
                </p>
                <button 
                  onClick={() => setSubMenu('direktori')}
                  style={{ backgroundColor: 'var(--warm-gray)', color: 'var(--text)', padding: '12px 24px', fontWeight: '700' }}
                >
                  Lihat Tabel Ketersediaan Unit Kios
                </button>
              </div>
              <div style={{ height: '100%', minHeight: '380px', overflow: 'hidden' }}>
                <img 
                  src="/assets/Photograph_of_plaza_building.jpg" 
                  alt="Gedung Plaza Kebun Sayur Balikpapan" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Jam Operasional & Blok Kontak Pengelola */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--text)' }}>Jam Operasional Gedung</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Plaza Kebun Sayur terbuka secara aktif melayani aktivitas perdagangan masyarakat umum pada waktu berikut:</p>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--red)', marginTop: '16px' }}>09.00 - 21.00 WITA</div>
                <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: '600' }}>Hari Senin s/d Hari Minggu (Setiap Hari)</span>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--text)' }}>Kontak Kantor Pengelola</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Hubungi sekretariat badan pengelola untuk keperluan administrasi pengalihan, pengosongan, atau pengaduan fasilitas fisik gedung:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', fontSize: '14px' }}>
                  <div><span style={{ color: 'var(--text-3)' }}>Alamat Fisik:</span> <strong>Lantai 3 Blok C, Kantor Pengelola Plaza Kebun Sayur Balikpapan</strong></div>
                  <div><span style={{ color: 'var(--text-3)' }}>Nomor Saluran:</span> <strong>(0542) 743-900 / 0811-5901-119</strong></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }} className="page-fade-in">
            {/* Memanggil Komponen Kios Secara Reusable dengan Parameter isAdmin = false */}
            <KetersediaanKios isAdmin={false} />
          </div>
        )}

      </div>
    </div>
  );
}

export default LandingPage;