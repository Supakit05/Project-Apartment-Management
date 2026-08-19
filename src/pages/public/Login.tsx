import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, Mail, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/rooms');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-8 sm:p-10 rounded-3xl space-y-6 shadow-xl">
        
        {/* TITLE */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-xs text-nike-mute dark:text-nike-stone">
            {t('auth.loginSub')}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-nike-ink dark:text-white block">
              {t('profile.email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-nike-mute dark:text-nike-stone absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'th' ? 'อีเมล' : 'Email Address'}
                className="w-full pl-11 pr-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-nike-ink dark:text-white block">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-nike-mute dark:text-nike-stone absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'th' ? 'รหัสผ่าน' : 'Password'}
                className="w-full pl-11 pr-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nike-ink hover:bg-neutral-800 dark:bg-white dark:text-nike-ink dark:hover:bg-neutral-200 text-white font-bold py-3.5 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2 cursor-pointer"
          >
            {loading ? (language === 'th' ? 'กำลังเข้าสู่ระบบ...' : 'Authenticating...') : (
              <>
                <LogIn className="w-4 h-4" /> {t('nav.signIn')}
              </>
            )}
          </button>
        </form>

        {/* FOOTER LINK */}
        <div className="text-center pt-3 border-t border-nike-hairline-soft dark:border-nike-dark-card">
          <p className="text-xs text-nike-mute dark:text-nike-stone">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-nike-ink dark:text-white font-bold underline hover:opacity-80">
              {t('nav.signUp')}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
