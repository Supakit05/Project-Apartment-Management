import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Save } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { t, language } = useLanguage();

  const [fullname, setFullname] = useState(user?.fullname || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  // Sync state when user changes
  React.useEffect(() => {
    if (user?.fullname) setFullname(user.fullname);
    if (user?.phone) setPhone(user.phone);
  }, [user?.fullname, user?.phone]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-nike-ink dark:text-white">
          {t('profile.title')}
        </h2>
        <p className="text-xs text-nike-mute">{language === 'th' ? 'กรุณาเข้าสู่ระบบก่อนดูข้อมูลโปรไฟล์' : 'Please sign in to view your profile'}</p>
        <Link
          to="/login"
          className="inline-block bg-nike-ink text-white dark:bg-white dark:text-nike-ink font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider shadow-sm"
        >
          {t('nav.signIn')}
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim()) {
      toast.error(language === 'th' ? 'กรุณากรอกชื่อ-นามสกุล' : 'Please enter your full name');
      return;
    }
    setSaving(true);
    try {
      const res = await updateProfile(fullname, phone);
      if (res.success) {
        toast.success(t('profile.savedSuccess'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 space-y-8">

      {/* HEADER */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-nike-mute dark:text-nike-stone">
          {t('profile.accountSettings')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-nike-ink dark:text-white uppercase tracking-tight">
          {t('profile.title')}
        </h1>
      </div>

      {/* PROFILE SUMMARY CARD */}
      <div className="bg-nike-soft-cloud dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-nike-ink dark:bg-white text-white dark:text-nike-ink font-black text-2xl flex items-center justify-center shadow-md shrink-0 uppercase tracking-tighter">
          {user.fullname ? user.fullname.substring(0, 2) : 'US'}
        </div>
        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-2xl font-extrabold text-nike-ink dark:text-white">{user.fullname}</h2>
            <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              user.role === 'admin' ? 'bg-nike-ink dark:bg-white text-white dark:text-nike-ink' : 'bg-nike-success text-white'
            }`}>
              {user.role === 'admin' ? t('profile.adminAccess') : t('profile.verifiedResident')}
            </span>
          </div>
          <p className="text-xs text-nike-mute dark:text-nike-stone">{user.email}</p>
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
        <h3 className="font-bold text-xs uppercase tracking-wider text-nike-ink dark:text-white border-b border-nike-hairline dark:border-neutral-800 pb-3">
          {t('profile.personalInfo')}
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-nike-ink dark:text-white uppercase tracking-wider block">
              {t('profile.fullname')} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-nike-mute dark:text-nike-stone absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder={language === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}
                className="w-full pl-11 pr-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-nike-ink dark:text-white uppercase tracking-wider block">
                {t('profile.email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-nike-mute dark:text-nike-stone absolute left-4 top-3.5" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-11 pr-4 py-3 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-neutral-800/60 border border-nike-hairline dark:border-nike-dark-card text-nike-mute dark:text-nike-stone cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-nike-ink dark:text-white uppercase tracking-wider block">
                {t('profile.phone')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-nike-mute dark:text-nike-stone absolute left-4 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}
                  className="w-full pl-11 pr-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-nike-hairline dark:border-neutral-800">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-nike-ink hover:bg-neutral-800 dark:bg-white dark:text-nike-ink dark:hover:bg-neutral-200 text-white font-bold px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? t('profile.saving') : t('profile.save')}
          </button>
        </div>
      </form>

    </div>
  );
};
