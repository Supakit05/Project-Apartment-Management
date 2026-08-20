import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <footer className="bg-nike-ink text-white border-t border-nike-dark-card mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16">
        
        {/* 4-COLUMN NIKE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
          
          {/* COL 1: BRAND EDITORIAL */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white flex items-center justify-center rounded-xl text-nike-ink font-black text-xs tracking-tighter">
                AS
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white uppercase">
                Apartment System
              </span>
            </div>
            <p className="text-xs text-nike-stone leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* COL 2: RESIDENTIAL UNITS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('nav.units')}</h4>
            <ul className="space-y-2.5 text-xs text-nike-stone font-medium">
              <li><Link to="/rooms" className="hover:text-white transition-colors">{language === 'th' ? 'สตูดิโอ - เตียงเดี่ยว (26-28 ตร.ม.)' : 'Studio - Single Bed (26-28 sqm)'}</Link></li>
              <li><Link to="/rooms" className="hover:text-white transition-colors">{language === 'th' ? 'สตูดิโอ - เตียงคู่ (32-35 ตร.ม.)' : 'Studio - Double Bed (32-35 sqm)'}</Link></li>
              <li><Link to="/rooms" className="hover:text-white transition-colors">{language === 'th' ? '1 ห้องนอน (42-46 ตร.ม.)' : '1-Bedroom (42-46 sqm)'}</Link></li>
              <li><Link to="/rooms" className="hover:text-white transition-colors">{language === 'th' ? 'ห้องมุมพิเศษ (52 ตร.ม.)' : 'Corner Room (52 sqm)'}</Link></li>
            </ul>
          </div>

          {/* COL 3: RESIDENT SERVICES */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('nav.checkBooking')}</h4>
            <ul className="space-y-2.5 text-xs text-nike-stone font-medium">
              <li><Link to="/check-booking" className="hover:text-white transition-colors">{t('track.title')}</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">{t('nav.signIn')}</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">{t('nav.signUp')}</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">{t('profile.title')}</Link></li>
            </ul>
          </div>

          {/* COL 4: CONTACT & LOCATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{language === 'th' ? 'ที่ตั้งและการติดต่อ' : 'Location & Contact'}</h4>
            <ul className="space-y-2.5 text-xs text-nike-stone">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>422 Phaya Thai Rd, Ratchathewi, Bangkok 10400</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <span>+66 2 123 4567 / 081-234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <span>contact@victoryapartment.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM FINE-PRINT BAR WITH LANGUAGE SWITCHER */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-nike-mute gap-4">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* LANGUAGE SWITCHER BUTTON IN FOOTER */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-all active:scale-95 border border-neutral-700 shadow-sm cursor-pointer"
              title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            >
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>{language === 'th' ? '🇹🇭 ภาษาไทย (TH)' : '🇺🇸 English (EN)'}</span>
            </button>

            <span className="text-neutral-400">&copy; 2026 Apartment System Bangkok. {t('footer.rights')}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-neutral-400 font-medium">ITDS323 Practical DevOps and Applications</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
