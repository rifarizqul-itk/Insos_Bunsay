import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, NotificationPopover, cn } from '@bunsay/shared-ui';
import { getEcho } from '@bunsay/shared-core';
import { useAdminAuth } from '../../auth/useAdminAuth';

function Topbar({ userTitle, onToggleSidebar, variant = 'admin' }) {
  const navigate = useNavigate();
  const { httpClient } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);
  const notifikasiRef = useRef(null);

  const [notifikasiList, setNotifikasiList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifikasi = useCallback(async () => {
    try {
      const res = await httpClient.get('/api/v1/admin/notifications');
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

    const echo = getEcho();
    if (echo) {
      const channel = echo.channel('admin-notifications');
      channel.listen('.notification.created', (e) => {
        setNotifikasiList(prev => [e, ...prev.filter(n => n.id !== e.id)]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        echo.leaveChannel('admin-notifications');
      };
    }
  }, [fetchNotifikasi]);

  const handleMarkAllRead = async () => {
    try {
      await httpClient.put('/api/v1/admin/notifications/read-all', { target_type: 'admin' });
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
        await httpClient.put(`/api/v1/admin/notifications/${notif.id}/read`);
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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleKlikLuar);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header
      data-slot="topbar-admin"
      aria-label="Topbar Navigasi Admin"
      className="topbar-container h-16 px-4 md:px-8 flex items-center justify-between font-sans"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka Menu Navigasi Admin"
          className="md:hidden size-11 flex items-center justify-center -ms-2 rounded-md text-text hover:bg-mono-100 focus:outline-none focus:ring-2 focus:ring-red transition-colors"
        >
          <Icon icon="heroicons:bars-3-20-solid" className="size-6" />
        </button>

        <div className="text-sm font-bold text-text-2 leading-tight min-w-0 break-words">
          <span className="hidden sm:inline">Konsol Admin: </span>
          <span className="text-red font-extrabold">{userTitle}</span>
        </div>
      </div>

      <div ref={notifikasiRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifikasi Admin"
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
          <NotificationPopover
            notifications={notifikasiList}
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
            onNotificationClick={handleNotifClick}
            variant="admin"
          />
        )}
      </div>
    </header>
  );
}

export default Topbar;
