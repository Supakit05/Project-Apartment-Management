import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Booking, Room } from '../../types';
import { trackBookings, getUserBookings, cancelBooking, getRooms } from '../../services/api';
import { formatCurrency, getTranslatedRoomName } from '../../utils/formatters';
import {
  Search, CalendarCheck, Clock, CheckCircle2, XCircle, Ban,
  Phone, Mail, ArrowRight, RefreshCw, AlertCircle, BedDouble,
  CreditCard, DoorOpen, ExternalLink, Home, Check, X
} from 'lucide-react';
import { toast } from 'sonner';

export const CheckBookingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Load rooms data for matching unit photo and details
  useEffect(() => {
    getRooms().then(setRooms).catch(err => console.error('Failed to load rooms:', err));
  }, []);

  // Auto-search if user is logged in
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setQuery(user.email);
      setLoading(true);
      getUserBookings(user.email)
        .then(data => {
          setBookings(data);
          setHasSearched(true);
        })
        .catch(err => console.error('Error fetching bookings:', err))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, user?.email]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      toast.error(t('track.promptInput'));
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const results = await trackBookings(cleanQuery);
      setBookings(results);
      if (results.length === 0) {
        toast.info(t('track.noResults'));
      }
    } catch (err: any) {
      toast.error('Error verifying booking records');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('คุณต้องการยกเลิกคำขอจองห้องพักนี้ใช่หรือไม่?')) return;
    setCancellingId(bookingId);
    try {
      const res = await cancelBooking(bookingId);
      if (res) {
        toast.success('ยกเลิกคำขอจองเรียบร้อยแล้ว');
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
      } else {
        toast.error('ไม่สามารถยกเลิกคำขอจองได้');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการยกเลิกคำขอจอง');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-nike-success text-white shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('track.status.approved')}
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-nike-sale text-white shadow-xs">
            <XCircle className="w-3.5 h-3.5" /> {t('track.status.rejected')}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-500 text-white shadow-xs">
            <Ban className="w-3.5 h-3.5" /> {t('track.status.cancelled')}
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-xs animate-pulse">
            <Clock className="w-3.5 h-3.5" /> {t('track.status.pending')}
          </span>
        );
    }
  };

  const getRoomForBooking = (booking: Booking): Room | undefined => {
    if (booking.roomId) {
      const found = rooms.find(r => r.id === booking.roomId);
      if (found) return found;
    }
    if (booking.roomNumber) {
      const cleanNum = booking.roomNumber.trim();
      return rooms.find(r => 
        r.roomNumber === cleanNum ||
        r.roomNumber === `A${cleanNum}` ||
        r.roomNumber === `B${cleanNum}` ||
        r.roomNumber.replace(/^[AB]/i, '') === cleanNum.replace(/^[AB]/i, '')
      );
    }
    return undefined;
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 space-y-10">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-nike-ink dark:text-white">
          {isAuthenticated ? t('nav.myBookings') : t('track.title')}
        </h1>
        <p className="text-sm text-nike-mute dark:text-nike-stone max-w-lg mx-auto leading-relaxed">
          {isAuthenticated 
            ? (language === 'th' ? 'รายการห้องพักที่คุณได้ส่งคำขอจองไว้ สามารถติดตามสถานะการอนุมัติและชำระเงินมัดจำได้ที่นี่' : 'Your rental booking applications. Track approval status and deposit payments here.')
            : t('track.subtitle')}
        </p>
      </div>

      {/* SEARCH CARD (SHOWN FOR GUEST OR EXTRA SEARCH) */}
      <div className="bg-nike-soft-cloud dark:bg-nike-dark-elevated p-6 sm:p-8 rounded-3xl border border-nike-hairline dark:border-nike-dark-card shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-nike-mute dark:text-nike-stone absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('track.placeholder')}
              className="w-full pl-11 pr-4 py-3 text-sm font-medium rounded-full bg-white dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-nike-ink hover:bg-neutral-800 dark:bg-white dark:text-nike-ink dark:hover:bg-neutral-200 text-white font-semibold px-8 py-3 rounded-full text-sm transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{t('track.button')}</span>
          </button>
        </form>
      </div>

      {/* SEARCH RESULTS / BOOKING CARDS */}
      {loading ? (
        <div className="text-center py-20 text-nike-mute font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> {t('track.searching')}
        </div>
      ) : hasSearched && bookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-nike-dark-elevated rounded-3xl border border-nike-hairline dark:border-nike-dark-card space-y-4 shadow-sm p-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <DoorOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-nike-ink dark:text-white">
            {isAuthenticated 
              ? (language === 'th' ? 'คุณยังไม่มีประวัติการจองห้องพัก' : 'No Booking Applications Found') 
              : t('track.noResults')}
          </h3>
          <p className="text-sm text-nike-mute dark:text-nike-stone max-w-md mx-auto">
            {isAuthenticated 
              ? (language === 'th' ? 'คุณสามารถเลือกดูห้องพักว่างที่ท่านสนใจ และกดส่งคำขอจองพร้อมระบุวันที่ต้องการเข้าพักได้ทันที' : 'Browse available rooms and submit a booking application with your desired move-in date.')
              : t('track.noResultsDesc')}
          </p>
          <div className="pt-2">
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {language === 'th' ? 'ดูห้องพักทั้งหมดและเริ่มจอง' : 'Browse All Rooms & Book'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const matchedRoom = getRoomForBooking(booking);
            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* ROOM & UNIT PHOTO HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-nike-hairline dark:border-neutral-800 gap-4">
                  <div className="flex items-center gap-4">
                    {matchedRoom?.coverImage ? (
                      <img
                        src={matchedRoom.coverImage}
                        alt={`Room ${booking.roomNumber}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-nike-hairline dark:border-nike-dark-card shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                        <DoorOpen className="w-10 h-10" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-blue-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full">
                          {t('common.unit')} {booking.roomNumber || matchedRoom?.roomNumber || 'TBD'}
                        </span>
                        {matchedRoom?.floor && (
                          <span className="text-xs text-nike-mute dark:text-nike-stone font-medium">
                            {t('common.floor')} {matchedRoom.floor}
                          </span>
                        )}
                        {matchedRoom?.roomType && (
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            · {matchedRoom.roomType}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-nike-ink dark:text-white">
                        {matchedRoom ? getTranslatedRoomName(matchedRoom.roomName, matchedRoom.roomNumber, language) : `${t('common.unit')} ${booking.roomNumber}`}
                      </h3>
                      <span className="text-xs text-nike-mute dark:text-nike-stone font-mono block">
                        Ref: {booking.bookingNo || booking.id}
                      </span>
                    </div>
                  </div>

                  <div className="self-start md:self-center">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* TIMELINE PROGRESS INDICATOR */}
                <div className="py-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
                    
                    {/* STEP 1: Application Submitted */}
                    <div className="space-y-1.5">
                      <div className="w-7 h-7 rounded-full bg-nike-ink dark:bg-white text-white dark:text-nike-ink font-bold flex items-center justify-center mx-auto text-xs">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-nike-ink dark:text-white font-semibold block">{t('track.step1.title')}</span>
                      <span className="text-[11px] text-nike-mute block">{t('track.step1.desc')}</span>
                    </div>

                    {/* STEP 2: Admin Review Status */}
                    <div className="space-y-1.5">
                      <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                        booking.status === 'Approved' || booking.status === 'Completed'
                          ? 'bg-nike-ink dark:bg-white text-white dark:text-nike-ink'
                          : booking.status === 'Pending'
                            ? 'bg-amber-500 text-white animate-pulse'
                            : booking.status === 'Rejected'
                              ? 'bg-rose-600 text-white'
                              : 'bg-neutral-400 text-white'
                      }`}>
                        {booking.status === 'Approved' || booking.status === 'Completed' ? <Check className="w-4 h-4" /> :
                         booking.status === 'Rejected' ? <X className="w-4 h-4" /> :
                         booking.status === 'Cancelled' ? <X className="w-4 h-4" /> : '2'}
                      </div>
                      <span className={`block font-semibold ${
                        booking.status === 'Pending' ? 'text-amber-500 font-bold' :
                        booking.status === 'Rejected' ? 'text-rose-600 font-bold' :
                        booking.status === 'Cancelled' ? 'text-neutral-500 font-bold' :
                        'text-nike-ink dark:text-white font-bold'
                      }`}>
                        {booking.status === 'Approved' || booking.status === 'Completed'
                          ? (language === 'th' ? 'อนุมัติการจองแล้ว' : 'Booking Approved')
                          : booking.status === 'Pending'
                            ? (language === 'th' ? 'รอการพิจารณา' : 'Pending Approval')
                            : booking.status === 'Rejected'
                              ? (language === 'th' ? 'ไม่อนุมัติการจอง' : 'Application Rejected')
                              : (language === 'th' ? 'ยกเลิกการจอง' : 'Booking Cancelled')}
                      </span>
                      <span className="text-[11px] text-nike-mute block">
                        {booking.status === 'Approved' || booking.status === 'Completed'
                          ? (language === 'th' ? 'ผู้ดูแลอนุมัติคำขอแล้ว' : 'Approved by Management')
                          : booking.status === 'Pending'
                            ? (language === 'th' ? 'รอผู้ดูแลระบบตรวจสอบ' : 'Awaiting Admin Verification')
                            : booking.status === 'Rejected'
                              ? (language === 'th' ? 'คำขอไม่ผ่านการอนุมัติ' : 'Did Not Pass Approval')
                              : (language === 'th' ? 'รายการจองถูกยกเลิก' : 'Application Terminated')}
                      </span>
                    </div>

                    {/* STEP 3: Deposit & Unit Access */}
                    <div className="space-y-1.5">
                      <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                        booking.status === 'Approved' || booking.status === 'Completed'
                          ? 'bg-nike-success text-white'
                          : booking.status === 'Rejected' || booking.status === 'Cancelled'
                            ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-400'
                            : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {booking.status === 'Approved' || booking.status === 'Completed' ? <Check className="w-4 h-4" /> : '3'}
                      </div>
                      <span className={`block font-semibold ${
                        booking.status === 'Approved' || booking.status === 'Completed'
                          ? 'text-nike-success font-bold'
                          : 'text-nike-mute'
                      }`}>
                        {booking.status === 'Approved' || booking.status === 'Completed'
                          ? (language === 'th' ? 'ชำระมัดจำ & เข้าพัก' : 'Deposit & Check-in')
                          : (language === 'th' ? 'อนุมัติ & ชำระมัดจำ' : 'Approval & Deposit')}
                      </span>
                      <span className="text-[11px] text-nike-mute block">
                        {booking.status === 'Approved' || booking.status === 'Completed'
                          ? (language === 'th' ? 'พร้อมเข้าใช้งานห้องพัก' : 'Ready for Move-in')
                          : booking.status === 'Pending'
                            ? (language === 'th' ? 'จะปลดล็อคหลังอนุมัติ' : 'Unlocks After Approval')
                            : (language === 'th' ? 'สิ้นสุดกระบวนการ' : 'Process Terminated')}
                      </span>
                    </div>

                  </div>
                </div>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-nike-soft-cloud dark:bg-nike-dark-card rounded-2xl border border-nike-hairline dark:border-neutral-800 text-xs">
                  <div>
                    <span className="text-nike-mute dark:text-nike-stone text-xs font-medium block">{t('track.field.unit')}</span>
                    <span className="font-bold text-sm text-nike-ink dark:text-white">
                      {t('common.unit')} {booking.roomNumber || matchedRoom?.roomNumber || 'TBD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-nike-mute dark:text-nike-stone text-xs font-medium block">{t('track.field.guest')}</span>
                    <span className="font-bold text-sm text-nike-ink dark:text-white">{booking.guestName}</span>
                  </div>
                  <div>
                    <span className="text-nike-mute dark:text-nike-stone text-xs font-medium block">{t('track.field.moveIn')}</span>
                    <span className="font-bold text-sm text-nike-ink dark:text-white">{booking.checkIn}</span>
                  </div>
                  <div>
                    <span className="text-nike-mute dark:text-nike-stone text-xs font-medium block">{t('track.field.rate')}</span>
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                      {formatCurrency(booking.totalPrice || matchedRoom?.price || 0)} / {t('common.month')}
                    </span>
                  </div>
                </div>

                {/* CONTACT & ACTION FOOTER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-nike-mute dark:text-nike-stone">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {booking.guestPhone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {booking.guestEmail}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* APPROVED / COMPLETED: Show Deposit Payment and My Unit buttons */}
                    {(booking.status === 'Approved' || booking.status === 'Completed') && (
                      <>
                        <Link
                          to={`/payment/${booking.id}`}
                          className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          {language === 'th' ? 'ชำระเงินมัดจำ / แนบสลิป' : 'Pay Deposit / Attach Slip'}
                        </Link>
                        <Link
                          to="/my-apartment"
                          className="px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Home className="w-3.5 h-3.5" />
                          {t('nav.myApartment')}
                        </Link>
                      </>
                    )}

                    {/* PENDING: Show Cancel Application button */}
                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? t('track.cancelling') : (language === 'th' ? 'ยกเลิกคำขอจอง' : 'Cancel Application')}
                      </button>
                    )}

                    {/* REJECTED / CANCELLED: Show Browse Other Rooms button */}
                    {(booking.status === 'Rejected' || booking.status === 'Cancelled') && (
                      <Link
                        to="/rooms"
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        {language === 'th' ? 'เลือกดูห้องพักอื่น' : 'Browse Other Rooms'}
                      </Link>
                    )}

                    {/* VIEW ROOM DETAILS (AVAILABLE FOR ALL) */}
                    {(booking.roomId || matchedRoom?.id) && (
                      <Link
                        to={`/rooms/${booking.roomId || matchedRoom?.id}`}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <DoorOpen className="w-3.5 h-3.5" /> {t('track.viewRoomBtn')}
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
