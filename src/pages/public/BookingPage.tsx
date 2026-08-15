import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Room } from '../../types';
import { getRoomById, createBooking } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Maximize2, BedDouble, Users, CalendarCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    guestName: user?.fullname || '',
    guestEmail: user?.email || '',
    guestPhone: user?.phone || '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guestCount: 1,
    specialRequests: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('สำหรับ Guest เข้าชมได้อย่างเดียว หากต้องการจอง/เช่าห้อง กรุณาเข้าสู่ระบบก่อนครับ', { duration: 5000 });
      navigate('/login');
      return;
    }

    if (roomId) {
      getRoomById(roomId).then((res) => {
        setRoom(res);
        setLoading(false);
      });
    }
  }, [roomId, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guestName || !formData.guestPhone || !formData.guestEmail) {
      toast.error('Please fill in all required contact information');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBooking({
        roomId: room?.id || roomId,
        roomNumber: room?.roomNumber,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        guestEmail: formData.guestEmail,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guestCount: formData.guestCount,
        totalPrice: room?.price || 5500,
        specialRequests: formData.specialRequests,
      });

      toast.success(`Booking request submitted! Reference: ${res.bookingNo}`);
      navigate('/payment/' + res.id);

    } catch (err: any) {
      const msg = err.message || 'Unable to submit booking request';
      toast.error(msg, { duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-nike-mute font-medium">Loading unit booking...</div>;
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

  return (
    <div className="max-w-[840px] mx-auto px-6 py-12 space-y-8">
      
      {/* BREADCRUMB */}
      <Link to={`/rooms/${room.id}`} className="inline-flex items-center gap-2 text-xs font-semibold text-nike-mute dark:text-nike-stone hover:text-nike-ink dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to {room.roomName}
      </Link>

      {/* UNIT OVERVIEW CARD */}
      <div className="bg-nike-soft-cloud dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block bg-nike-ink dark:bg-white text-white dark:text-nike-ink text-[11px] font-bold px-3.5 py-1 rounded-full mb-2">
              {t('common.floor')} {room.floor} · {t('common.unit')} {room.roomNumber}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
              {room.roomName}
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-medium text-nike-mute dark:text-nike-stone block">{t('track.field.rate')}</span>
            <span className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
              {formatCurrency(room.price)}<span className="text-xs font-normal text-nike-mute dark:text-nike-stone ml-1">/{t('common.month')}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-white dark:bg-nike-dark-card text-nike-ink dark:text-white border border-nike-hairline dark:border-neutral-700 font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" /> {room.sizeSqm} m²
          </span>
          <span className="bg-white dark:bg-nike-dark-card text-nike-ink dark:text-white border border-nike-hairline dark:border-neutral-700 font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5" /> {room.bedType || 'Queen Bed'}
          </span>
          <span className="bg-white dark:bg-nike-dark-card text-nike-ink dark:text-white border border-nike-hairline dark:border-neutral-700 font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Max {room.capacity} Guests
          </span>
        </div>
      </div>

      {/* BOOKING FORM */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-nike-dark-elevated p-6 sm:p-8 border border-nike-hairline dark:border-nike-dark-card rounded-3xl space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="font-bold text-xs text-nike-ink dark:text-white border-b border-nike-hairline dark:border-neutral-800 pb-2">
            {t('profile.personalInfo')}
          </h3>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-nike-ink dark:text-white">{t('booking.guestName')} *</label>
            <input
              type="text"
              required
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-nike-ink dark:text-white">{t('booking.guestPhone')} *</label>
              <input
                type="tel"
                required
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                placeholder="081-234-5678"
                className="w-full px-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-nike-ink dark:text-white">{t('booking.guestEmail')} *</label>
              <input
                type="email"
                required
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                placeholder="john.doe@example.com"
                className="w-full px-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-nike-hairline dark:border-neutral-800">
          <h3 className="font-bold text-xs text-nike-ink dark:text-white border-b border-nike-hairline dark:border-neutral-800 pb-2">
            {t('booking.checkInDate')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-nike-ink dark:text-white">{t('track.field.moveIn')} *</label>
              <input
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-nike-ink dark:text-white">Move-Out Date *</label>
              <input
                type="date"
                required
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-4 py-3 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-nike-ink dark:text-white">Special Requests & Notes</label>
            <textarea
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="e.g. Request car parking stall, 1-year contract preferred"
              className="w-full p-4 text-xs font-medium rounded-2xl bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white placeholder-nike-mute dark:placeholder-nike-stone focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-nike-ink hover:bg-neutral-800 dark:bg-white dark:text-nike-ink dark:hover:bg-neutral-200 text-white font-bold py-4 rounded-full text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
        >
          <CalendarCheck className="w-4 h-4" />
          {submitting ? t('booking.submitting') : t('booking.submitBtn')}
        </button>
      </form>
    </div>
  );
};
