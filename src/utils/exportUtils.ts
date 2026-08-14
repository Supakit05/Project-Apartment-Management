import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Booking } from '../types';
import { formatCurrency } from './formatters';

export const exportBookingsToPDF = (bookings: Booking[]) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Apartment Booking Requests Report', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  const tableData = bookings.map((booking) => [
    booking.bookingNo,
    booking.guestName,
    `Unit ${booking.roomNumber || '-'}`,
    booking.checkIn,
    booking.checkOut,
    formatCurrency(booking.totalPrice),
    booking.status,
  ]);

  autoTable(doc, {
    head: [['Booking No', 'Applicant Name', 'Unit', 'Check In', 'Check Out', 'Total Rent', 'Status']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`apartment_bookings_${Date.now()}.pdf`);
};

export const exportBookingsToExcel = (bookings: Booking[]) => {
  const excelData = bookings.map((booking) => ({
    'Booking No': booking.bookingNo,
    'Applicant Name': booking.guestName,
    'Phone': booking.guestPhone,
    'Email': booking.guestEmail,
    'Unit Number': booking.roomNumber || '-',
    'Move In Date': booking.checkIn,
    'Move Out Date': booking.checkOut,
    'Guest Count': booking.guestCount,
    'Monthly Rent': booking.totalPrice,
    'Special Requests': booking.specialRequests || '-',
    'Status': booking.status,
    'Submitted At': booking.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

  XLSX.writeFile(workbook, `apartment_bookings_${Date.now()}.xlsx`);
};
