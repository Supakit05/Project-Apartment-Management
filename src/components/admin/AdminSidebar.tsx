import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileSignature, FileText, Wrench,
  BedDouble, History, Bell, ArrowLeft, Building2, CalendarCheck,
  Sun, Moon, Menu, X, Globe
} from 'lucide-react';
import { getNotifications, getBookings } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const notifs = await getNotifications();
        setUnreadNotifCount(notifs.filter(n => !n.isRead).length);

        const bookings = await getBookings();
        setPendingBookingCount(bookings.filter(b => b.status === 'Pending').length);
      } catch (err) {
        console.error('Failed to fetch sidebar counts:', err);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: t('admin.nav.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('admin.nav.buildings'), path: '/admin/buildings', icon: Building2 },
    { name: t('admin.nav.tenants'), path: '/admin/tenants', icon: FileSignature },
    { name: t('admin.nav.utilityBills'), path: '/admin/utility-bills', icon: FileText },
    { name: t('admin.nav.maintenance'), path: '/admin/maintenance', icon: Wrench },
    { name: t('admin.nav.rooms'), path: '/admin/rooms', icon: BedDouble },
    { name: t('admin.nav.bookings'), path: '/admin/bookings', icon: CalendarCheck, badge: pendingBookingCount },
    { name: t('admin.nav.activityLog'), path: '/admin/activity-log', icon: History },
    { name: t('admin.nav.notifications'), path: '/admin/notifications', icon: Bell, badge: unreadNotifCount },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-40 bg-nike-ink text-white px-4 py-3 border-b border-neutral-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white text-nike-ink font-black text-xs flex items-center justify-center rounded-xl tracking-tighter">
            AS
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white uppercase tracking-tight">Apartment System</h2>
            <span className="text-[10px] text-nike-stone uppercase tracking-wider">{t('admin.nav.controlPanel')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-full bg-neutral-800 text-white text-[11px] font-bold active:scale-95 flex items-center gap-1 border border-neutral-700"
            title="Toggle Language"
          >
            <Globe className="w-3 h-3 text-blue-400" />
            <span>{language.toUpperCase()}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-neutral-800 text-amber-400 active:scale-95"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Moon className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-full bg-neutral-800 text-white active:scale-95"
            aria-label="Toggle Admin Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE SCROLLABLE TAB STRIP */}
      <nav className="md:hidden bg-nike-ink px-3 py-2 border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full shrink-0 transition-all ${
                active
                  ? 'bg-white text-nike-ink shadow-xs'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name.split(' ')[0]}</span>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="w-4 h-4 rounded-full bg-nike-sale text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="bg-nike-ink text-white p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white text-nike-ink font-black text-xs flex items-center justify-center rounded-xl">
                AM
              </div>
              <span className="font-extrabold text-sm uppercase tracking-tight">Admin Menu</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-full bg-neutral-800 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-2 overflow-y-auto flex-1 bg-nike-ink">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                    active
                      ? 'bg-white text-nike-ink shadow-md'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-nike-sale text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded-full uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Public Site
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-nike-ink text-white shrink-0 flex-col min-h-screen border-r border-neutral-800 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 space-y-5">
          
          {/* HEADER LOGO */}
          <div className="pb-4 border-b border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-white text-nike-ink font-black text-sm flex items-center justify-center rounded-xl shadow-xs tracking-tighter">
              AS
            </div>
            <div>
              <h2 className="text-[14px] font-extrabold text-white uppercase tracking-tight leading-tight">
                Apartment System
              </h2>
              <span className="text-[10px] text-nike-stone uppercase tracking-wider font-semibold leading-none">
                Admin Control
              </span>
            </div>
          </div>

          {/* NAV ITEMS */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                    active
                      ? 'bg-white text-nike-ink shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>

                  {Boolean(item.badge && item.badge > 0) && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      active ? 'bg-nike-ink text-white' : 'bg-nike-sale text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* UTILITY CONTROLS (PLACED DIRECTLY UNDER NAVIGATION) */}
          <div className="pt-4 border-t border-neutral-800 space-y-2.5">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-between w-full bg-neutral-800/80 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-colors active:scale-95"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'th' ? 'ภาษาไทย (TH)' : 'English (EN)'}</span>
              </span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-700">
                {language.toUpperCase()}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full bg-neutral-800/80 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-colors active:scale-95"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <Moon className="w-3.5 h-3.5 text-white" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-700">
                {theme}
              </span>
            </button>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-neutral-800/80 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {t('admin.nav.backToPublic')}
            </Link>
          </div>

        </div>
      </aside>
    </>
  );
};
