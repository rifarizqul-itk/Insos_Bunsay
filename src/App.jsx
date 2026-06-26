import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
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
import VerifikasiBuktiTransfer from './pages/admin/VerifikasiBuktiTransfer';
import SetoranTunai from './pages/admin/SetoranTunai';
import RiwayatTransaksiAdmin from './pages/admin/RiwayatTransaksiAdmin';
import KetersediaanKios from './pages/admin/KetersediaanKios';
import DetailAdministrasiKios from './pages/admin/DetailAdministrasiKios';
import EksporData from './pages/admin/EksporData';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('tenant'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bayarProps, setBayarProps] = useState({ nominal: '', jenis: 'Service Charge' });

  const [antreanAdmin, setAntreanAdmin] = useState([
    { id: 'TRX-1092', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (BNI)', waktu: '19 Mei 2026, 14:20 WITA' }
  ]);

  const [riwayatAdmin, setRiwayatAdmin] = useState([
    { id: 'TRX-1090', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS Manual', waktu: '18 Mei 2026, 09:15 WITA', status: 'Lunas' },
    { id: 'TRX-1091', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (Mandiri)', waktu: '18 Mei 2026, 11:45 WITA', status: 'Tertolak', alasan: 'Bukti transfer tidak valid/rekayasa' }
  ]);

  const handleTambahTransaksiBaru = (transaksiBaru) => {
    if (transaksiBaru.status === 'Lunas') {
      setRiwayatAdmin(prev => [transaksiBaru, ...prev]);
    } else {
      setAntreanAdmin(prev => [transaksiBaru, ...prev]);
    }
    navigate('/tenant/histori');
  };

  const handleProsesVerifikasi = (transaksiSelesai) => {
    setRiwayatAdmin(prev => [transaksiSelesai, ...prev]);
    setAntreanAdmin(prev => prev.filter(item => item.id !== transaksiSelesai.id));
  };

  const handleFakeLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/tenant/dashboard');
    }
  };

  const handlePemicuBayarCepat = (nominal, jenis) => {
    setBayarProps({ nominal, jenis });
    navigate('/tenant/pembayaran');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsSidebarOpen(false);
    navigate('/');
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage onNavigasiMasuk={() => navigate('/auth')} />} />
      <Route path="/auth" element={
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FBF7F2' }}>
          <div className="auth-simulation-bar" style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#F5F0EB', borderBottom: '1px solid #E8E0D8' }}>
            <button 
              onClick={() => navigate('/')}
              style={{ padding: '6px 12px', backgroundColor: '#ffffff', color: '#1A1410', marginRight: '12px', fontWeight: '700', border: '1px solid #E8E0D8', borderRadius: '6px', cursor: 'pointer', height: '44px' }}
            >
              ← Kembali ke Beranda Utama
            </button>
            <span style={{ fontSize: '15px', fontWeight: '600', marginRight: '12px', color: '#1A1410' }}>Simulasi Akun Target Masuk:</span>
            <button 
              onClick={() => setRole('tenant')}
              style={{ padding: '6px 12px', backgroundColor: role === 'tenant' ? '#8B1A1A' : '#ffffff', color: role === 'tenant' ? '#ffffff' : '#1A1410', marginRight: '6px', borderRadius: '6px', cursor: 'pointer', height: '44px' }}
            >
              Sebagai Tenant
            </button>
            <button 
              onClick={() => setRole('admin')}
              style={{ padding: '6px 12px', backgroundColor: role === 'admin' ? '#8B1A1A' : '#ffffff', color: role === 'admin' ? '#ffffff' : '#1A1410', borderRadius: '6px', cursor: 'pointer', height: '44px' }}
            >
              Sebagai Admin
            </button>
          </div>
          
          <div onClick={(e) => { if (e.target.type === 'submit') handleFakeLogin(e); }}>
            <AuthPage />
          </div>
        </div>
      } />

      {/* Tenant */}
      <Route path="/tenant/*" element={
        <div style={{ minHeight: '100vh', backgroundColor: '#FBF7F2', position: 'relative', overflowX: 'hidden' }}>
          <Sidebar activeMenu="" setActiveMenu={(menu) => navigate(`/tenant/${menu}`)} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <Topbar userTitle="Hj. Yuliana (Kios B-1001)" onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          {isSidebarOpen && <div className="sidebar-mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}
          
          <main className="main-layout" style={{ padding: '32px' }}>
            <div className="main-content-inner">
              <Routes>
                <Route path="dashboard" element={<DashboardTenant onPemicuBayar={handlePemicuBayarCepat} />} />
                <Route path="pembayaran" element={<BayarSekarang nominalAwal={bayarProps.nominal} jenisAwal={bayarProps.jenis} onSuksesKirim={handleTambahTransaksiBaru} />} />
                <Route path="histori" element={<HistoriPembayaran riwayat={riwayatAdmin} />} />
                <Route path="tunggakan" element={<TunggakanAR onPemicuBayar={handlePemicuBayarCepat} />} />
                <Route path="akun" element={<AkunTenant onLogout={handleLogout} />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      } />

      {/* Admin */}
      <Route path="/admin/*" element={
        <div style={{ minHeight: '100vh', backgroundColor: '#FBF7F2', position: 'relative', overflowX: 'hidden' }}>
          <SidebarAdmin activeMenu="" setActiveMenu={(menu) => { navigate(`/admin/${menu}`); }} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <Topbar userTitle="Administrator Utama" onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          {isSidebarOpen && <div className="sidebar-mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}
          
          <main className="main-layout" style={{ padding: '32px' }}>
            <div className="main-content-inner">
              <Routes>
                <Route path="dashboard" element={<DashboardAdmin />} />
                <Route path="verifikasi-bukti" element={
                  <VerifikasiBuktiTransfer 
                    antrean={antreanAdmin} 
                    onProsesVerifikasi={handleProsesVerifikasi} 
                    selectedTenant={location.state?.selectedTenant || null}
                  />
                } />
                <Route path="setoran-tunai" element={<SetoranTunai />} />
                <Route path="riwayat" element={<RiwayatTransaksiAdmin riwayat={riwayatAdmin} />} />
                <Route path="kios" element={<KetersediaanKios isAdmin={true} />} />
                <Route path="detail-administrasi" element={<DetailAdministrasiKios />} />
                <Route path="ekspor" element={<EksporData />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;