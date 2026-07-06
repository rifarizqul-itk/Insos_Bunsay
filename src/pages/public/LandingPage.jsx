import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page-fade-in" style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Top Navbar Publik */}
      <nav className="landing-navbar" style={{
        height: '72px', 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 200,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/assets/main_logo_transparent_for_light_bg.png" 
            alt="Logo Resmi Plaza Kebun Sayur" 
            style={{ height: '44px', width: 'auto', objectFit: 'contain' }} 
          />
          <span style={{ fontWeight: '800', fontSize: '22px', color: 'var(--red)', letterSpacing: '-0.5px' }}>
            Plaza Kebun Sayur
          </span>
        </div>
      </nav>

      {/* Konten Utama */}
      <div className="landing-page-shell" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }} className="page-fade-in">
          {/* Hero Section */}
          <div className="landing-hero-grid mobile-stack" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            backgroundColor: '#ffffff', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)',
            overflow: 'hidden',
            alignItems: 'center',
            boxShadow: '0 2px 12px rgba(139,26,26,0.08)'
          }}>
            <div style={{ padding: '32px',display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Pelayanan Resmi
              </span>
              <h1 style={{ fontSize: '42px', fontWeight: '725', lineHeight: '1.2', margin: '5px 0 16px 0', letterSpacing: '-1px', color: 'var(--text)' }}>
                Selamat Datang<br></br>di Portal Kios Bunsay
              </h1>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
                <button 
                  onClick={() => navigate('/auth')}
                  style={{
                    backgroundColor: 'var(--red)',
                    color: '#ffffff',
                    padding: '0 32px',
                    fontSize: '16px',
                    fontWeight: '800',
                    border: '2px solid var(--red-dark)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '52px'
                  }}
                >
                  LOGIN
                  <Icon icon="material-symbols:login" width="22" height="22" />
                </button>
              </div>
            </div>
            <div style={{ height: '100%', minHeight: '400px', overflow: 'hidden' }}>
              <img 
                src="/assets/Photograph_of_plaza_building.jpg" 
                alt="Gedung Plaza Kebun Sayur Balikpapan" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Grid Informasi */}
          <div className="landing-info-grid mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Card Kiri: Jam Operasional */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '32px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              boxShadow: '0 2px 12px rgba(139,26,26,0.08)'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: 'var(--text)' }}>
                Jam Operasional Gedung
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: '16px', fontWeight: '600', lineHeight: '1.5' }}>
                Plaza Kebun Sayur terbuka melayani aktivitas perdagangan pada waktu berikut:
              </p>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--red)', marginBottom: '6px' }}>
                09.00 - 21.00 WITA
              </div>
              <span style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '800' }}>
                Hari Senin s/d Hari Minggu (Buka Setiap Hari)
              </span>
            </div>

            {/* Card Kanan: Kontak Pengelola */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid var(--border)', 
              padding: '32px', 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: '0 2px 12px rgba(139,26,26,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                Informasi Kontak Kantor Pengelola
              </h3>
              <div style={{ fontSize: '16px', color: 'var(--text)', fontWeight: '600', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Alamat:</strong> Jl. Letjen Suprapto, Baru Ilir, Kec. Balikpapan Barat, Kota Balikpapan, Kalimantan Timur 76123</div>
                <div><strong>Jam Pelayanan Kantor:</strong> 09.00 - 21.00 WITA</div>
                <div><strong>Nomor Kontak Kantor:</strong> 0542-776 8882 / 0811-5901-119</div>
              </div>
              <div style={{ width: '100%', height: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <iframe 
                  title="Peta Lokasi Resmi Plaza Kebun Sayur Balikpapan"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8925621789695!2d116.82155707448267!3d-1.2342929355704761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x55155145b04a009%3A0xd023fb431afb2027!2sPlaza%20Kebun%20Sayur!5e0!3m2!1sen!2sus!4v1779193878240!5m2!1sen!2sus"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  className="pointer-events-none md:pointer-events-auto"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <a
                href="https://wa.me/628115901119"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  backgroundColor: 'var(--green-bg)',
                  color: 'var(--green)',
                  fontSize: '16px',
                  fontWeight: '800',
                  border: '2px solid var(--green)',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <Icon icon="ic:baseline-whatsapp" width="24" height="24" />
                Hubungi Melalui WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;