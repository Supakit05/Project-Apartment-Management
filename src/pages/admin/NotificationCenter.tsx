import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, FileText, Wrench, Clock, CheckCircle2,
  ArrowUpRight, Check, Trash2
} from 'lucide-react';
import { AppNotification } from '../../types';
import { getNotifications, markNotificationsRead, markNotificationAsRead, deleteNotification } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

const removeEmojis = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/^[\s\u200B\uFEFF\u00A0\u2000-\u200A\u202F\u205F\u3000]+/g, '')
    .trim();
};

export const getNotificationTargetUrl = (title: string, message?: string, type?: string): string => {
  const text = `${title} ${message || ''}`.toLowerCase();
  if (text.includes('booking') || text.includes('rental application') || text.includes('คำขอจอง') || text.includes('ใบสมัคร') || type === 'booking') {
    return '/admin/bookings';
  }
  if (text.includes('maintenance') || text.includes('repair') || text.includes('แจ้งซ่อม') || text.includes('ซ่อมบำรุง') || text.includes('reminder') || text.includes('เตือน') || type === 'warning') {
    return '/admin/maintenance';
  }
  if (text.includes('bill') || text.includes('invoice') || text.includes('utility') || text.includes('payment') || text.includes('ค่าน้ำ') || text.includes('ค่าไฟ') || text.includes('บิล')) {
    return '/admin/utility-bills';
  }
  if (text.includes('tenant') || text.includes('lease') || text.includes('ผู้เช่า') || text.includes('สัญญา')) {
    return '/admin/tenants';
  }
  if (text.includes('unit') || text.includes('room') || text.includes('ห้องพัก')) {
    return '/admin/rooms';
  }
  if (text.includes('building') || text.includes('อาคาร') || text.includes('ตึก')) {
    return '/admin/buildings';
  }
  return '/admin/dashboard';
};

const getTargetPageLabel = (targetUrl: string, language: string): string => {
  switch (targetUrl) {
    case '/admin/bookings':
      return language === 'th' ? 'ไปยังหน้ารายการจองห้องพัก' : 'View to Bookings';
    case '/admin/maintenance':
      return language === 'th' ? 'ไปยังหน้ารายการแจ้งซ่อม' : 'View to Maintenance';
    case '/admin/utility-bills':
      return language === 'th' ? 'ไปยังหน้ารายการบิลค่าน้ำ-ไฟ' : 'View to Utility Bills';
    case '/admin/tenants':
      return language === 'th' ? 'ไปยังหน้าจัดการผู้เช่า' : 'View to Tenants';
    case '/admin/rooms':
      return language === 'th' ? 'ไปยังหน้าจัดการห้องพัก' : 'View to Units';
    case '/admin/buildings':
      return language === 'th' ? 'ไปยังหน้าจัดการอาคาร' : 'View to Buildings';
    default:
      return language === 'th' ? 'ไปยังหน้าแดชบอร์ด' : 'View to Dashboard';
  }
};

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
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
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent('notification-updated'));
      toast.success(language === 'th' ? 'ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว' : 'Marked all as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n: AppNotification) => {
    const targetUrl = getNotificationTargetUrl(n.title, n.message, n.type);

    if (!n.isRead) {
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      window.dispatchEvent(new CustomEvent('notification-updated'));
      try {
        await markNotificationAsRead(n.id);
      } catch (err) {
        console.error(err);
      }
    }

    navigate(targetUrl);
  };

  const handleMarkSingleRead = async (e: React.MouseEvent, n: AppNotification) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
    window.dispatchEvent(new CustomEvent('notification-updated'));
    try {
      await markNotificationAsRead(n.id);
      toast.success(language === 'th' ? 'ทำเครื่องหมายว่าอ่านแล้ว' : 'Marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(item => item.id !== id));
    window.dispatchEvent(new CustomEvent('notification-updated'));
    try {
      await deleteNotification(id);
      toast.success(language === 'th' ? 'ลบการแจ้งเตือนแล้ว' : 'Deleted notification');
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (title: string, type?: string) => {
    const cleaned = removeEmojis(title);
    if (cleaned.includes('Rental Application') || cleaned.includes('Booking') || cleaned.includes('จอง') || type === 'booking') {
      return {
        icon: FileText,
        bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20',
        badgeText: language === 'th' ? 'คำขอเช่า/จอง' : 'Application'
      };
    }
    if (cleaned.includes('Maintenance Request') || cleaned.includes('Repair') || cleaned.includes('ซ่อม') || type === 'warning') {
      return {
        icon: Wrench,
        bg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20',
        badgeText: language === 'th' ? 'แจ้งซ่อม' : 'Maintenance'
      };
    }
    if (cleaned.includes('Reminder') || cleaned.includes('Scheduled') || cleaned.includes('เตือน') || type === 'info') {
      return {
        icon: Clock,
        bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20',
        badgeText: language === 'th' ? 'การแจ้งเตือน' : 'Reminder'
      };
    }
    return {
      icon: Bell,
      bg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20',
      badgeText: language === 'th' ? 'ระบบ' : 'System'
    };
  };

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nike-hairline dark:border-nike-dark-card pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            {t('notif.title')} {unreadCount > 0 && (
              <span className="text-sm font-semibold bg-rose-500 text-white px-2.5 py-0.5 rounded-full">
                {unreadCount} {t('notif.unread')}
              </span>
            )}
          </h1>
          <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
            {t('notif.sub')}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="bg-blue-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> {t('notif.markAllRead')}
          </button>
        )}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-4 sm:p-6 space-y-3 shadow-xs">
        {notifications.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
            <p className="text-[14px] font-semibold text-nike-ink dark:text-white">{t('notif.emptyTitle')}</p>
            <p className="text-xs text-nike-mute">{t('notif.emptyDesc')}</p>
          </div>
        ) : (
          notifications.map(n => {
            const meta = getNotificationIcon(n.title, n.type);
            const IconComp = meta.icon;
            const displayTitle = removeEmojis(n.title);
            const displayMessage = removeEmojis(n.message);
            const targetUrl = getNotificationTargetUrl(n.title, n.message, n.type);
            const targetLabel = getTargetPageLabel(targetUrl, language);

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group hover:shadow-md ${
                  n.isRead
                    ? 'bg-nike-canvas dark:bg-nike-dark-surface border-nike-hairline/60 dark:border-nike-dark-card opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 shadow-2xs'
                }`}
              >
                {/* Left icon + text */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm text-nike-ink dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${!n.isRead ? 'font-extrabold' : ''}`}>
                        {displayTitle}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.bg}`}>
                        {meta.badgeText}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" title="Unread"></span>
                      )}
                    </div>
                    <p className="text-xs text-nike-mute dark:text-nike-stone leading-relaxed line-clamp-2">
                      {displayMessage}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-0.5 group-hover:underline">
                      <span>{targetLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Right controls: time and actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-nike-stone whitespace-nowrap">
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkSingleRead(e, n)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        title={language === 'th' ? 'ทำเครื่องหมายว่าอ่านแล้ว' : 'Mark as read'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(e, n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title={language === 'th' ? 'ลบการแจ้งเตือนนี้' : 'Delete notification'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
