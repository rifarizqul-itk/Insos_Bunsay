import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'; // Pustaka baru
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
  const navigate = useNavigate(); // Fungsi untuk pindah halaman via kode
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('tenant'); 
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bayarProps, setBayarProps] = useState({ nominal: '', jenis: 'Sewa Gedung' });

  // Antrean khusus pembayaran manual (data sampel tetap dipertahankan)
  const [antreanAdmin, setAntreanAdmin] = useState([
    { id: 'TRX-1092', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (BNI) Manual', waktu: '19 Mei 2026, 14:20 WITA' },
    { id: 'TRX-1093', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS Manual', waktu: '19 Mei 2026, 15:05 WITA' }
  ]);

  // Riwayat akhir seluruh transaksi
  const [riwayatAdmin, setRiwayatAdmin] = useState([
    { id: 'TRX-1090', nama: 'Hj. Yuliana', kios: 'B-1001', tagihan: 'Service Charge', nominal: 'Rp 350.000', metode: 'QRIS Manual', waktu: '18 Mei 2026, 09:15 WITA', status: 'Lunas' },
    { id: 'TRX-1091', nama: 'Eva Tauresea', kios: 'B-1004', tagihan: 'Sewa Gedung', nominal: 'Rp 1.500.000', metode: 'Transfer Bank (Mandiri)', waktu: '18 Mei 2026, 11:45 WITA', status: 'Tertolak', alasan: 'Bukti transfer tidak valid/rekayasa' }
  ]);

  const handleTambahTransaksiBaru = (transaksiBaru) => {
    if (transaksiBaru.status === 'Lunas') {
      setRiwayatAdmin(prev => [transaksiBaru, ...prev]);
    } else {
      setAntreanAdmin(prev => [transaksiBaru, ...prev]);
    }
    navigate('/tenant/histori'); // Berpindah alamat secara otomatis setelah bayar
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
    navigate('/tenant/pembayaran'); // Arahkan langsung ke menu pembayaran
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsSidebarOpen(false);
    navigate('/'); // Kembali ke landing page utama
  };

  return (
    <Routes>
      {/* ================= ALUR RUTE PUBLIK ================= */}
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

      {/* ================= ALUR RUTE SISI TENANT ================= */}
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

      {/* ================= ALUR RUTE SISI ADMIN ================= */}
      <Route path="/admin/*" element={
        <div style={{ minHeight: '100vh', backgroundColor: '#FBF7F2', position: 'relative', overflowX: 'hidden' }}>
          <SidebarAdmin activeMenu="" setActiveMenu={(menu) => { navigate(`/admin/${menu}`); setSelectedTenant(null); }} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <Topbar userTitle="Administrator Utama" onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          {isSidebarOpen && <div className="sidebar-mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}
          
          <main className="main-layout" style={{ padding: '32px' }}>
            <div className="main-content-inner">
              <Routes>
                <Route path="dashboard" element={
                  selectedTenant ? (
                    <DetailTenantAdmin tenantName={selectedTenant} onBack={() => setSelectedTenant(null)} />
                  ) : (
                    <DashboardAdmin onSelectTenant={(name) => setSelectedTenant(name)} />
                  )
                } />
                <Route path="verifikasi" element={<VerifikasiPembayaran antrean={antreanAdmin} onProsesVerifikasi={handleProsesVerifikasi} />} />
                <Route path="riwayat" element={<RiwayatTransaksiAdmin riwayat={riwayatAdmin} />} />
                <Route path="kios" element={<KetersediaanKios isAdmin={true} />} />
                <Route path="ekspor" element={<EksporData />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      } />

      {/* Rute default jika URL tidak ditemukan, lempar kembali ke Beranda */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;