import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types';
import { getUserBookings, cancelBooking } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Building2,
  Phone, Mail, RefreshCw, ArrowRight, Ban, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';

export const MyBookingsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchUserBookings = async (showRefreshState = false) => {
    if (!user?.email) return;
    if (showRefreshState) setRefreshing(true);
    try {
      const data = await getUserBookings(user.email);
      setBookings(data);
    } catch (err) {
      console.error('Error loading user bookings:', err);
    } finally {
      setLoading(false);
      if (showRefreshState) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(language === 'th' ? 'กรุณาล็อกอินเพื่อดูประวัติและสถานะการจอง' : 'Please sign in to view your bookings');
      navigate('/login');
      return;
    }

    fetchUserBookings();

    // Live real-time polling every 3 seconds
    const interval = setInterval(() => {
      fetchUserBookings(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.email]);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmMsg = language === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอจองห้องนี้?' : 'Are you sure you want to cancel this booking request?';
    if (!window.confirm(confirmMsg)) return;
    setCancellingId(bookingId);
    try {
      const res = await cancelBooking(bookingId);
      if (res) {
        toast.success(language === 'th' ? 'ยกเลิกคำขอจองเรียบร้อยแล้ว' : 'Booking request cancelled successfully');
        fetchUserBookings();
      } else {
        toast.error(language === 'th' ? 'ไม่สามารถยกเลิกรายการได้' : 'Failed to cancel booking');
      }
    } catch (err) {
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาดในการยกเลิก' : 'Error cancelling booking');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'th' ? 'ได้รับการอนุมัติแล้ว (Approved)' : 'Approved'}
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> {language === 'th' ? 'ไม่อนุญาติ / ถูกปฏิเสธ (Rejected)' : 'Rejected'}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <Ban className="w-3.5 h-3.5" /> {language === 'th' ? 'ยกเลิกแล้ว (Cancelled)' : 'Cancelled'}
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> {language === 'th' ? 'รอการตรวจสอบและอนุมัติ (Pending)' : 'Pending Approval'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-300 font-medium">{language === 'th' ? 'กำลังโหลดข้อมูลประวัติการจองของคุณ...' : 'Loading your booking history...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            {language === 'th' ? 'สถานะและประวัติการจองห้องพัก' : 'My Bookings & Application Status'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {language === 'th' ? 'ติดตามสถานะคำขอจองห้องพักแบบ Real-time (อัปเดตอัตโนมัติทันทีเมื่อแอดมินดำเนินการ)' : 'Track your unit booking and application status in real-time.'}
          </p>
        </div>

        <button
          onClick={() => fetchUserBookings(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? (language === 'th' ? 'กำลังอัปเดต...' : 'Updating...') : (language === 'th' ? 'รีเฟรชสถานะ' : 'Refresh Status')}</span>
        </button>
      </div>

      {/* NO BOOKINGS STATE */}
      {bookings.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{language === 'th' ? 'ยังไม่มีประวัติการจองห้องพัก' : 'No Booking History Yet'}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {language === 'th' ? 'คุณยังไม่ได้ทำการส่งคำขอจองห้องพักใดๆ ในขณะนี้ สามารถเลือกดูห้องพัก 24 ห้องที่ว่างและทำการส่งคำขอจองได้ทันที' : 'You haven\'t submitted any booking applications yet. Explore our residences to apply.'}
          </p>
          <div className="pt-2">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full text-sm transition-all shadow-md"
            >
              {language === 'th' ? 'ดูห้องพักทั้งหมด' : 'Explore All Units'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              {/* TOP HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                      {booking.bookingNo}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      {language === 'th' ? 'ส่งเมื่อ: ' : 'Submitted: '}{booking.createdAt ? (language === 'th' ? new Date(booking.createdAt).toLocaleString('th-TH') : new Date(booking.createdAt).toLocaleString('en-US')) : '-'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                    {t('common.unit')} {booking.roomNumber || '-'}
                  </h2>
                </div>

                <div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* INFO DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold block">{language === 'th' ? 'ช่วงเวลาการเข้าพัก' : 'Lease Period (Move-in / Out)'}</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold block">{language === 'th' ? 'ค่าเช่ารายเดือน' : 'Monthly Rent'}</span>
                  <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {formatCurrency(booking.totalPrice)} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">/{t('common.month')}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold block">{language === 'th' ? 'ผู้ขอจอง & ติดต่อ' : 'Applicant & Contact'}</span>
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {booking.guestName}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {booking.guestPhone}
                  </div>
                </div>
              </div>

              {/* SPECIAL REQUESTS IF ANY */}
              {booking.specialRequests && (
                <div className="text-xs bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3.5 rounded-xl text-amber-900 dark:text-amber-200">
                  <span className="font-bold">{language === 'th' ? 'หมายเหตุเพิ่มเติม: ' : 'Special Requests: '}</span>{booking.specialRequests}
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  {booking.status === 'Pending' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{language === 'th' ? 'ขณะนี้คำขอของคุณอยู่ระหว่างรอเจ้าหน้าที่/ผู้ดูแลตรวจสอบ หากได้รับการอนุมัติ สถานะจะเปลี่ยนเป็นสีเขียวทันที' : 'Your application is currently under review by management.'}</span>
                    </>
                  )}
                  {booking.status === 'Approved' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{language === 'th' ? 'คำขอได้รับการอนุมัติแล้ว คุณสามารถเข้าดูสัญญาและรายละเอียดห้องพักได้ที่หน้าห้องพักของฉัน' : 'Application approved! You can now view your active lease in My Apartment.'}</span>
                    </>
                  )}
                  {booking.status === 'Rejected' && (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{language === 'th' ? 'คำขอจองนี้ไม่ได้รับการอนุมัติ คุณสามารถลองเลือกจองห้องอื่นหรือช่วงเวลาอื่นได้' : 'This booking request was not approved. Please explore other available units.'}</span>
                    </>
                  )}
                  {booking.status === 'Cancelled' && (
                    <>
                      <Ban className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                      <span>{language === 'th' ? 'รายการจองนี้ถูกยกเลิกแล้ว' : 'This booking was cancelled.'}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                  {booking.status === 'Approved' && (
                    <Link
                      to="/my-apartment"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Building2 className="w-3.5 h-3.5" /> {t('nav.myApartment')}
                    </Link>
                  )}

                  {booking.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold px-4 py-2 rounded-xl text-xs transition-colors border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === booking.id ? (language === 'th' ? 'กำลังยกเลิก...' : 'Cancelling...') : (language === 'th' ? 'ยกเลิกคำขอจอง' : 'Cancel Request')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
