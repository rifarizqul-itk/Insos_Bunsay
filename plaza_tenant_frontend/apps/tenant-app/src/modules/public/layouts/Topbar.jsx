import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, cn } from '@bunsay/shared-ui';
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
        setNotifikasiList([]);
        setUnreadCount(0);
      }
    } catch (err) {
      setNotifikasiList([]);
      setUnreadCount(0);
    }
  }, [httpClient]);

  useEffect(() => {
    fetchNotifikasi();
  }, [fetchNotifikasi]);

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

  const handleNotifClick = async (notif) => {
    setIsOpen(false);
    if (!notif.is_read) {
      try {
        await httpClient.put(`/api/v1/tenant/notifications/${notif.id}/read`);
        setNotifikasiList(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        setNotifikasiList(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
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
    <header data-slot="topbar" className="topbar-container min-h-16 py-2 flex justify-between items-center font-sans">
      <div className="flex items-center gap-2.5 min-w-0 flex-1 me-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className="topbar-hamburger-tenant bg-transparent border border-border rounded-md px-3 cursor-pointer items-center justify-center h-11 text-text shrink-0"
        >
          <Icon icon="ph:list-bold" className="size-5.5" />
        </button>
        
        <div className="text-sm font-bold text-text-2 leading-tight min-w-0 break-words">
          <span className="hidden sm:inline">Sesi Aktif: </span>
          <span className="text-red font-extrabold">{userTitle}</span>
        </div>
      </div>

      <div ref={notifikasiRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifikasi"
          aria-expanded={isOpen}
          className={cn(
            'h-11 px-4 text-sm font-extrabold cursor-pointer flex items-center gap-2 rounded-md border border-border transition-colors',
            isOpen ? 'bg-mono-100 text-text' : 'bg-transparent text-text hover:bg-mono-100/60'
          )}
        >
          <span>Notifikasi</span>
          <span className={cn('text-white text-xs font-extrabold px-2 py-0.5 rounded-full inline-block font-tabular-nums', unreadCount > 0 ? 'bg-red' : 'bg-slate-400')}>
            {unreadCount}
          </span>
        </button>

        {isOpen && (
          <div 
            role="region"
            aria-label="Panel Notifikasi"
            className="topbar-dropdown"
          >
            <div className="flex items-center justify-between border-b-2 border-mono-100 pb-2.5">
              <span className="text-sm font-extrabold text-text">Notifikasi Anda</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-red hover:underline font-bold bg-transparent border-none cursor-pointer"
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>

            <div role="list" className="flex flex-col gap-2 max-h-80 overflow-y-auto">
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
                      p-3 rounded-lg flex flex-col gap-1 text-start border cursor-pointer transition-colors
                      ${!notif.is_read ? 'bg-amber-50 border-amber-300 hover:bg-amber-100' : 'bg-white border-border hover:bg-mono-100'}
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
                      {!notif.is_read && <span className="size-2 rounded-full bg-red shrink-0" />}
                    </div>
                    <p className="text-xs text-text-2 font-medium leading-relaxed m-0">
                      {notif.message || notif.teks}
                    </p>
                    <span className="text-2.5 text-text-3 font-semibold pt-1">
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
