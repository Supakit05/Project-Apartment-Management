import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Booking } from '../../types';
import { getBookings, updateBookingStatus } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'sonner';

export const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchBookings = async () => {
    try {
      const list = await getBookings();
      setBookings(list);
      applyFilter(list, searchQuery, statusFilter);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const applyFilter = (list: Booking[], q: string, st: string) => {
    let result = [...list];
    if (q.trim()) {
      const query = q.toLowerCase();
      result = result.filter(b => (b.bookingNo || '').toLowerCase().includes(query) || (b.guestName || '').toLowerCase().includes(query) || (b.guestPhone || '').includes(query));
    }
    if (st !== 'All') {
      result = result.filter(b => b.status === st);
    }
    setFilteredBookings(result);
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    await updateBookingStatus(bookingId, status);
    toast.success(`Booking status updated to ${status}`);
    fetchBookings();
  };

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER */}
      <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-4">
        <h1 className="text-[28px] font-bold text-nike-ink dark:text-white">
          Rental Booking Requests
        </h1>
        <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
          Review public rental applications and manage reservation statuses
        </p>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-nike-mute absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); applyFilter(bookings, e.target.value, statusFilter); }}
            placeholder="Search by booking no, applicant name, or phone..."
            className="w-full pl-10 p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border-0 text-nike-ink dark:text-white text-[14px] rounded-[24px] focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); applyFilter(bookings, searchQuery, e.target.value); }}
            className="w-full p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border-0 text-nike-ink dark:text-white text-[14px] rounded-[24px] focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-nike-hairline-soft dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-medium text-[13px]">
              <th className="p-4">Booking No</th>
              <th className="p-4">Applicant Info</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Move-in / Out</th>
              <th className="p-4">Monthly Rent</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nike-hairline-soft dark:divide-nike-dark-card">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-nike-mute">
                  No rental booking requests found
                </td>
              </tr>
            ) : (
              filteredBookings.map(b => (
                <tr key={b.id} className="hover:bg-nike-soft-cloud dark:hover:bg-nike-dark-card/50 transition-colors">
                  <td className="p-4 font-semibold text-nike-ink dark:text-white">
                    {b.bookingNo}
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-medium text-nike-ink dark:text-white block">{b.guestName}</span>
                      <span className="text-[12px] text-nike-mute">{b.guestPhone} · {b.guestEmail}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-blue-600 dark:text-blue-400">
                    Unit {b.roomNumber || '-'}
                  </td>
                  <td className="p-4 text-nike-mute dark:text-nike-stone text-xs">
                    {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                  </td>
                  <td className="p-4 font-medium text-nike-ink dark:text-white">
                    {formatCurrency(b.totalPrice)}
                  </td>
                  <td className="p-4">
                    <select
                      value={b.status}
                      onChange={e => handleStatusUpdate(b.id, e.target.value)}
                      className={`p-1.5 text-[12px] font-semibold rounded-full border-0 focus:outline-none cursor-pointer ${
                        b.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        b.status === 'Cancelled' || b.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
