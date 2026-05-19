import React from 'react';

function Sidebar({ activeMenu, setActiveMenu, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pembayaran', label: 'Bayar Sekarang' },
    { id: 'histori', label: 'Histori Pembayaran' },
    { id: 'tunggakan', label: 'Tunggakan (Piutang)' },
    { id: 'akun', label: 'Akun Tenant' }
  ];

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border)',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      {/* Logo Aplikasi */}
      <div style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        paddingLeft: '24px', 
        borderBottom: '1px solid var(--border)' 
      }}>
        <span style={{ fontVerian: 'small-caps', fontStyle: 'normal', fontFamily: 'Plus Jakarta Sans', fontWeight: '800', fontSize: '20px', color: 'var(--red)', letterSpacing: '-0.5px' }}>
          Bunsay
        </span>
      </div>

      {/* Daftar Menu Navigasi */}
      <nav style={{ flex: 1, padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
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