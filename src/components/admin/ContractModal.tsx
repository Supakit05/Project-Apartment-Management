import React, { useEffect } from 'react';
import { Lease } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, X, FileCheck, Download, Building2 } from 'lucide-react';

interface ContractModalProps {
  lease: Lease;
  onClose: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({ lease, onClose }) => {
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

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="document-paper bg-white text-slate-900 border border-slate-300 rounded-3xl max-w-3xl w-full p-8 md:p-10 shadow-2xl space-y-6 my-8 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none">

        {/* TOP ACTION HEADER (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Official Residential Lease Agreement
              </h2>
              <span className="text-xs text-slate-500">Contract Ref: #{lease.id.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
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

        {/* PRINTABLE CONTRACT CONTENT */}
        <div className="space-y-6 text-xs leading-relaxed font-sans text-slate-800 print:text-xs">

          {/* HEADER BRANDING */}
          <div className="text-center space-y-1.5 border-b border-slate-300 pb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-slate-900 print:text-black" />
              <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight print:text-black">
                POONTAN APARTMENT BANGKOK
              </h1>
            </div>
            <p className="text-xs text-slate-600 print:text-black">422 Phaya Thai Rd, Ratchathewi, Bangkok 10400</p>
            <p className="text-xs text-slate-600 print:text-black">Tel: +66 2 123 4567 | Email: admin@poontanapartment.com</p>
            <div className="pt-2">
              <span className="inline-block px-5 py-1.5 bg-slate-100 text-slate-900 font-extrabold text-sm rounded-lg tracking-wider border border-slate-300 print:border-black print:bg-gray-100">
                OFFICIAL RESIDENTIAL LEASE CONTRACT
              </span>
            </div>
          </div>

          {/* CONTRACT NO & DATE */}
          <div className="flex justify-between items-center text-xs font-semibold border-b border-slate-200 pb-2 text-slate-700 print:text-black">
            <span>Contract Reference: <strong className="text-slate-900 print:text-black font-extrabold">{lease.id.toUpperCase()}</strong></span>
            <span>Date of Issue: <strong className="text-slate-900 print:text-black font-extrabold">{formatDate(lease.createdAt)}</strong></span>
          </div>

          {/* PARTIES STATEMENT */}
          <div className="space-y-3">
            <p className="text-justify text-slate-800 print:text-black">
              This Residential Lease Agreement is entered into and made effective as of <strong>{formatDate(lease.checkInDate)}</strong>, by and between <strong>POONTAN APARTMENT BANGKOK</strong> (hereinafter referred to as the <strong>"Lessor"</strong>), and the party identified below (hereinafter referred to as the <strong>"Lessee"</strong>):
            </p>

            {/* BALANCED TENANT & LEASE DETAILS CARD */}
            <div className="bg-slate-50 print:bg-white p-5 rounded-2xl border border-slate-300 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-bold">Tenant Name (Lessee):</span>
                  <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{lease.tenantName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-bold">Contact Phone:</span>
                  <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{lease.tenantPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-bold">Leased Unit:</span>
                  <span className="font-extrabold text-blue-600 print:text-black text-sm block mt-0.5">Unit Number {lease.roomNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-bold">Billing Cycle:</span>
                  <span className="font-extrabold text-slate-900 uppercase text-sm block mt-0.5">{lease.billingCycle}</span>
                </div>
              </div>
            </div>

            <p className="text-justify text-slate-800 print:text-black">
              Both parties mutually agree to abide strictly by the terms, conditions, and regulations outlined herein:
            </p>
          </div>

          {/* ARTICLES SECTION */}
          <div className="space-y-3 text-xs border-t border-slate-200 pt-3">
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Article 1: Lease Term & Duration</h4>
              <p className="mt-1 text-slate-700 print:text-black leading-relaxed">
                The Lessor agrees to let, and the Lessee agrees to rent Unit <strong>{lease.roomNumber}</strong> for a lease term commencing on <strong>{formatDate(lease.checkInDate)}</strong> and expiring on <strong>{formatDate(lease.checkOutDate)}</strong>.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Article 2: Rent Payment & Security Deposit</h4>
              <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700 print:text-black leading-relaxed">
                <li>Monthly Rent Amount: <strong>{formatCurrency(lease.rentAmount)} THB</strong> per month, payable in advance on or before the 5th day of each calendar month.</li>
                <li>Security Deposit: <strong>{formatCurrency(lease.depositAmount)} THB</strong> held by the Lessor to guarantee full performance of all tenant obligations.</li>
                <li>Utility Rates: Water at <strong>18 THB/unit</strong>, Electricity at <strong>7 THB/unit</strong>, metered monthly.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Article 3: Unit Occupancy & Building Rules</h4>
              <p className="mt-1 text-slate-700 print:text-black leading-relaxed">
                The Lessee shall maintain the premises in a clean and safe condition, observe quiet hours after 10:00 PM, and refrain from making unapproved structural modifications or keeping unauthorized pets on premises.
              </p>
            </div>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="pt-10 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-12">
              <p className="text-slate-600 print:text-black">Signed..........................................................Lessee</p>
              <p className="font-bold text-slate-900 print:text-black">( {lease.tenantName} )</p>
            </div>
            <div className="space-y-12">
              <p className="text-slate-600 print:text-black">Signed..........................................................Lessor</p>
              <p className="font-bold text-slate-900 print:text-black">( Poontan Apartment Representative )</p>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BAR (Hidden in Print) */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" /> Close Contract
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" /> Download / Print Contract PDF
          </button>
        </div>

      </div>
    </div>
  );
};
