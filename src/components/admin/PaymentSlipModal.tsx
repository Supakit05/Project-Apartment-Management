import React from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { Booking } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PaymentSlipModalProps {
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const PaymentSlipModal: React.FC<PaymentSlipModalProps> = ({
  booking,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card w-full max-w-lg p-6 md:p-8 space-y-6 rounded-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between border-b border-nike-hairline-soft dark:border-nike-dark-card pb-3">
          <div>
            <h3 className="text-[18px] font-bold text-nike-ink dark:text-white">
              Application Verification: #{booking.bookingNo}
            </h3>
            <p className="text-[13px] text-nike-mute">Applicant: {booking.guestName}</p>
          </div>
          <button onClick={onClose} className="text-nike-mute hover:text-nike-ink dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-[13px] bg-nike-soft-cloud dark:bg-nike-dark-card p-4 rounded-xl">
            <div>
              <span className="text-nike-mute block text-[11px]">Unit Number</span>
              <span className="font-bold text-nike-ink dark:text-white">Unit {booking.roomNumber || '-'}</span>
            </div>
            <div>
              <span className="text-nike-mute block text-[11px]">Monthly Rent</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <div>
              <span className="text-nike-mute block text-[11px]">Requested Lease Dates</span>
              <span className="text-nike-ink dark:text-white">{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}</span>
            </div>
            <div>
              <span className="text-nike-mute block text-[11px]">Contact Phone</span>
              <span className="text-nike-ink dark:text-white">{booking.guestPhone}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-nike-hairline-soft dark:border-nike-dark-card">
          <button
            onClick={onReject}
            className="flex-1 border border-rose-500 text-rose-500 text-[13px] font-semibold py-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Reject Application
          </button>

          <button
            onClick={onApprove}
            className="flex-1 bg-blue-600 text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve Application
          </button>
        </div>

      </div>
    </div>
  );
};
