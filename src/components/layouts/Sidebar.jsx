import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

function Sidebar({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/tenant/dashboard' },
    { id: 'pembayaran', label: 'Bayar Sekarang', path: '/tenant/pembayaran' },
    { id: 'histori', label: 'Histori Pembayaran', path: '/tenant/histori' },
    { id: 'tunggakan', label: 'Tunggakan (Piutang)', path: '/tenant/tunggakan' },
    { id: 'akun', label: 'Akun Tenant', path: '/tenant/akun' }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`sidebar-tenant-container ${isOpen ? 'mobile-open' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Logo */}
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
            alt="Logo Plaza Kebun Sayur" 
            loading="lazy"
            decoding="async"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
          />
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#8B1A1A', letterSpacing: '-0.5px' }}>
            Tenant
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="sidebar-close-btn block md:hidden p-2 text-2xl text-text-2 bg-transparent cursor-pointer active:scale-95 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Icon icon="ph:x-bold" width="22" height="22" />
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              style={{
                width: '100%',
                backgroundColor: active ? 'var(--red-50)' : 'transparent',
                color: active ? 'var(--red)' : 'var(--text-2)',
                textAlign: 'left',
                padding: '12px 24px',
                borderRadius: '0',
                fontWeight: active ? '700' : '500',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                borderLeft: active ? '4px solid var(--red)' : '4px solid transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if(!active) e.target.style.backgroundColor = 'var(--warm-gray)';
              }}
              onMouseLeave={(e) => {
                if(!active) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
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
            textAlign: 'center',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
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
