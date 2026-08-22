import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import { cn } from '../utils/cn';

export const groupNotificationsByDate = (notifications = []) => {
  const today = [];
  const yesterday = [];
  const earlier = [];

  const now = new Date();
  const todayDateString = now.toDateString();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayDateString = yesterdayDate.toDateString();

  notifications.forEach((notif) => {
    if (!notif.created_at) {
      today.push(notif);
      return;
    }

    const notifDate = new Date(notif.created_at);
    if (isNaN(notifDate.getTime())) {
      today.push(notif);
      return;
    }

    const notifDateString = notifDate.toDateString();

    if (notifDateString === todayDateString) {
      today.push(notif);
    } else if (notifDateString === yesterdayDateString) {
      yesterday.push(notif);
    } else {
      earlier.push(notif);
    }
  });

  return [
    { title: 'Hari Ini', items: today },
    { title: 'Kemarin', items: yesterday },
    { title: 'Terdahulu', items: earlier },
  ].filter(group => group.items.length > 0);
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours} jam lalu`;
  }
  
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const getNotifIconConfig = (type, title = '') => {
  const lowerTitle = (title || '').toLowerCase();
  if (lowerTitle.includes('bukti') || lowerTitle.includes('bayar') || lowerTitle.includes('lunas') || lowerTitle.includes('midtrans')) {
    return {
      icon: 'heroicons:banknotes-20-solid',
      colorClass: 'text-emerald-700 bg-emerald-100/90 border-emerald-200',
    };
  }
  if (lowerTitle.includes('verifikasi') || lowerTitle.includes('proses')) {
    return {
      icon: 'heroicons:clock-20-solid',
      colorClass: 'text-amber-700 bg-amber-100/90 border-amber-200',
    };
  }
  if (lowerTitle.includes('tolak') || lowerTitle.includes('tunggak') || lowerTitle.includes('peringatan') || lowerTitle.includes('sanggah')) {
    return {
      icon: 'heroicons:exclamation-triangle-20-solid',
      colorClass: 'text-red bg-red-50 border-red/20',
    };
  }
  return {
    icon: 'heroicons:bell-alert-20-solid',
    colorClass: 'text-blue-700 bg-blue-100/90 border-blue-200',
  };
};

export function NotificationPopover({
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onNotificationClick,
  variant = 'tenant',
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'

  const filteredList = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter(n => !n.is_read);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredList);
  }, [filteredList]);

  return (
    <div
      role="region"
      aria-label="Panel Notifikasi Real-Time"
      className="topbar-dropdown w-84 sm:w-96 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl border border-border/80 bg-white overflow-hidden flex flex-col font-sans text-left"
    >
      {/* Header Popover */}
      <div className="p-4 sm:p-5 border-b border-border/70 flex flex-col gap-3 bg-mono-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-text tracking-tight">Notifikasi</h3>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full font-tabular-nums",
              unreadCount > 0 ? "bg-red text-white" : "bg-mono-200 text-text-2"
            )}>
              {unreadCount > 0 ? `${unreadCount} Baru` : notifications.length}
            </span>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-bold text-red hover:text-red-800 flex items-center gap-1 hover:underline cursor-pointer transition-colors"
            >
              <Icon icon="heroicons:check-badge-20-solid" className="size-4" />
              <span>Tandai Dibaca</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-mono-100 rounded-lg border border-border/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-md text-center transition-all cursor-pointer",
              activeFilter === 'all'
                ? "bg-white text-text font-extrabold shadow-xs"
                : "text-text-2 hover:text-text"
            )}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-md text-center transition-all cursor-pointer flex items-center justify-center gap-1.5",
              activeFilter === 'unread'
                ? "bg-white text-text font-extrabold shadow-xs"
                : "text-text-2 hover:text-text"
            )}
          >
            <span>Belum Dibaca</span>
            {unreadCount > 0 && (
              <span className="size-2 rounded-full bg-red shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Notification List */}
      <div className="max-h-[22rem] overflow-y-auto divide-y divide-border/40 p-2">
        {groupedNotifications.length === 0 ? (
          <div className="py-10 px-4 flex flex-col items-center justify-center text-center gap-2 text-text-3">
            <div className="size-12 rounded-full bg-mono-100 flex items-center justify-center text-mono-400">
              <Icon icon="heroicons:bell-slash-20-solid" className="size-6" />
            </div>
            <p className="text-xs font-bold text-text-2">
              {activeFilter === 'unread' ? 'Semua notifikasi sudah dibaca' : 'Belum ada notifikasi saat ini'}
            </p>
            <span className="text-2xs text-text-3 font-medium max-w-xs">
              Pemberitahuan tagihan, verifikasi bukti bayar, dan info terkini akan muncul di sini.
            </span>
          </div>
        ) : (
          groupedNotifications.map((group) => (
            <div key={group.title} className="py-2 first:pt-1 last:pb-1">
              {/* Date Group Section Header */}
              <div className="px-3 py-1 text-2xs font-extrabold text-text-3 uppercase tracking-wider flex items-center gap-2">
                <span>{group.title}</span>
                <span className="h-px flex-1 bg-border/60" />
              </div>

              {/* Group Items */}
              <div className="flex flex-col gap-1 mt-1">
                {group.items.map((notif) => {
                  const iconCfg = getNotifIconConfig(notif.type, notif.title);
                  const isUnread = !notif.is_read;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => onNotificationClick && onNotificationClick(notif)}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "p-3 rounded-xl flex items-start gap-3 text-left cursor-pointer transition-all duration-150 relative group",
                        isUnread
                          ? "bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80"
                          : "hover:bg-mono-50 border border-transparent"
                      )}
                    >
                      {/* Unread Indicator Dot */}
                      {isUnread && (
                        <span className="absolute left-1.5 top-4 size-1.5 rounded-full bg-red shadow-xs animate-pulse" />
                      )}

                      {/* Category Icon */}
                      <div className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                        iconCfg.colorClass
                      )}>
                        <Icon icon={iconCfg.icon} className="size-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1.5">
                          <h4 className={cn(
                            "text-xs leading-snug truncate",
                            isUnread ? "font-extrabold text-text" : "font-bold text-text-2"
                          )}>
                            {notif.title || 'Pemberitahuan'}
                          </h4>
                          <span className="text-2xs font-semibold text-text-3 shrink-0 font-tabular-nums">
                            {formatRelativeTime(notif.created_at)}
                          </span>
                        </div>

                        <p className="text-xs text-text-2 font-medium line-clamp-2 mt-0.5 leading-relaxed">
                          {notif.message || notif.teks || ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-mono-50/80 border-t border-border/70 text-center flex items-center justify-center gap-1.5 text-2xs text-text-3 font-semibold">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Sinkronisasi Real-Time WebSocket Aktif</span>
      </div>
    </div>
  );
}

export default NotificationPopover;
