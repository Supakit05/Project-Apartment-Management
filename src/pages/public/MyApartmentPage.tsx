import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Booking, Room } from '../../types';
import { getUserBookings, getRooms } from '../../services/api';
import { formatCurrency, formatDate, getTranslatedRoomName, getTranslatedRoomType } from '../../utils/formatters';
import {
  Home, Building2, Calendar, Lock,
  FileText, UserCheck, RefreshCw, ShieldCheck
} from 'lucide-react';

export const MyApartmentPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [matchedRoom, setMatchedRoom] = useState<Room | null>(null);

  const loadTenantData = async () => {
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [userBookings, allRooms] = await Promise.all([
        getUserBookings(user.email),
        getRooms(),
      ]);

      // Find an approved or active booking for this user
      const active = userBookings.find(b => b.status === 'Approved' || b.status === 'Completed' || b.status === 'Pending') || userBookings[0] || null;
      setActiveBooking(active);

      if (active) {
        const cleanActiveNum = (active.roomNumber || '').trim();
        const room = allRooms.find(r => 
          (active.roomId && r.id === active.roomId) || 
          r.roomNumber.toUpperCase() === cleanActiveNum.toUpperCase()
        ) || allRooms.find(r =>
          r.roomNumber.replace(/[^0-9]/g, '') === cleanActiveNum.replace(/[^0-9]/g, '') &&
          r.buildingName?.includes(cleanActiveNum.startsWith('B') ? 'B' : 'A')
        ) || allRooms.find(r => r.roomNumber === cleanActiveNum);

        setMatchedRoom(room || null);
      }
    } catch (err) {
      console.error('Failed to load tenant apartment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, [isAuthenticated, user?.email]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
          {language === 'th' ? 'กรุณาเข้าสู่ระบบเพื่อใช้งานระบบห้องพักของฉัน' : 'Please Sign In to Access Your Unit Portal'}
        </h1>
        <p className="text-sm text-nike-mute dark:text-nike-stone max-w-md mx-auto">
          {language === 'th' ? 'เข้าสู่ระบบด้วยบัญชีผู้พักอาศัยเพื่อดูสัญญาเช่าและรายละเอียดห้องพักของคุณ' : 'Sign in to access your active rental agreement and unit specifications.'}
        </p>
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full text-sm shadow-md transition-all cursor-pointer"
          >
            {t('nav.signIn')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm font-medium text-nike-mute dark:text-nike-stone">
          {language === 'th' ? 'กำลังโหลดข้อมูลห้องพักและสัญญาเช่าของคุณ...' : 'Loading your resident portal...'}
        </p>
      </div>
    );
  }

  if (!activeBooking) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Home className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
          {language === 'th' ? 'คุณยังไม่มีสัญญาห้องพักในขณะนี้' : 'No Active Residence Found'}
        </h1>
        <p className="text-sm text-nike-mute dark:text-nike-stone max-w-md mx-auto leading-relaxed">
          {language === 'th' 
            ? 'คุณยังไม่มีประวัติการจองห้องพักที่ได้รับการอนุมัติ สามารถเลือกดูห้องพักว่างและส่งคำขอจองห้องเพื่อเปิดใช้งานระบบผู้พักอาศัย'
            : 'You do not have an active or verified lease yet. Explore our available units and submit an application.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/check-booking"
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {t('nav.checkBooking')}
          </Link>
          <Link
            to="/rooms"
            className="px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {t('nav.units')}
          </Link>
        </div>
      </div>
    );
  }

  const roomNum = activeBooking.roomNumber || matchedRoom?.roomNumber || '101';
  const isBuildingB = roomNum.toUpperCase().startsWith('B') || matchedRoom?.buildingName?.includes('B');
  const buildingDisplay = language === 'en' 
    ? (isBuildingB ? 'Building B (Victory Residence B)' : 'Building A (Victory Tower A)') 
    : (isBuildingB ? 'อาคาร B (Victory Residence B)' : 'อาคาร A (Victory Tower A)');

  const isLeaseActive = activeBooking.status === 'Approved' || activeBooking.status === 'Completed';

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nike-hairline dark:border-nike-dark-card pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === 'th' ? 'ผู้เช่าที่ยืนยันแล้ว' : 'Verified Resident'}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isLeaseActive 
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                : activeBooking.status === 'Cancelled' || activeBooking.status === 'Rejected'
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                  : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            }`}>
              {isLeaseActive 
                ? (language === 'th' ? 'สัญญาใช้งานอยู่' : 'Active Lease')
                : activeBooking.status === 'Cancelled'
                  ? (language === 'th' ? 'ยกเลิกการจองแล้ว' : 'Booking Cancelled')
                  : activeBooking.status === 'Rejected'
                    ? (language === 'th' ? 'ไม่อนุมัติการจอง' : 'Booking Rejected')
                    : (language === 'th' ? 'รออนุมัติการจอง' : 'Pending Approval')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white mt-2 flex items-center gap-2">
            <Home className="w-7 h-7 text-blue-600" />
            {language === 'th' ? `ห้องพักของฉัน (${t('common.unit')} ${roomNum})` : `My Apartment (${t('common.unit')} ${roomNum})`}
          </h1>
          <p className="text-xs sm:text-sm text-nike-mute dark:text-nike-stone mt-1">
            {buildingDisplay} · {language === 'th' ? 'ระบบจัดการข้อมูลผู้พักอาศัยและสัญญาเช่า' : 'Resident Information & Rental Agreement'}
          </p>
        </div>
      </div>

      {/* UNIT BANNER CARD */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {matchedRoom?.coverImage ? (
              <img
                src={matchedRoom.coverImage}
                alt={`Unit ${roomNum}`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-nike-hairline dark:border-nike-dark-card shadow-sm shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                <Building2 className="w-12 h-12" />
              </div>
            )}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
                {t('common.unit')} {roomNum} · {buildingDisplay}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-nike-ink dark:text-white">
                {matchedRoom ? getTranslatedRoomName(matchedRoom.roomName, matchedRoom.roomNumber, language) : `${t('common.unit')} ${roomNum}`}
              </h2>
              <p className="text-xs text-nike-mute dark:text-nike-stone font-medium">
                {matchedRoom?.roomType ? getTranslatedRoomType(matchedRoom.roomType, language) : 'Studio'} · {matchedRoom?.sizeSqm || 28} m² ({matchedRoom?.capacity || 2} {language === 'th' ? 'ท่าน' : 'Guests'})
              </p>
            </div>
          </div>

          <div className="bg-nike-soft-cloud dark:bg-nike-dark-surface p-4 rounded-2xl border border-nike-hairline dark:border-nike-dark-card text-left md:text-right shrink-0 w-full md:w-auto">
            <span className="text-xs text-nike-mute dark:text-nike-stone font-medium block">{t('roomMgmt.rent')}</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
              {formatCurrency(matchedRoom?.price || activeBooking.totalPrice || 6500)}
            </span>
            <span className="text-[11px] text-nike-stone font-medium block mt-0.5">/{t('common.month')}</span>
          </div>
        </div>

        {/* LEASE & RESIDENT SPECS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-nike-hairline dark:border-nike-dark-card">
          <div className="p-4 bg-nike-soft-cloud/60 dark:bg-nike-dark-surface/60 rounded-2xl border border-nike-hairline dark:border-nike-dark-card">
            <span className="text-xs text-nike-mute dark:text-nike-stone font-medium block">{t('tnt.colPeriod')}</span>
            <span className="text-sm font-bold text-nike-ink dark:text-white block mt-1">
              {formatDate(activeBooking.checkIn)} – {formatDate(activeBooking.checkOut)}
            </span>
          </div>

          <div className="p-4 bg-nike-soft-cloud/60 dark:bg-nike-dark-surface/60 rounded-2xl border border-nike-hairline dark:border-nike-dark-card">
            <span className="text-xs text-nike-mute dark:text-nike-stone font-medium block">{language === 'th' ? 'ชื่อผู้เช่าในสัญญา' : 'Contract Resident'}</span>
            <span className="text-sm font-bold text-nike-ink dark:text-white block mt-1">
              {activeBooking.guestName}
            </span>
            <span className="text-[11px] text-nike-stone block mt-0.5">{activeBooking.guestPhone}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
