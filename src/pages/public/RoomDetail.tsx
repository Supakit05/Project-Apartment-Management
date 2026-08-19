import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Room } from '../../types';
import { getRoomById } from '../../services/api';
import {
  formatCurrency,
  getTranslatedRoomType,
  getTranslatedBedType,
  getTranslatedRoomDescription
} from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Check, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<'specs' | 'rules' | 'terms' | null>('specs');

  useEffect(() => {
    if (id) {
      getRoomById(id).then(res => {
        setRoom(res);
        if (res) {
          const gallery = typeof res.gallery === 'string'
            ? JSON.parse(res.gallery || '[]')
            : (Array.isArray(res.gallery) ? res.gallery : []);
          setSelectedImage(res.coverImage || gallery[0] || '/rooms/room_standard.png');
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-24 text-nike-mute font-medium">Loading unit specifications...</div>;
  }

  if (!room) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-nike-ink dark:text-white">Unit Not Found</h2>
        <Link to="/rooms" className="text-xs font-bold text-nike-ink dark:text-white underline">
          {t('room.backToUnits')}
        </Link>
      </div>
    );
  }

  const displayRoomTitle = language === 'th' ? `ห้อง ${room.roomNumber}` : `Unit ${room.roomNumber}`;
  const amenitiesList: string[] = typeof room.amenities === 'string'
    ? JSON.parse(room.amenities || '[]')
    : (Array.isArray(room.amenities) ? room.amenities : []);

  const galleryList: string[] = typeof room?.gallery === 'string'
    ? JSON.parse(room.gallery || '[]')
    : (Array.isArray(room?.gallery) ? room.gallery : []);

  const allImages: string[] = Array.from(new Set([room?.coverImage, ...galleryList])).filter((img): img is string => Boolean(img));
  const isAvailable = room.status === 'Available';

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Available': return t('common.available');
      case 'Reserved': return t('common.reserved');
      case 'Occupied': return t('common.occupied');
      default: return status;
    }
  };

  const handleBookClick = () => {
    if (!isAuthenticated) {
      toast.info(language === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำการจองห้องพัก' : 'Please sign in before booking a unit');
      navigate('/login');
      return;
    }
    navigate(`/booking/${room.id}`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 space-y-10">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-medium text-nike-mute dark:text-nike-stone">
        <Link to="/" className="hover:text-nike-ink dark:hover:text-white transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/rooms" className="hover:text-nike-ink dark:hover:text-white transition-colors">{t('nav.units')}</Link>
        <span>/</span>
        <span className="text-nike-ink dark:text-white font-bold">{displayRoomTitle}</span>
      </div>

      {/* PDP 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT 7 COLS: PHOTO GALLERY */}
        <div className="lg:col-span-7 space-y-4">
          {/* MAIN STAGE */}
          <div className="relative w-full h-[420px] sm:h-[500px] rounded-3xl overflow-hidden bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card flex items-center justify-center">
            <img
              src={selectedImage || room.coverImage || '/rooms/room_standard.png'}
              alt={displayRoomTitle}
              className="w-full h-full object-cover transition-all duration-500"
            />
            
            {/* FLOATING STATUS PILL */}
            <div className="absolute top-4 left-4">
              <span className="bg-nike-ink/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-nike-ink text-xs font-bold px-4 py-1.5 rounded-full shadow-xs">
                {t('common.floor')} {room.floor} · {displayRoomTitle}
              </span>
            </div>

            <div className="absolute top-4 right-4">
              <span className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-xs ${
                isAvailable ? 'bg-nike-success text-white' : room.status === 'Reserved' ? 'bg-amber-500 text-white' : 'bg-nike-sale text-white'
              }`}>
                {getStatusText(room.status)}
              </span>
            </div>
          </div>

          {/* THUMBNAIL SELECTOR STRIP */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-28 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all active:scale-95 ${
                    selectedImage === imgUrl ? 'border-nike-ink dark:border-white ring-2 ring-nike-ink/20 dark:ring-white/20' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* ROOM DESCRIPTION */}
          <div className="bg-nike-soft-cloud dark:bg-nike-dark-elevated p-6 rounded-3xl border border-nike-hairline dark:border-nike-dark-card space-y-2">
            <h4 className="text-xs font-bold text-nike-ink dark:text-white">{t('room.description')}</h4>
            <p className="text-xs text-nike-charcoal dark:text-nike-stone leading-relaxed">
              {getTranslatedRoomDescription(room.description, room.floor, language)}
            </p>
          </div>
        </div>

        {/* RIGHT 5 COLS: SPECIFICATIONS & BOOKING CHROME */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* HEADER BLOCK */}
          <div className="space-y-2 pb-6 border-b border-nike-hairline dark:border-nike-dark-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                room.buildingId === 'bld-2' || room.roomNumber.startsWith('B')
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}>
                {room.buildingId === 'bld-2' || room.roomNumber.startsWith('B') 
                  ? (language === 'th' ? 'อาคาร B (Victory Residence B)' : 'Building B (Victory Residence B)')
                  : (language === 'th' ? 'อาคาร A (Victory Tower A)' : 'Building A (Victory Tower A)')}
              </span>
              <span className="text-xs font-semibold text-nike-mute dark:text-nike-stone">
                {getTranslatedRoomType(room.roomType, language)} · {t('common.floor')} {room.floor}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-nike-ink dark:text-white">
              {displayRoomTitle}
            </h1>
            
            {/* PRICE DISPLAY */}
            <div className="pt-2">
              <span className="text-3xl font-bold text-nike-ink dark:text-white">
                {formatCurrency(room.price)}
              </span>
              <span className="text-xs text-nike-mute dark:text-nike-stone font-medium ml-2">{t('room.perMonth')}</span>
            </div>
          </div>

          {/* KEY METRICS GRID */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-nike-soft-cloud dark:bg-nike-dark-elevated rounded-2xl border border-nike-hairline dark:border-nike-dark-card">
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-nike-mute dark:text-nike-stone block">{t('room.sqm')}</span>
              <span className="font-bold text-sm text-nike-ink dark:text-white">{room.sizeSqm} m²</span>
            </div>
            <div className="space-y-1 border-l border-nike-hairline dark:border-neutral-700 pl-3">
              <span className="text-[10px] font-medium text-nike-mute dark:text-nike-stone block">{t('room.bedLabel')}</span>
              <span className="font-bold text-sm text-nike-ink dark:text-white line-clamp-1">{getTranslatedBedType(room.bedType, language)}</span>
            </div>
            <div className="space-y-1 border-l border-nike-hairline dark:border-neutral-700 pl-3">
              <span className="text-[10px] font-medium text-nike-mute dark:text-nike-stone block">{t('room.guestsLabel')}</span>
              <span className="font-bold text-sm text-nike-ink dark:text-white">{room.capacity}</span>
            </div>
          </div>

          {/* AMENITIES PILL CHIPS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-nike-ink dark:text-white">
              {t('room.amenities')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((item: string, i: number) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-nike-soft-cloud dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white inline-flex items-center gap-1.5"
                >
                  <Check className="w-3 h-3 text-nike-success" /> {item}
                </span>
              ))}
            </div>
          </div>

          {/* PRIMARY BOOKING CTA */}
          <div className="pt-2 space-y-3">
            {isAvailable ? (
              <button
                type="button"
                onClick={handleBookClick}
                className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full text-sm transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" /> {t('room.applyNow')}
              </button>
            ) : (
              <div className="w-full text-center bg-nike-soft-cloud dark:bg-nike-dark-elevated text-nike-mute font-bold py-4 rounded-full text-xs border border-nike-hairline dark:border-neutral-700">
                {getStatusText(room.status)}
              </div>
            )}
            <p className="text-[11px] text-center text-nike-mute dark:text-nike-stone">
              {t('room.depositNote')}
            </p>
          </div>

          {/* PDP DISCLOSURE ACCORDIONS */}
          <div className="pt-4 border-t border-nike-hairline dark:border-nike-dark-card divide-y divide-nike-hairline dark:divide-nike-dark-card">
            
            {/* ACCORDION 1 */}
            <div className="py-4">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                className="w-full flex items-center justify-between text-xs font-bold text-nike-ink dark:text-white text-left"
              >
                <span>{t('room.termsTitle')}</span>
                {openAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'specs' && (
                <div className="pt-3 text-xs text-nike-mute dark:text-nike-stone space-y-2 leading-relaxed">
                  <div className="flex justify-between">
                    <span>{t('room.termsLease')}</span>
                    <span className="font-semibold text-nike-ink dark:text-white">{t('room.termsLeaseVal')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('room.termsDeposit')}</span>
                    <span className="font-semibold text-nike-ink dark:text-white">{t('room.termsDepositVal')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('room.termsCam')}</span>
                    <span className="font-semibold text-nike-ink dark:text-white">{t('room.termsCamVal')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 2 */}
            <div className="py-4">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'rules' ? null : 'rules')}
                className="w-full flex items-center justify-between text-xs font-bold text-nike-ink dark:text-white text-left"
              >
                <span>{t('room.utilsTitle')}</span>
                {openAccordion === 'rules' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'rules' && (
                <div className="pt-3 text-xs text-nike-mute dark:text-nike-stone space-y-2 leading-relaxed">
                  <div className="flex justify-between">
                    <span>{t('room.utilsWater')}</span>
                    <span className="font-semibold text-nike-ink dark:text-white">{t('room.utilsWaterVal')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('room.utilsElec')}</span>
                    <span className="font-semibold text-nike-ink dark:text-white">{t('room.utilsElecVal')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('room.utilsWifi')}</span>
                    <span className="font-semibold text-nike-success">{t('room.utilsWifiVal')}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
