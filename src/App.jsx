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
import RiwayatTransaksiAdmin from './pages/admin/RiwayatTransaksiAdmin';
import DetailTenantAdmin from './pages/admin/DetailTenantAdmin';
import KetersediaanKios from './pages/admin/KetersediaanKios';
import EksporData from './pages/admin/EksporData';

function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('tenant'); 
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bayarProps, setBayarProps] = useState({ nominal: '', jenis: 'Sewa Gedung' });

  // State Global Simulasi Alur Transaksi Admin
  const [antreanAdmin, setAntreanAdmin] = useState([
    { id: 'TRX-1092', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (BNI)', waktu: '19 Mei 2026, 14:20 WITA' },
    { id: 'TRX-1093', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', waktu: '19 Mei 2026, 15:05 WITA' }
  ]);

  const [riwayatAdmin, setRiwayatAdmin] = useState([
    { id: 'TRX-1090', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS', waktu: '18 Mei 2026, 09:15 WITA', status: 'Lunas' },
    { id: 'TRX-1091', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (Mandiri)', waktu: '18 Mei 2026, 11:45 WITA', status: 'Tertolak', alasan: 'Bukti transfer tidak valid/rekayasa' }
  ]);

  const handleProsesVerifikasi = (transaksiSelesai) => {
    // Pindahkan dari antrean ke riwayat berkas
    setRiwayatAdmin(prev => [transaksiSelesai, ...prev]);
    setAntreanAdmin(prev => prev.filter(item => item.id !== transaksiSelesai.id));
  };

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
      
      {role === 'admin' ? (
        <SidebarAdmin 
          activeMenu={activeMenu} 
          setActiveMenu={(menu) => { 
            setActiveMenu(menu); 
            setSelectedTenant(null); 
            setIsSidebarOpen(false);
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
            setIsSidebarOpen(false);
          }} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <Topbar 
        userTitle={role === 'admin' ? "Administrator Utama" : "Hj. Yuliana (Kios B-1001)"} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {isSidebarOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

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
          {role === 'admin' && activeMenu === 'verifikasi_pembayaran' && (
            <VerifikasiPembayaran 
              antrean={antreanAdmin} 
              onProsesVerifikasi={handleProsesVerifikasi} 
            />
          )}
          {role === 'admin' && activeMenu === 'riwayat_transaksi_admin' && (
            <RiwayatTransaksiAdmin riwayat={riwayatAdmin} />
          )}
          {role === 'admin' && activeMenu === 'ketersediaan_kios' && <KetersediaanKios isAdmin={true} />}
          {role === 'admin' && activeMenu === 'ekspor_data' && <EksporData />}
          
        </div>
      </main>
    </div>
  );
}

export default App;