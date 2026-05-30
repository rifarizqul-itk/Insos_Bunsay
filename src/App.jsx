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

  // Antrean khusus untuk metode Pembayaran Manual yang memerlukan persetujuan Admin
  const [antreanAdmin, setAntreanAdmin] = useState([
    { id: 'TRX-1092', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (BNI) Manual', waktu: '19 Mei 2026, 14:20 WITA' },
    { id: 'TRX-1093', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS Manual', waktu: '19 Mei 2026, 15:05 WITA' }
  ]);

  // Riwayat akhir seluruh transaksi yang berstatus Lunas atau Tertolak
  const [riwayatAdmin, setRiwayatAdmin] = useState([
    { id: 'TRX-1090', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS Manual', waktu: '18 Mei 2026, 09:15 WITA', status: 'Lunas' },
    { id: 'TRX-1091', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (Mandiri)', waktu: '18 Mei 2026, 11:45 WITA', status: 'Tertolak', alasan: 'Bukti transfer tidak valid/rekayasa' }
  ]);

  // Callback saat pembayaran dilakukan oleh Tenant
  const handleTambahTransaksiBaru = (transaksiBaru) => {
    if (transaksiBaru.status === 'Lunas') {
      // Jika pembayaran melalui Midtrans Sandbox otomatis, langsung masukkan ke Riwayat Utama (Bypass Antrean Verifikasi)
      setRiwayatAdmin(prev => [transaksiBaru, ...prev]);
    } else {
      // Jika manual, masuk ke antrean verifikasi berkas terlebih dahulu
      setAntreanAdmin(prev => [transaksiBaru, ...prev]);
    }
    setActiveMenu('histori');
  };

  const handleProsesVerifikasi = (transaksiSelesai) => {
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
    return <LandingPage onNavigasiMasuk={() => setCurrentView('auth')} />;
  }

  if (currentView === 'auth') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FBF7F2' }}>
        <div className="auth-simulation-bar" style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#F5F0EB', borderBottom: '1px solid #E8E0D8' }}>
          <button 
            onClick={() => setCurrentView('landing')}
            style={{ padding: '6px 12px', backgroundColor: '#ffffff', color: '#1A1410', marginRight: '12px', fontWeight: '700', border: '1px solid #E8E0D8', borderRadius: '6px', cursor: 'pointer', height: '44px' }}
          >
            ← Kembali ke Beranda Utama
          </button>
          <span style={{ fontSize: '15px', fontWeight: '600', marginRight: '12px', color: '#1A1410' }}>Simulasi Akun Target Masuk:</span>
          <button 
            onClick={() => { setRole('tenant'); setActiveMenu('dashboard'); }}
            style={{ padding: '6px 12px', backgroundColor: role === 'tenant' ? '#8B1A1A' : '#ffffff', color: role === 'tenant' ? '#ffffff' : '#1A1410', marginRight: '6px', borderRadius: '6px', cursor: 'pointer', height: '44px' }}
          >
            Sebagai Tenant (Hj. Yuliana)
          </button>
          <button 
            onClick={() => { setRole('admin'); setActiveMenu('dashboard_admin'); setSelectedTenant(null); }}
            style={{ padding: '6px 12px', backgroundColor: role === 'admin' ? '#8B1A1A' : '#ffffff', color: role === 'admin' ? '#ffffff' : '#1A1410', borderRadius: '6px', cursor: 'pointer', height: '44px' }}
          >
            Sebagai Pengelola / Admin Plaza
          </button>
        </div>
        
        <div onClick={(e) => { if (e.target.type === 'submit') handleFakeLogin(e); }}>
          <AuthPage />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FBF7F2', position: 'relative', overflowX: 'hidden' }}>
      
      {role === 'admin' ? (
        <SidebarAdmin 
          activeMenu={activeMenu} 
          setActiveMenu={(menu) => { setActiveMenu(menu); setSelectedTenant(null); setIsSidebarOpen(false); }} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={(menu) => { setActiveMenu(menu); setBayarProps({ nominal: '', jenis: 'Sewa Gedung' }); setIsSidebarOpen(false); }} 
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

      <main className="main-layout" style={{ padding: '32px' }}>
        <div className="main-content-inner">
          
          {/* ================= ROUTING ALUR SISI TENANT ================= */}
          {role === 'tenant' && activeMenu === 'dashboard' && <DashboardTenant onPemicuBayar={handlePemicuBayarCepat} />}
          {role === 'tenant' && activeMenu === 'pembayaran' && (
            <BayarSekarang 
              nominalAwal={bayarProps.nominal} 
              jenisAwal={bayarProps.jenis} 
              onSuksesKirim={handleTambahTransaksiBaru}
            />
          )}
          {role === 'tenant' && activeMenu === 'histori' && <HistoriPembayaran riwayat={riwayatAdmin} />}
          {role === 'tenant' && activeMenu === 'tunggakan' && <TunggakanAR onPemicuBayar={handlePemicuBayarCepat} />}
          {role === 'tenant' && activeMenu === 'akun' && <AkunTenant onLogout={handleLogout} />}
          
          {/* ================= ROUTING ALUR SISI ADMIN ================= */}
          {role === 'admin' && activeMenu === 'dashboard_admin' && !selectedTenant && (
            <DashboardAdmin onSelectTenant={(name) => setSelectedTenant(name)} />
          )}
          {role === 'admin' && selectedTenant && (
            <DetailTenantAdmin tenantName={selectedTenant} onBack={() => setSelectedTenant(null)} />
          )}
          {role === 'admin' && activeMenu === 'verifikasi_pembayaran' && (
            <VerifikasiPembayaran antrean={antreanAdmin} onProsesVerifikasi={handleProsesVerifikasi} />
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