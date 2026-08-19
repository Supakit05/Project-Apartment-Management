import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Booking, Room, UtilityBill } from '../../types';
import { getUserBookings, getRooms, getUtilityBills } from '../../services/api';
import { formatCurrency, formatDate, getTranslatedRoomName, getTranslatedRoomType } from '../../utils/formatters';
import {
  Home, Building2, Calendar, Lock,
  FileText, UserCheck, RefreshCw, ShieldCheck,
  Receipt, Droplets, Zap, Printer, CheckCircle2, Clock
} from 'lucide-react';
import { ReceiptModal } from '../../components/admin/ReceiptModal';

export const MyApartmentPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [matchedRoom, setMatchedRoom] = useState<Room | null>(null);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<UtilityBill | null>(null);

  const loadTenantData = async () => {
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [userBookings, allRooms, allBills] = await Promise.all([
        getUserBookings(user.email),
        getRooms(),
        getUtilityBills(),
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

        // Filter utility bills for this unit
        const unitBills = allBills.filter(b => {
          if (room && b.roomId === room.id) return true;
          if (b.roomNumber && (
            b.roomNumber.toUpperCase() === cleanActiveNum.toUpperCase() ||
            b.roomNumber.replace(/[^0-9]/g, '') === cleanActiveNum.replace(/[^0-9]/g, '')
          )) return true;
          if (b.tenantName && active.guestName && b.tenantName.toLowerCase().includes(active.guestName.toLowerCase())) return true;
          return false;
        });

        setBills(unitBills);
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

      {/* UTILITY BILLS & OFFICIAL RECEIPTS SECTION */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nike-hairline dark:border-nike-dark-card pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-nike-ink dark:text-white">
                {language === 'th' ? 'บิลค่าน้ำ-ไฟ & ใบเสร็จรับเงินประจำห้อง' : 'Utility Bills & Official Receipts'}
              </h2>
              <p className="text-xs text-nike-mute dark:text-nike-stone mt-1">
                {language === 'th' 
                  ? 'แจกแจงค่าเช่า, ค่าน้ำประปา (ตามมิเตอร์จริง), ค่าไฟฟ้า (ตามมิเตอร์จริง), ค่าส่วนกลาง และพิมพ์ใบเสร็จรับเงิน' 
                  : 'Itemized rent, water and electric meter readings, maintenance fee, and official receipts.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 self-start sm:self-auto">
            {language === 'th' ? `ประวัติบิลทั้งหมด (${bills.length} รายการ)` : `Total Records (${bills.length})`}
          </span>
        </div>

        {bills.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-nike-soft-cloud/50 dark:bg-nike-dark-surface/50 border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            <Receipt className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {language === 'th' ? 'ยังไม่มีรายการบิลค่าน้ำ-ไฟในระบบ' : 'No utility bills issued for your unit yet'}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {language === 'th'
                ? 'ระบบจะทำการจดมิเตอร์และสรุปยอดบิลค่าน้ำ-ไฟทุกวันที่ 1 ของเดือน เมื่อชำระเงินเรียบร้อยแล้ว ท่านสามารถเข้ามาพิมพ์ใบเสร็จรับเงินทางการได้ที่นี่'
                : 'Meter readings and monthly billing are generated on the 1st of each month. Official receipts can be downloaded once payment is verified.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => {
              const waterUnits = Math.max(0, (bill.currWaterMeter || 0) - (bill.prevWaterMeter || 0));
              const electricUnits = Math.max(0, (bill.currElectricMeter || 0) - (bill.prevElectricMeter || 0));
              const isPaid = bill.status === 'Paid';
              const invoiceDisplay = bill.invoiceNo || (bill.id ? `INV-${bill.id.toUpperCase()}` : 'INV-202608');

              return (
                <div
                  key={bill.id}
                  className="p-5 rounded-2xl border border-nike-hairline dark:border-nike-dark-card bg-nike-soft-cloud/30 dark:bg-nike-dark-surface/50 hover:shadow-xs transition-all space-y-4"
                >
                  {/* BILL HEADER ROW */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">
                        {bill.billingMonth}
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        #{invoiceDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {language === 'th' ? `ชำระแล้ว ${bill.paymentDate ? `(${formatDate(bill.paymentDate)})` : ''}` : `Paid ${bill.paymentDate ? `(${formatDate(bill.paymentDate)})` : ''}`}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            {language === 'th' ? 'รอการชำระเงิน' : 'Pending Payment'}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* ITEMIZED BREAKDOWN GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* 1. ROOM RENT */}
                    <div className="p-4 rounded-xl bg-white dark:bg-nike-dark-card/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Home className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 font-bold">
                          {language === 'th' ? 'ค่าเช่าห้องพัก' : 'Room Rent'}
                        </span>
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white block">
                          {formatCurrency(bill.rentAmount || 0)}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {language === 'th' ? 'รอบสัญญา 1 เดือน' : '1 Month Period'}
                        </span>
                      </div>
                    </div>

                    {/* 2. WATER SUPPLY */}
                    <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Droplets className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-blue-700 dark:text-blue-300 font-bold">
                          {language === 'th' ? 'ค่าน้ำประปา' : 'Water Supply'}
                        </span>
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 block">
                          {formatCurrency(bill.waterAmount || 0)}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
                          {language === 'th' ? 'มิเตอร์:' : 'Meter:'} {bill.prevWaterMeter} ➔ {bill.currWaterMeter} ({waterUnits} {language === 'th' ? 'หน่วย @ 9฿' : 'units @ 9฿'})
                        </span>
                      </div>
                    </div>

                    {/* 3. ELECTRICITY */}
                    <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-100/80 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-amber-700 dark:text-amber-300 font-bold">
                          {language === 'th' ? 'ค่าไฟฟ้า' : 'Electricity Supply'}
                        </span>
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 block">
                          {formatCurrency(bill.electricAmount || 0)}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
                          {language === 'th' ? 'มิเตอร์:' : 'Meter:'} {bill.prevElectricMeter} ➔ {bill.currElectricMeter} ({electricUnits} {language === 'th' ? `หน่วย @ ${bill.electricRate || 4}฿` : `units @ ${bill.electricRate || 4}฿`})
                        </span>
                      </div>
                    </div>

                    {/* 4. COMMON AREA FEE */}
                    <div className="p-4 rounded-xl bg-white dark:bg-nike-dark-card/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 font-bold">
                          {language === 'th' ? 'ค่าบริการส่วนกลาง' : 'Common Area Fee'}
                        </span>
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white block">
                          {formatCurrency(bill.commonFee || 300)}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {language === 'th' ? 'ค่าบำรุงรักษาอาคาร' : 'Building maintenance'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BILL FOOTER ROW */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                        {language === 'th' ? 'ยอดรวมสุทธิประจำงวด:' : 'Total Amount Due:'}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(bill.totalAmount || 0)}
                      </span>
                    </div>

                    <div>
                      {isPaid ? (
                        <button
                          onClick={() => setSelectedBillForReceipt(bill)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          <Printer className="w-4 h-4" />
                          {language === 'th' ? 'ดูใบเสร็จรับเงิน (Official Receipt)' : 'View Official Receipt'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            {language === 'th' ? 'กรุณาติดต่อชำระเงินที่เคาน์เตอร์นิติบุคคล' : 'Please settle payment at property office'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRINTABLE RECEIPT MODAL */}
      {selectedBillForReceipt && (
        <ReceiptModal
          bill={selectedBillForReceipt}
          onClose={() => setSelectedBillForReceipt(null)}
        />
      )}

    </div>
  );
};
