import React, { useState } from 'react';
import LandingPage from './pages/public/LandingPage';
import AuthPage from './pages/public/AuthPage';
import Sidebar from './components/layouts/Sidebar';
import SidebarAdmin from './components/layouts/SidebarAdmin';
import Topbar from './components/layouts/Topbar';
import DashboardTenant from './pages/tenant/DashboardTenant';
import BayarSekarang from './pages/tenant/BayarSekarang';
import HistoriPembayaran from './pages/tenant/HistoriPembayaran';
import TunggakanAR from './pages/tenant/TunggakanAR';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import VerifikasiPembayaran from './pages/admin/VerifikasiPembayaran';
import DetailTenantAdmin from './pages/admin/DetailTenantAdmin';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // Alur utama: 'landing', 'auth', 'app'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('tenant'); 
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedTenant, setSelectedTenant] = useState(null);

  // State bantuan untuk oper data cepat antar-halaman tenant
  const [bayarProps, setBayarProps] = useState({ nominal: '', jenis: 'Sewa Gedung' });

  const handleFakeLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentView('app');
  };

  const handlePemicuBayarCepat = (nominal, jenis) => {
    setBayarProps({ nominal, jenis });
    setActiveMenu('pembayaran');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('landing');
  };

  // 1. KONDISI TAMPILAN: BERANDA PUBLIK UTAMA (TANPA LOGIN)
  if (currentView === 'landing') {
    return (
      <LandingPage onNavigasiMasuk={() => setCurrentView('auth')} />
    );
  }

  // 2. KONDISI TAMPILAN: HALAMAN FORM MASUK / DAFTAR (AUTH)
  if (currentView === 'auth') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--cream)' }}>
        {/* Bilah Toolbar Simulasi Peran Sisi Atas Layar untuk Pengujian Frontend */}
        <div style={{ backgroundColor: 'var(--warm-gray)', padding: '10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <button 
            onClick={() => setCurrentView('landing')}
            style={{ padding: '4px 12px', backgroundColor: '#ffffff', color: 'var(--text)', marginRight: '24px', minHeight: 'auto', fontWeight: '700', border: '1px solid var(--border)' }}
          >
            ← Kembali ke Beranda Utama
          </button>
          <span style={{ fontSize: '13px', fontWeight: '600', marginRight: '12px' }}>Simulasi Akun Target Masuk:</span>
          <button 
            onClick={() => { setRole('tenant'); setActiveMenu('dashboard'); }}
            style={{ padding: '4px 12px', backgroundColor: role === 'tenant' ? 'var(--red)' : '#ffffff', color: role === 'tenant' ? '#ffffff' : 'var(--text)', marginRight: '8px', minHeight: 'auto' }}
          >
            Sebagai Tenant (Hj. Yuliana)
          </button>
          <button 
            onClick={() => { setRole('admin'); setActiveMenu('dashboard_admin'); setSelectedTenant(null); }}
            style={{ padding: '4px 12px', backgroundColor: role === 'admin' ? 'var(--red)' : '#ffffff', color: role === 'admin' ? '#ffffff' : 'var(--text)', minHeight: 'auto' }}
          >
            Sebagai Pengelola / Admin Plaza
          </button>
        </div>
        
        <div onClick={(e) => {
          if (e.target.type === 'submit') {
            handleFakeLogin(e);
          }
        }}>
          <AuthPage />
        </div>
      </div>
    );
  }

  // 3. KONDISI TAMPILAN: INTERNAL PANEL SESUAI HAK AKSES PERAN (LOGGED IN)
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--cream)' }}>
      {role === 'admin' ? (
        <SidebarAdmin activeMenu={activeMenu} setActiveMenu={(menu) => { setActiveMenu(menu); setSelectedTenant(null); }} onLogout={handleLogout} />
      ) : (
        <Sidebar activeMenu={activeMenu} setActiveMenu={(menu) => { setActiveMenu(menu); setBayarProps({ nominal: '', jenis: 'Sewa Gedung' }); }} onLogout={handleLogout} />
      )}

      <Topbar userTitle={role === 'admin' ? "Administrator Utama" : "Hj. Yuliana (Kios B-1001)"} />

      <main style={{ marginLeft: '24px', paddingLeft: '240px', paddingTop: '64px' }}>
        <div style={{ padding: '40px 32px' }}>
          
          {/* ================= ROUTING ALUR SISI TENANT ================= */}
          {role === 'tenant' && activeMenu === 'dashboard' && <DashboardTenant />}
          {role === 'tenant' && activeMenu === 'pembayaran' && (
            <BayarSekarang 
              nominalAwal={bayarProps.nominal} 
              jenisAwal={bayarProps.jenis} 
              onSuksesKirim={() => setActiveMenu('histori')}
            />
          )}
          {role === 'tenant' && activeMenu === 'histori' && <HistoriPembayaran />}
          {role === 'tenant' && activeMenu === 'tunggakan' && (
            <TunggakanAR onPemicuBayar={handlePemicuBayarCepat} />
          )}
          
          {/* ================= ROUTING ALUR SISI ADMIN ================= */}
          {role === 'admin' && activeMenu === 'dashboard_admin' && !selectedTenant && (
            <DashboardAdmin onSelectTenant={(name) => setSelectedTenant(name)} />
          )}
          {role === 'admin' && selectedTenant && (
            <DetailTenantAdmin tenantName={selectedTenant} onBack={() => setSelectedTenant(null)} />
          )}
          {role === 'admin' && activeMenu === 'verifikasi_pembayaran' && <VerifikasiPembayaran />}
          
          {/* Penanganan Halaman Menu Cadangan yang Menunggu Sinkronisasi Backend Lanjutan */}
          {((role === 'tenant' && activeMenu === 'akun') || 
            (role === 'admin' && activeMenu === 'ketersediaan_kios' || activeMenu === 'ekspor_data')) && (
            <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-3)' }}>Halaman "{activeMenu}" sedang bersiap dalam antrean pengerjaan MVP berikutnya.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;