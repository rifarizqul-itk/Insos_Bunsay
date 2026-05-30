import React from 'react';
import { useLocation } from 'react-router-dom'; // 1. Masukkan pustaka router

function Sidebar({ setActiveMenu, onLogout, isOpen, onClose }) { // 2. Hapus prop activeMenu karena sudah pakai URL
  const location = useLocation(); // 3. Ambil data URL aktif saat ini

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pembayaran', label: 'Bayar Sekarang' },
    { id: 'histori', label: 'Histori Pembayaran' },
    { id: 'tunggakan', label: 'Tunggakan (Piutang)' },
    { id: 'akun', label: 'Akun Tenant' }
  ];

  return (
    <aside 
      className={`sidebar-container ${isOpen ? 'mobile-open' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Logo Aplikasi + Tombol Silang khusus Mobile View */}
      <div style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingLeft: '24px', 
        paddingRight: '16px',
        borderBottom: '1px solid var(--border)',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
              src="/assets/main_logo_transparent_for_light_bg.png" 
              alt="Logo Resmi Plaza Kebun Sayur" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
          />
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#8B1A1A', letterSpacing: '-0.5px' }}>
              Tenant
          </span>
        </div>
        
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          style={{
            display: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-2)',
            fontSize: '22px',
            padding: '4px',
            minHeight: 'auto',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Daftar Menu Navigasi */}
      <nav style={{ flex: 1, padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          // 4. Deteksi status aktif murni dari kecocokan alamat URL browser
          const isActive = location.pathname === `/tenant/${item.id}`;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                onClose(); // 5. Tutup sidebar otomatis di mobile setelah klik menu
              }}
              style={{
                width: '100%',
                backgroundColor: isActive ? 'var(--red-50)' : 'transparent',
                color: isActive ? 'var(--red)' : 'var(--text-2)',
                textAlign: 'left',
                padding: '12px 24px',
                borderRadius: '0',
                fontWeight: isActive ? '700' : '500',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                borderLeft: isActive ? '4px solid var(--red)' : '4px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if(!isActive) e.target.style.backgroundColor = 'var(--warm-gray)';
              }}
              onMouseLeave={(e) => {
                if(!isActive) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Tombol Keluar Log */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            backgroundColor: 'var(--warm-gray)',
            color: 'var(--red)',
            padding: '10px',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--red-100)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--warm-gray)'}
        >
          Keluar Aplikasi
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;