import React, { useEffect } from 'react';
import { UtilityBill } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, X, Receipt, Download, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  bill: UtilityBill;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ bill, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const waterUnits = Math.max(0, bill.currWaterMeter - bill.prevWaterMeter);
  const electricUnits = Math.max(0, bill.currElectricMeter - bill.prevElectricMeter);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="document-paper bg-white text-slate-900 border border-slate-300 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 my-6 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none">

        {/* TOP ACTION HEADER (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Official Receipt & Utility Bill
              </h2>
              <span className="text-xs text-slate-500">Ref: #{bill.invoiceNo}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT (Strictly fits on 1 Single A4 Page) */}
        <div className="space-y-4 text-xs leading-relaxed font-sans text-slate-800 print:text-xs print:space-y-3">

          {/* BRAND HEADER */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-slate-900 print:text-black" />
                <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight print:text-black">
                  POONTAN APARTMENT BANGKOK
                </h1>
              </div>
              <p className="text-slate-600 print:text-black text-[11px]">422 Phaya Thai Rd, Ratchathewi, Bangkok 10400</p>
              <p className="text-slate-600 print:text-black text-[11px]">Tel: +66 2 123 4567 | Email: admin@poontanapartment.com</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-md border border-emerald-300 print:border-black print:bg-gray-100 print:text-black">
                {bill.status === 'Paid' ? 'OFFICIAL RECEIPT' : 'UTILITY INVOICE'}
              </span>
              <p className="text-slate-700 print:text-black mt-1 text-[11px]">Invoice No: <strong className="font-extrabold">{bill.invoiceNo}</strong></p>
              <p className="text-slate-700 print:text-black text-[11px]">Billing Month: <strong className="font-extrabold">{bill.billingMonth}</strong></p>
            </div>
          </div>

          {/* TENANT & ROOM INFO */}
          <div className="bg-slate-50 print:bg-white p-3.5 rounded-xl border border-slate-300 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Tenant Name:</span>
              <span className="font-extrabold text-slate-900 print:text-black text-xs">{bill.tenantName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Assigned Unit:</span>
              <span className="font-extrabold text-blue-600 print:text-black text-xs">Unit {bill.roomNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Date Issued:</span>
              <span className="font-bold text-slate-900 print:text-black text-xs">{formatDate(bill.createdAt)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Payment Status:</span>
              <span className="font-extrabold text-emerald-600 print:text-black text-xs">{bill.paymentDate ? `Paid (${formatDate(bill.paymentDate)})` : bill.status}</span>
            </div>
          </div>

          {/* TABLE */}
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 print:bg-gray-100 text-slate-900 print:text-black font-extrabold">
                <th className="border border-slate-300 p-2 print:py-1.5 text-left">Description</th>
                <th className="border border-slate-300 p-2 print:py-1.5 text-center">Prev Meter</th>
                <th className="border border-slate-300 p-2 print:py-1.5 text-center">Curr Meter</th>
                <th className="border border-slate-300 p-2 print:py-1.5 text-center">Usage</th>
                <th className="border border-slate-300 p-2 print:py-1.5 text-right">Rate</th>
                <th className="border border-slate-300 p-2 print:py-1.5 text-right">Amount (THB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-slate-800 print:text-black">
              <tr>
                <td className="border border-slate-300 p-2 print:py-1.5 font-semibold">Monthly Rent Rate</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center text-slate-400">-</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center text-slate-400">-</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center font-medium">1 Month</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-right">{formatCurrency(bill.rentAmount)}</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-right font-extrabold">{formatCurrency(bill.rentAmount)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 print:py-1.5 font-semibold">Water Supply Metering</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center">{bill.prevWaterMeter}</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center">{bill.currWaterMeter}</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center font-extrabold text-blue-600 print:text-black">{waterUnits} units</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-right">{bill.waterRate} THB</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-right font-extrabold">{formatCurrency(bill.waterAmount)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 print:py-1.5 font-semibold">Electricity Supply Metering</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center">{bill.prevElectricMeter}</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center">{bill.currElectricMeter}</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-center font-extrabold text-amber-600 print:text-black">{electricUnits} units</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-right">{bill.electricRate} THB</td>
                <td className="border border-slate-300 p-2 print:py-1.5 text-right font-extrabold">{formatCurrency(bill.electricAmount)}</td>
              </tr>
              {bill.commonFee > 0 && (
                <tr>
                  <td className="border border-slate-300 p-2 print:py-1.5 font-semibold">Building Common Maintenance Fee</td>
                  <td className="border border-slate-300 p-2 print:py-1.5 text-center text-slate-400">-</td>
                  <td className="border border-slate-300 p-2 print:py-1.5 text-center text-slate-400">-</td>
                  <td className="border border-slate-300 p-2 print:py-1.5 text-center">Flat</td>
                  <td className="border border-slate-300 p-2 print:py-1.5 text-right">{formatCurrency(bill.commonFee)}</td>
                  <td className="border border-slate-300 p-2 print:py-1.5 text-right font-extrabold">{formatCurrency(bill.commonFee)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 print:bg-gray-100 text-slate-900 print:text-black font-extrabold text-xs">
                <td colSpan={5} className="border border-slate-300 p-2.5 print:py-2 text-right uppercase tracking-wider">GRAND TOTAL AMOUNT:</td>
                <td className="border border-slate-300 p-2.5 print:py-2 text-right text-emerald-600 print:text-black font-extrabold text-sm">{formatCurrency(bill.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          {/* SIGNATURE SECTION */}
          <div className="pt-6 print:pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-6 print:space-y-4">
              <p className="text-slate-600 print:text-black">Payer Signature..........................................................</p>
              <p className="font-extrabold text-slate-900 print:text-black">( {bill.tenantName} )</p>
            </div>
            <div className="space-y-6 print:space-y-4">
              <p className="text-slate-600 print:text-black">Receiver Signature..........................................................</p>
              <p className="font-extrabold text-slate-900 print:text-black">( Poontan Apartment Representative )</p>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BAR (Hidden in Print) */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" /> Close Document
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" /> Download / Print PDF Receipt
          </button>
        </div>

      </div>
    </div>
  );
};
