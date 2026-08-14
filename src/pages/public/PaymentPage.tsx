import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Booking } from '../../types';
import { getBookings } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, Building2, ArrowRight } from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { t } = useLanguage();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      getBookings().then(all => {
        const match = all.find(b => b.id === bookingId);
        setBooking(match || null);
        setLoading(false);
      });
    }
  }, [bookingId]);

  if (loading) {
    return <div className="text-center py-24 text-nike-mute font-medium">Loading reservation confirmation...</div>;
  }

  if (!booking) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-nike-ink dark:text-white">Booking Request Not Found</h2>
        <Link to="/rooms" className="text-xs font-bold text-nike-ink dark:text-white underline">
          {t('room.backToUnits')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-16 space-y-8 text-center">
      
      {/* SUCCESS ICON BADGE */}
      <div className="w-16 h-16 bg-nike-success text-white rounded-full flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-nike-success">
          Reservation Request Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-nike-ink dark:text-white">
          Application Received
        </h1>
        <p className="text-xs text-nike-mute dark:text-nike-stone">
          {t('track.bookingRef')}: <strong className="text-nike-ink dark:text-white">{booking.bookingNo}</strong>
        </p>
      </div>

      {/* SUMMARY CARD */}
      <div className="bg-nike-soft-cloud dark:bg-nike-dark-elevated p-8 border border-nike-hairline dark:border-nike-dark-card rounded-3xl text-left space-y-6 shadow-sm">
        <h3 className="font-bold text-xs text-nike-ink dark:text-white border-b border-nike-hairline dark:border-neutral-800 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-nike-ink dark:text-white" /> {t('booking.unitSummary')}
        </h3>

        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-nike-mute dark:text-nike-stone block text-[10px] font-medium">{t('track.field.guest')}</span>
            <span className="font-bold text-nike-ink dark:text-white">{booking.guestName}</span>
          </div>
          <div className="space-y-1">
            <span className="text-nike-mute dark:text-nike-stone block text-[10px] font-medium">{t('track.field.unit')}</span>
            <span className="font-bold text-nike-ink dark:text-white">Unit {booking.roomNumber || 'Assigned'}</span>
          </div>
          <div className="space-y-1">
            <span className="text-nike-mute dark:text-nike-stone block text-[10px] font-medium">{t('booking.guestPhone')}</span>
            <span className="font-bold text-nike-ink dark:text-white">{booking.guestPhone}</span>
          </div>
          <div className="space-y-1">
            <span className="text-nike-mute dark:text-nike-stone block text-[10px] font-medium">{t('booking.guestEmail')}</span>
            <span className="font-bold text-nike-ink dark:text-white">{booking.guestEmail}</span>
          </div>
          <div className="space-y-1">
            <span className="text-nike-mute dark:text-nike-stone block text-[10px] font-medium">{t('track.field.moveIn')}</span>
            <span className="font-bold text-nike-ink dark:text-white">{booking.checkIn}</span>
          </div>
          <div className="space-y-1">
            <span className="text-nike-mute dark:text-nike-stone block text-[10px] font-medium">{t('track.field.rate')}</span>
            <span className="font-bold text-nike-ink dark:text-white text-base">{formatCurrency(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-nike-mute dark:text-nike-stone max-w-md mx-auto leading-relaxed">
        Our building administration team will review your application and contact you via phone or email for contract execution and keycard pickup.
      </p>

      <div className="pt-2">
        <Link
          to="/"
          className="bg-nike-ink hover:bg-neutral-800 dark:bg-white dark:text-nike-ink dark:hover:bg-neutral-200 text-white font-bold px-8 py-3.5 rounded-full text-xs transition-all active:scale-95 shadow-md inline-flex items-center gap-2"
        >
          {t('nav.home')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
