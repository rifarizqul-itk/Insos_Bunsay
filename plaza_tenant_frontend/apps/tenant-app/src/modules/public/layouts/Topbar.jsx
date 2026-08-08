import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@bunsay/shared-ui';
import { useTenantAuth } from '../useTenantAuth';

function Topbar({ userTitle, onToggleSidebar, variant = 'tenant' }) {
  const navigate = useNavigate();
  const { httpClient } = useTenantAuth();
  const [isOpen, setIsOpen] = useState(false);
  const notifikasiRef = useRef(null);

  const [notifikasiList, setNotifikasiList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifikasi = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/v1/tenant/notifications');
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setNotifikasiList(res.data.data);
        setUnreadCount(res.data.unreadCount ?? res.data.data.filter(n => !n.is_read).length);
      } else {
        setNotifikasiList(fallbackTenantNotif);
        setUnreadCount(fallbackTenantNotif.length);
      }
    } catch (err) {
      setNotifikasiList(fallbackTenantNotif);
      setUnreadCount(fallbackTenantNotif.length);
    }
  }, [httpClient]);

  useEffect(() => {
    fetchNotifikasi();
  }, [fetchNotifikasi]);

  const fallbackTenantNotif = [
    { id: 1, title: 'Pembayaran Diterima', message: 'Pembayaran sewa periode Mei 2026 telah diverifikasi dan DITERIMA.', created_at: 'Hari ini', type: 'success', is_read: false, link: '/tenant/histori' },
    { id: 2, title: 'Tagihan Baru Diterbitkan', message: 'Tagihan sewa kios periode Juni 2026 telah diterbitkan.', created_at: '2 hari lalu', type: 'warning', is_read: true, link: '/tenant/pembayaran' }
  ];

  const handleMarkAllRead = async () => {
    try {
      await httpClient.put('/api/v1/tenant/notifications/read-all', { target_type: 'tenant' });
      setUnreadCount(0);
      setNotifikasiList(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      setUnreadCount(0);
      setNotifikasiList(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleNotifClick = (notif) => {
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  useEffect(() => {
    function handleKlikLuar(event) {
      if (notifikasiRef.current && !notifikasiRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleKlikLuar);
    document.addEventListener('touchstart', handleKlikLuar);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleKlikLuar);
      document.removeEventListener('touchstart', handleKlikLuar);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="topbar-container min-h-[64px] py-2 flex justify-between items-center bg-white border-b border-border font-sans">
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className="topbar-hamburger-tenant bg-transparent border border-border rounded-md px-3 cursor-pointer items-center justify-center h-11 text-text shrink-0"
        >
          <Icon icon="ph:list-bold" width="22" height="22" />
        </button>
        
        <div className="text-[15px] font-bold text-text-2 leading-tight min-w-0 break-words">
          <span className="hidden sm:inline">Sesi Aktif: </span>
          <span className="text-red font-extrabold">{userTitle}</span>
        </div>
      </div>

      <div ref={notifikasiRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifikasi"
          aria-expanded={isOpen}
          className={`
            h-11 px-4 text-[15px] font-extrabold cursor-pointer flex items-center gap-2 rounded-md border border-border transition-colors
            ${isOpen ? 'bg-warm-gray text-text' : 'bg-transparent text-text hover:bg-warm-gray/50'}
          `}
        >
          <span>Notifikasi</span>
          <span className={`text-white text-xs font-extrabold px-2 py-0.5 rounded-full inline-block font-tabular-nums ${unreadCount > 0 ? 'bg-red' : 'bg-slate-400'}`}>
            {unreadCount}
          </span>
        </button>

        {isOpen && (
          <div 
            role="region"
            aria-label="Panel Notifikasi"
            className="topbar-dropdown absolute top-14 -right-2 w-[calc(100vw-32px)] max-w-[380px] bg-white border border-border rounded-2xl shadow-card-elevated p-4 flex flex-col gap-3 z-40 animate-[fadeIn_0.15s_ease-out]"
          >
            <div className="flex items-center justify-between border-b-2 border-warm-gray pb-2.5">
              <span className="text-[15px] font-extrabold text-text">Notifikasi Anda</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-red hover:underline font-bold bg-transparent border-none cursor-pointer"
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>

            <div role="list" className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
              {notifikasiList.length === 0 ? (
                <div className="text-xs text-text-3 font-semibold text-center py-4">Belum ada notifikasi.</div>
              ) : (
                notifikasiList.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    role="button"
                    tabIndex={0}
                    className={`
                      p-3 rounded-lg flex flex-col gap-1 text-left border cursor-pointer transition-colors
                      ${!notif.is_read ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70' : 'bg-white border-border hover:bg-warm-gray/30'}
                    `}
                  >
                    <div className="text-xs font-extrabold text-text leading-snug flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        {notif.type === 'danger' || notif.type === 'warning' ? (
                          <Icon icon="heroicons:exclamation-circle-20-solid" className="text-amber-600 shrink-0 size-4" />
                        ) : (
                          <Icon icon="heroicons:check-circle-20-solid" className="text-emerald-600 shrink-0 size-4" />
                        )}
                        <span>{notif.title || 'Informasi Notifikasi'}</span>
                      </span>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-red shrink-0" />}
                    </div>
                    <p className="text-xs text-text-2 font-medium leading-relaxed m-0">
                      {notif.message || notif.teks}
                    </p>
                    <span className="text-[10px] text-text-3 font-semibold pt-1">
                      {notif.created_at || 'Baru Saja'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
