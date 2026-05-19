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
import AkunTenant from './pages/tenant/AkunTenant';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import VerifikasiPembayaran from './pages/admin/VerifikasiPembayaran';
import DetailTenantAdmin from './pages/admin/DetailTenantAdmin';
import KetersediaanKios from './pages/admin/KetersediaanKios';
import EksporData from './pages/admin/EksporData';

function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('tenant'); 
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  // State baru untuk penanganan buka/tutup Drawer Sidebar di Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    setIsSidebarOpen(false);
  };

  if (currentView === 'landing') {
    return (
      <LandingPage onNavigasiMasuk={() => setCurrentView('auth')} />
    );
  }

  if (currentView === 'auth') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--cream)' }}>
        <div className="auth-simulation-bar">
          <button 
            onClick={() => setCurrentView('landing')}
            style={{ padding: '4px 12px', backgroundColor: '#ffffff', color: 'var(--text)', marginRight: '8px', minHeight: 'auto', fontWeight: '700', border: '1px solid var(--border)' }}
          >
            ← Kembali ke Beranda Utama
          </button>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>Simulasi Akun Target Masuk:</span>
          <button 
            onClick={() => { setRole('tenant'); setActiveMenu('dashboard'); }}
            style={{ padding: '4px 12px', backgroundColor: role === 'tenant' ? 'var(--red)' : '#ffffff', color: role === 'tenant' ? '#ffffff' : 'var(--text)', marginRight: '4px', minHeight: 'auto' }}
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--cream)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Operasikan properti status drawer ke masing-masing komponen aside */}
      {role === 'admin' ? (
        <SidebarAdmin 
          activeMenu={activeMenu} 
          setActiveMenu={(menu) => { 
            setActiveMenu(menu); 
            setSelectedTenant(null); 
            setIsSidebarOpen(false); // Tutup drawer otomatis pas ganti menu
          }} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={(menu) => { 
            setActiveMenu(menu); 
            setBayarProps({ nominal: '', jenis: 'Sewa Gedung' }); 
            setIsSidebarOpen(false); // Tutup drawer otomatis pas ganti menu
          }} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Kirim pemicu toggle ke komponen topbar */}
      <Topbar 
        userTitle={role === 'admin' ? "Administrator Utama" : "Hj. Yuliana (Kios B-1001)"} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Tampilkan overlay transparan tipis pembantu penutupan saat mengklik ruang luar */}
      {isSidebarOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Gunakan class CSS murni untuk fleksibilitas perpindahan viewport desktop/mobile */}
      <main className="main-layout">
        <div className="main-content-inner">
          
          {/* ================= ROUTING ALUR SISI TENANT ================= */}
          {role === 'tenant' && activeMenu === 'dashboard' && <DashboardTenant onPemicuBayar={handlePemicuBayarCepat} />}
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
          {role === 'tenant' && activeMenu === 'akun' && <AkunTenant onLogout={handleLogout} />}
          
          {/* ================= ROUTING ALUR SISI ADMIN ================= */}
          {role === 'admin' && activeMenu === 'dashboard_admin' && !selectedTenant && (
            <DashboardAdmin onSelectTenant={(name) => setSelectedTenant(name)} />
          )}
          {role === 'admin' && selectedTenant && (
            <DetailTenantAdmin tenantName={selectedTenant} onBack={() => setSelectedTenant(null)} />
          )}
          {role === 'admin' && activeMenu === 'verifikasi_pembayaran' && <VerifikasiPembayaran />}
          {role === 'admin' && activeMenu === 'ketersediaan_kios' && <KetersediaanKios isAdmin={true} />}
          {role === 'admin' && activeMenu === 'ekspor_data' && <EksporData />}
          
        </div>
      </main>
    </div>
  );
}

export default App;