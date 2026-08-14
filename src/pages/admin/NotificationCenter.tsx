import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, FileText, Wrench, Clock, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../../types';
import { getNotifications, markNotificationsRead } from '../../services/api';

const removeEmojis = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/^[\s\u200B\uFEFF\u00A0\u2000-\u200A\u202F\u205F\u3000]+/g, '')
    .trim();
};

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await markNotificationsRead();
    fetchNotifs();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (title: string, type?: string) => {
    const cleaned = removeEmojis(title);
    if (cleaned.includes('Rental Application') || cleaned.includes('Booking') || type === 'booking') {
      return {
        icon: FileText,
        bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20',
        badgeText: 'Application'
      };
    }
    if (cleaned.includes('Maintenance Request') || cleaned.includes('Repair') || type === 'warning') {
      return {
        icon: Wrench,
        bg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20',
        badgeText: 'Maintenance'
      };
    }
    if (cleaned.includes('Reminder') || cleaned.includes('Scheduled') || type === 'info') {
      return {
        icon: Clock,
        bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20',
        badgeText: 'Reminder'
      };
    }
    return {
      icon: Bell,
      bg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20',
      badgeText: 'System'
    };
  };

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nike-hairline dark:border-nike-dark-card pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            System Notifications ({unreadCount} Unread)
          </h1>
          <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
            Live alerts for new rental applications, maintenance work orders, and scheduled reminders
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="bg-blue-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
        {notifications.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
            <p className="text-[14px] font-semibold text-nike-ink dark:text-white">All caught up!</p>
            <p className="text-xs text-nike-mute">No system notifications at this time.</p>
          </div>
        ) : (
          notifications.map(n => {
            const meta = getNotificationIcon(n.title, n.type);
            const IconComp = meta.icon;
            const displayTitle = removeEmojis(n.title);
            const displayMessage = removeEmojis(n.message);

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  n.isRead
                    ? 'bg-nike-canvas dark:bg-nike-dark-surface border-nike-hairline/60 dark:border-nike-dark-card opacity-80'
                    : 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/30 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-nike-ink dark:text-white">
                        {displayTitle}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.bg}`}>
                        {meta.badgeText}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-nike-mute dark:text-nike-stone leading-relaxed">
                      {displayMessage}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-nike-stone whitespace-nowrap shrink-0">
                  {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
