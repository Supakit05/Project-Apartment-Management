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

export const MyBookingsPage: React.FC = () => {
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
      toast.error('กรุณาล็อกอินเพื่อดูประวัติและสถานะการจอง');
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
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอจองห้องนี้?')) return;
    setCancellingId(bookingId);
    try {
      const res = await cancelBooking(bookingId);
      if (res) {
        toast.success('ยกเลิกคำขอจองเรียบร้อยแล้ว');
        fetchUserBookings();
      } else {
        toast.error('ไม่สามารถยกเลิกรายการได้');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการยกเลิก');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> ได้รับการอนุมัติแล้ว (Approved)
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> ไม่อนุญาติ / ถูกปฏิเสธ (Rejected)
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <Ban className="w-3.5 h-3.5" /> ยกเลิกแล้ว (Cancelled)
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> รอการตรวจสอบและอนุมัติ (Pending)
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-300 font-medium">กำลังโหลดข้อมูลประวัติการจองของคุณ...</p>
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
            สถานะและประวัติการจองห้องพัก
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            ติดตามสถานะคำขอจองยูนิตแบบ Real-time (อัปเดตอัตโนมัติทันทีเมื่อแอดมินดำเนินการ)
          </p>
        </div>

        <button
          onClick={() => fetchUserBookings(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'กำลังอัปเดต...' : 'รีเฟรชสถานะ'}</span>
        </button>
      </div>

      {/* NO BOOKINGS STATE */}
      {bookings.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">ยังไม่มีประวัติการจองห้องพัก</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            คุณยังไม่ได้ทำการส่งคำขอจองยูนิตใดๆ ในขณะนี้ สามารถเลือกดูห้องพัก 24 ห้องที่ว่างและทำการส่งคำขอจองได้ทันที
          </p>
          <div className="pt-2">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full text-sm transition-all shadow-md"
            >
              ดูห้องพักยูนิตทั้งหมด <ArrowRight className="w-4 h-4" />
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
                      ส่งเมื่อ: {booking.createdAt ? new Date(booking.createdAt).toLocaleString('th-TH') : '-'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                    Unit {booking.roomNumber || '-'} (ยูนิตห้องพัก)
                  </h2>
                </div>

                <div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* INFO DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold block">ช่วงเวลาการเข้าพัก (Move-in / Out)</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold block">ค่าเช่ารายเดือน</span>
                  <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {formatCurrency(booking.totalPrice)} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">/เดือน</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold block">ผู้ขอจอง & ติดต่อ</span>
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
                  <span className="font-bold">หมายเหตุเพิ่มเติม: </span>{booking.specialRequests}
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  {booking.status === 'Pending' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>ขณะนี้คำขอของคุณอยู่ระหว่างรอเจ้าหน้าที่/ผู้ดูแลตรวจสอบ หากได้รับการอนุมัติ สถานะจะเปลี่ยนเป็นสีเขียวทันที</span>
                    </>
                  )}
                  {booking.status === 'Approved' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>คำขอได้รับการอนุมัติแล้ว คุณสามารถติดต่อผู้ดูแลหรือดำเนินการชำระเงินมัดจำล่วงหน้าได้</span>
                    </>
                  )}
                  {booking.status === 'Rejected' && (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>คำขอจองนี้ไม่ได้รับการอนุมัติ คุณสามารถลองเลือกจองยูนิตอื่นหรือช่วงเวลาอื่นได้</span>
                    </>
                  )}
                  {booking.status === 'Cancelled' && (
                    <>
                      <Ban className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                      <span>รายการจองนี้ถูกยกเลิกแล้ว</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                  {booking.status === 'Approved' && (
                    <Link
                      to={`/payment/${booking.id}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> ชำระเงิน / ดูใบเสร็จ
                    </Link>
                  )}

                  {booking.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold px-4 py-2 rounded-xl text-xs transition-colors border border-rose-200 dark:border-rose-800 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิกคำขอจอง'}
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
