import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, NotificationPopover, cn } from '@bunsay/shared-ui';
import { getEcho } from '@bunsay/shared-core';
import { useTenantAuth } from '../useTenantAuth';

function Topbar({ userTitle, onToggleSidebar, variant = 'tenant' }) {
  const navigate = useNavigate();
  const { httpClient, user } = useTenantAuth();
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

    const echo = getEcho();
    if (echo) {
      const genChannel = echo.channel('tenant-notifications');
      genChannel.listen('.notification.created', (e) => {
        setNotifikasiList(prev => [e, ...prev.filter(n => n.id !== e.id)]);
        setUnreadCount(prev => prev + 1);
      });

      const userId = user?.id || user?.Id_user || user?.sub;
      let userChannel = null;
      if (userId) {
        userChannel = echo.channel(`tenant-notifications.${userId}`);
        userChannel.listen('.notification.created', (e) => {
          setNotifikasiList(prev => [e, ...prev.filter(n => n.id !== e.id)]);
          setUnreadCount(prev => prev + 1);
        });
      }

      return () => {
        echo.leaveChannel('tenant-notifications');
        if (userId) {
          echo.leaveChannel(`tenant-notifications.${userId}`);
        }
      };
    }
  }, [fetchNotifikasi, user]);

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
    <header
      data-slot="topbar"
      className="topbar-container h-17 md:h-18 px-4 md:px-8 flex justify-between items-center font-sans border-b border-border/80 bg-white/85 backdrop-blur-xl shrink-0"
    >
      {/* Left: Mobile Toggle & Session Context */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className="topbar-hamburger-tenant md:hidden size-11 flex items-center justify-center rounded-xl text-text-2 hover:text-text hover:bg-mono-100 focus:outline-none focus:ring-2 focus:ring-red transition-colors cursor-pointer active:scale-95"
        >
          <Icon icon="heroicons:bars-3-20-solid" className="size-6" />
        </button>
        
        <div className="flex items-center gap-2 text-sm font-bold text-text-3 min-w-0">
          <span className="hidden sm:inline">Portal Tenant</span>
          <span className="hidden sm:inline text-border">/</span>
          <span className="text-text font-extrabold text-sm sm:text-[15px] truncate">
            {userTitle}
          </span>
        </div>
      </div>

      {/* Right: Quick Action & Notification Trigger */}
      <div className="flex items-center gap-3">
        <div ref={notifikasiRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Notifikasi"
            aria-expanded={isOpen}
            className={cn(
              'h-11 px-3.5 sm:px-4 text-sm font-extrabold cursor-pointer flex items-center gap-2 rounded-xl border transition-all active:scale-95 shrink-0 shadow-2xs',
              isOpen
                ? 'bg-mono-100 text-text border-border shadow-xs'
                : 'bg-white text-text-2 border-border/80 hover:text-text hover:bg-mono-50 hover:border-border'
            )}
          >
            <Icon icon="heroicons:bell-20-solid" className="size-5 text-text-2 shrink-0" />
            <span className="font-extrabold text-sm">Notifikasi</span>
            {unreadCount > 0 && (
              <span className="text-white text-xs font-extrabold px-2 py-0.5 rounded-full bg-red font-tabular-nums animate-pulse shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <NotificationPopover
              notifications={notifikasiList}
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllRead}
              onNotificationClick={handleNotifClick}
              variant="tenant"
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;

