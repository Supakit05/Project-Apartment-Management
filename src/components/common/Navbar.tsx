import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sun, Moon, Shield, Menu, X, Building2, LogOut, User, LogIn,
  CalendarCheck, ChevronDown, Settings, AlertTriangle, Globe, Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.units'), path: '/rooms' },
    { name: t('nav.checkBooking'), path: '/check-booking' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setProfileDropdownOpen(false);
    toast.success(t('logout.success'));
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-nike-dark-surface/95 backdrop-blur-md border-b border-nike-hairline dark:border-nike-dark-card transition-colors duration-200">

        {/* PRIMARY NAV */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 bg-nike-ink dark:bg-white flex items-center justify-center rounded-xl text-white dark:text-nike-ink font-black text-sm tracking-tighter group-hover:scale-105 transition-transform">
              AS
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[16px] tracking-tight text-nike-ink dark:text-white uppercase leading-none">
                Apartment System
              </span>
              <span className="text-[10px] tracking-wider uppercase text-nike-mute dark:text-nike-stone font-semibold mt-0.5">
                Bangkok Living
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[15px] font-semibold tracking-tight transition-all py-1.5 border-b-2 ${
                  isActive(link.path)
                    ? 'border-nike-ink text-nike-ink dark:border-white dark:text-white font-bold'
                    : 'border-transparent text-nike-mute dark:text-nike-stone hover:text-nike-ink dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* RIGHT CONTROLS */}
          <div className="hidden md:flex items-center gap-3">

            {/* LANGUAGE SWITCHER */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nike-soft-cloud hover:bg-neutral-200 dark:bg-nike-dark-elevated dark:hover:bg-neutral-800 text-nike-ink dark:text-white text-xs font-bold transition-all active:scale-95 border border-nike-hairline dark:border-nike-dark-card"
              title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'th' ? 'TH' : 'EN'}</span>
            </button>

            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-nike-soft-cloud hover:bg-neutral-200 dark:bg-nike-dark-elevated dark:hover:bg-neutral-800 text-nike-ink dark:text-white transition-all active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-nike-ink" />
              )}
            </button>

            {/* AUTH STATUS / DROPDOWN */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* PROFILE PILL BUTTON */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 border ${
                    profileDropdownOpen
                      ? 'bg-nike-ink text-white dark:bg-white dark:text-nike-ink border-transparent shadow-md'
                      : 'bg-nike-soft-cloud hover:bg-neutral-200 dark:bg-nike-dark-elevated dark:hover:bg-neutral-800 text-nike-ink dark:text-white border-nike-hairline dark:border-nike-dark-card'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold">
                    <User className="w-3 h-3" />
                  </div>
                  <span>{user?.fullname || 'My Account'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* FLOATING DROPDOWN MENU */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-nike-dark-elevated rounded-2xl border border-nike-hairline dark:border-nike-dark-card shadow-xl py-1.5 z-50 animate-fadeIn">
                    
                    {/* USER HEADER INFO */}
                    <div className="px-3 py-1.5 border-b border-nike-hairline dark:border-neutral-800 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-[11px] text-nike-ink dark:text-white block truncate">
                          {user?.fullname}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shrink-0 ${
                          user?.role === 'admin' ? 'bg-nike-ink dark:bg-white text-white dark:text-nike-ink' : 'bg-nike-success text-white'
                        }`}>
                          {user?.role === 'admin' ? 'Admin' : 'Resident'}
                        </span>
                      </div>
                      <span className="text-[9px] text-nike-mute dark:text-nike-stone block truncate">
                        {user?.email}
                      </span>
                    </div>

                    {/* MENU LINKS */}
                    <div className="py-1 space-y-0.5 text-[11px] font-semibold text-nike-ink dark:text-white">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-nike-soft-cloud dark:hover:bg-neutral-800 transition-colors rounded-lg mx-1"
                      >
                        <User className="w-3.5 h-3.5 text-nike-mute shrink-0" />
                        <span className="truncate">{t('nav.myProfile')}</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-nike-soft-cloud dark:hover:bg-neutral-800 transition-colors rounded-lg mx-1"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-nike-mute shrink-0" />
                        <span className="truncate">{t('nav.myBookings')}</span>
                      </Link>

                      <Link
                        to="/my-maintenance"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-nike-soft-cloud dark:hover:bg-neutral-800 transition-colors rounded-lg mx-1 text-rose-600 dark:text-rose-400"
                      >
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t('nav.myMaintenance')}</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-nike-soft-cloud dark:hover:bg-neutral-800 transition-colors rounded-lg mx-1 text-blue-600 dark:text-blue-400 font-bold"
                        >
                          <Shield className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{t('nav.adminPanel')}</span>
                        </Link>
                      )}
                    </div>

                    {/* LOGOUT BUTTON IN DROPDOWN */}
                    <div className="pt-1 border-t border-nike-hairline dark:border-neutral-800 px-1.5">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-nike-sale hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('nav.signOut')}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-nike-ink hover:bg-neutral-800 dark:bg-white dark:text-nike-ink dark:hover:bg-neutral-200 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" /> {t('nav.signIn')}
              </Link>
            )}
          </div>

          {/* MOBILE MENU CONTROLS */}
          <div className="flex items-center gap-2 md:hidden">

            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-full bg-nike-soft-cloud dark:bg-nike-dark-elevated text-[11px] font-bold text-nike-ink dark:text-white active:scale-95 transition-all flex items-center gap-1 border border-nike-hairline dark:border-nike-dark-card"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{language.toUpperCase()}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-nike-soft-cloud dark:bg-nike-dark-elevated text-nike-ink dark:text-white active:scale-95 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-nike-ink" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-nike-ink dark:text-white hover:bg-nike-soft-cloud dark:hover:bg-nike-dark-elevated transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-nike-dark-surface border-t border-nike-hairline dark:border-nike-dark-card px-6 pt-4 pb-8 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-[15px] font-semibold text-nike-ink dark:text-white py-2 ${
                  isActive(link.path) ? 'font-bold underline underline-offset-4' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-nike-hairline dark:border-nike-dark-card space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="bg-nike-soft-cloud dark:bg-nike-dark-elevated p-3 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-nike-ink dark:text-white">{user?.fullname}</span>
                      <span className="text-[10px] text-nike-mute">{user?.email}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-2 text-xs font-semibold bg-white dark:bg-nike-dark-card rounded-xl border border-nike-hairline dark:border-neutral-700"
                      >
                        {t('nav.myProfile')}
                      </Link>
                      <Link
                        to="/my-bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-2 text-xs font-semibold bg-white dark:bg-nike-dark-card rounded-xl border border-nike-hairline dark:border-neutral-700"
                      >
                        {t('nav.myBookings')}
                      </Link>
                      <Link
                        to="/my-maintenance"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-2 text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900"
                      >
                        {t('nav.myMaintenance')}
                      </Link>
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center bg-nike-ink text-white dark:bg-white dark:text-nike-ink py-3 font-bold text-xs rounded-full shadow-xs uppercase tracking-wider"
                    >
                      {t('nav.adminPanel')}
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="block w-full text-center text-xs text-nike-sale font-bold py-3 bg-rose-50 dark:bg-rose-950/30 rounded-full border border-rose-200 dark:border-rose-900"
                  >
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <div className="pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-nike-ink dark:bg-white text-white dark:text-nike-ink py-3 font-bold text-xs rounded-full shadow-xs uppercase tracking-wider active:scale-95 transition-transform"
                  >
                    <LogIn className="w-4 h-4" /> {t('nav.signIn')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* GLOBAL CONFIRM LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/50 text-nike-sale flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-nike-ink dark:text-white uppercase tracking-tight">
                {t('logout.confirmTitle')}
              </h3>
              <p className="text-xs text-nike-mute dark:text-nike-stone leading-relaxed">
                {t('logout.confirmDesc')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-nike-soft-cloud hover:bg-neutral-200 dark:bg-nike-dark-card dark:hover:bg-neutral-700 text-nike-ink dark:text-white font-bold py-3 rounded-full text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                {t('logout.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 bg-nike-sale hover:bg-rose-700 text-white font-bold py-3 rounded-full text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
              >
                {t('logout.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
