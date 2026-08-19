import React, { useEffect, useState } from 'react';
import { UtilityBill, Room, Lease } from '../../types';
import { getUtilityBills, saveUtilityBill, updateBillStatus, getRooms, getLeases } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { FileText, Plus, Printer, Droplets, Zap, Search } from 'lucide-react';
import { ReceiptModal } from '../../components/admin/ReceiptModal';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

const MONTH_NAMES = [
  { value: 'January', th: 'มกราคม (Jan)', en: 'January' },
  { value: 'February', th: 'กุมภาพันธ์ (Feb)', en: 'February' },
  { value: 'March', th: 'มีนาคม (Mar)', en: 'March' },
  { value: 'April', th: 'เมษายน (Apr)', en: 'April' },
  { value: 'May', th: 'พฤษภาคม (May)', en: 'May' },
  { value: 'June', th: 'มิถุนายน (Jun)', en: 'June' },
  { value: 'July', th: 'กรกฎาคม (Jul)', en: 'July' },
  { value: 'August', th: 'สิงหาคม (Aug)', en: 'August' },
  { value: 'September', th: 'กันยายน (Sep)', en: 'September' },
  { value: 'October', th: 'ตุลาคม (Oct)', en: 'October' },
  { value: 'November', th: 'พฤศจิกายน (Nov)', en: 'November' },
  { value: 'December', th: 'ธันวาคม (Dec)', en: 'December' },
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const UtilityReceiptManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid'>('All');
  const [monthFilter, setMonthFilter] = useState<string>('All');

  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<UtilityBill | null>(null);

  const [billFormData, setBillFormData] = useState<Partial<UtilityBill>>({
    billingMonth: 'August 2026',
    waterRate: 9,
    electricRate: 4,
    commonFee: 300,
    prevWaterMeter: 0,
    currWaterMeter: 0,
    prevElectricMeter: 0,
    currElectricMeter: 0,
  });

  const currentMonthPart = (billFormData.billingMonth || 'August 2026').split(' ')[0] || 'August';
  const currentYearPart = (billFormData.billingMonth || 'August 2026').split(' ')[1] || '2026';

  const handleMonthChange = (newMonth: string) => {
    setBillFormData(prev => ({
      ...prev,
      billingMonth: `${newMonth} ${currentYearPart}`,
    }));
  };

  const handleYearChange = (newYear: string) => {
    setBillFormData(prev => ({
      ...prev,
      billingMonth: `${currentMonthPart} ${newYear}`,
    }));
  };

  const fetchData = async () => {
    try {
      setBills(await getUtilityBills());
      setRooms(await getRooms());
      setLeases(await getLeases());
    } catch (err) {
      console.error('Failed to fetch utility bills data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenNewBillModal = () => {
    const activeLease = leases.find(l => l.status === 'Active');
    const targetRoom = rooms.find(r => r.id === activeLease?.roomId) || rooms[0];

    setBillFormData({
      billingMonth: 'August 2026',
      leaseId: activeLease?.id || '',
      roomId: targetRoom?.id || '',
      roomNumber: targetRoom?.roomNumber || '',
      tenantName: activeLease?.tenantName || targetRoom?.currentTenantName || 'Tenant',
      rentAmount: activeLease?.rentAmount || targetRoom?.price || 5500,
      prevWaterMeter: targetRoom?.currWaterMeter || targetRoom?.prevWaterMeter || 100,
      currWaterMeter: (targetRoom?.currWaterMeter || targetRoom?.prevWaterMeter || 100) + 8,
      prevElectricMeter: targetRoom?.currElectricMeter || targetRoom?.prevElectricMeter || 400,
      currElectricMeter: (targetRoom?.currElectricMeter || targetRoom?.prevElectricMeter || 400) + 90,
      waterRate: 9,
      electricRate: 4,
      commonFee: 300,
    });
    setShowBillModal(true);
  };

  const handleRoomSelectInBill = (roomId: string) => {
    const rm = rooms.find(r => r.id === roomId);
    const lease = leases.find(l => l.roomId === roomId && l.status === 'Active');

    if (rm) {
      setBillFormData(prev => ({
        ...prev,
        roomId: rm.id,
        roomNumber: rm.roomNumber,
        tenantName: lease?.tenantName || rm.currentTenantName || 'Tenant',
        rentAmount: lease?.rentAmount || rm.price || 5500,
        prevWaterMeter: rm.currWaterMeter || rm.prevWaterMeter || 100,
        currWaterMeter: (rm.currWaterMeter || rm.prevWaterMeter || 100) + 8,
        prevElectricMeter: rm.currElectricMeter || rm.prevElectricMeter || 400,
        currElectricMeter: (rm.currElectricMeter || rm.prevElectricMeter || 400) + 90,
      }));
    }
  };

  const handleSaveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveUtilityBill(billFormData);
    toast.success('Utility bill calculated and saved successfully');
    setShowBillModal(false);
    fetchData();
  };

  const handleToggleStatus = async (billId: string, currentStatus: UtilityBill['status']) => {
    const nextStatus = currentStatus === 'Pending' ? 'Paid' : 'Pending';
    await updateBillStatus(billId, nextStatus);
    toast.success(`Status updated to ${nextStatus}`);
    fetchData();
  };

  const waterUnitsPreview = Math.max(0, (billFormData.currWaterMeter || 0) - (billFormData.prevWaterMeter || 0));
  const electricUnitsPreview = Math.max(0, (billFormData.currElectricMeter || 0) - (billFormData.prevElectricMeter || 0));
  const waterAmtPreview = waterUnitsPreview * (billFormData.waterRate || 9);
  const electricAmtPreview = electricUnitsPreview * (billFormData.electricRate || 4);
  const totalAmtPreview = (billFormData.rentAmount || 0) + waterAmtPreview + electricAmtPreview + (billFormData.commonFee || 0);

  const availableMonths = Array.from(new Set(['August 2026', 'July 2026', 'June 2026', ...bills.map(b => b.billingMonth)])).filter((m): m is string => Boolean(m));

  const filteredBills = bills.filter(b => {
    const matchesSearch = (b.roomNumber || '').includes(search) || (b.tenantName || '').toLowerCase().includes(search.toLowerCase()) || (b.invoiceNo || '').includes(search);
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesMonth = monthFilter === 'All' || b.billingMonth === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2.5">
            <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            {t('util.title')}
          </h1>
          <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
            {t('util.sub')}
          </p>
        </div>

        <button
          onClick={handleOpenNewBillModal}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> {t('util.newBill')}
        </button>
      </div>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl">
          <span className="text-xs text-nike-mute dark:text-nike-stone font-medium">{t('util.paid')}</span>
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
            {bills.filter(b => b.status === 'Paid').length} {language === 'th' ? 'บิล' : 'bills'}
          </span>
        </div>
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl">
          <span className="text-xs text-nike-mute dark:text-nike-stone font-medium">{t('util.pending')}</span>
          <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 block mt-1">
            {bills.filter(b => b.status === 'Pending').length} {language === 'th' ? 'บิล' : 'bills'}
          </span>
        </div>
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl">
          <span className="text-xs text-nike-mute dark:text-nike-stone font-medium">{language === 'th' ? 'อัตราค่าน้ำไฟมาตรฐาน' : 'Standard Utility Rates'}</span>
          <span className="text-sm font-bold text-nike-ink dark:text-white block mt-1">
            {t('util.rates')}
          </span>
        </div>
      </div>

      {/* BILLS & RECEIPTS TABLE */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-nike-ink dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {language === 'th' ? 'รายการบิลและใบเสร็จ' : 'Bills & Receipts Directory'}
          </h3>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* MONTH FILTER DROPDOWN */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-surface border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white font-semibold cursor-pointer focus:outline-none"
            >
              <option value="All">{language === 'th' ? 'ทุกงวดเดือน (All Months)' : 'All Months'}</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <div className="flex bg-nike-soft-cloud dark:bg-nike-dark-surface p-1 rounded-xl border border-nike-hairline dark:border-nike-dark-card text-xs">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${statusFilter === 'All' ? 'bg-nike-canvas dark:bg-nike-dark-elevated text-nike-ink dark:text-white shadow-xs' : 'text-nike-mute'}`}
              >
                {t('common.all')}
              </button>
              <button
                onClick={() => setStatusFilter('Pending')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${statusFilter === 'Pending' ? 'bg-nike-canvas dark:bg-nike-dark-elevated text-amber-600 dark:text-amber-400 shadow-xs' : 'text-nike-mute'}`}
              >
                {t('status.unpaid')}
              </button>
              <button
                onClick={() => setStatusFilter('Paid')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${statusFilter === 'Paid' ? 'bg-nike-canvas dark:bg-nike-dark-elevated text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-nike-mute'}`}
              >
                {t('status.paid')}
              </button>
            </div>

            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-nike-mute" />
              <input
                type="text"
                placeholder={language === 'th' ? 'ค้นหาเลขห้อง/บิล...' : 'Search unit or bill no...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-surface border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-nike-hairline dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-semibold">
                <th className="p-3">Invoice No / Unit</th>
                <th className="p-3">Billing Month</th>
                <th className="p-3">Water (Units / Amt)</th>
                <th className="p-3">Electric (Units / Amt)</th>
                <th className="p-3">Grand Total</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Receipt Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nike-hairline/60 dark:divide-nike-dark-card/60">
              {filteredBills.map((bill) => {
                const wUnits = Math.max(0, bill.currWaterMeter - bill.prevWaterMeter);
                const eUnits = Math.max(0, bill.currElectricMeter - bill.prevElectricMeter);
                return (
                  <tr key={bill.id} className="hover:bg-nike-soft-cloud/50 dark:hover:bg-nike-dark-card/30">
                    <td className="p-3">
                      <span className="font-bold text-nike-ink dark:text-white text-sm block">{t('common.unit')} {bill.roomNumber}</span>
                      <span className="text-[11px] text-nike-stone">{bill.invoiceNo}</span>
                    </td>
                    <td className="p-3 text-nike-mute dark:text-nike-stone">
                      {bill.billingMonth}
                    </td>
                    <td className="p-3 text-nike-mute dark:text-nike-stone">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{wUnits} units</span>
                      <span className="block text-[11px] text-nike-stone">({formatCurrency(bill.waterAmount)})</span>
                    </td>
                    <td className="p-3 text-nike-mute dark:text-nike-stone">
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">{eUnits} units</span>
                      <span className="block text-[11px] text-nike-stone">({formatCurrency(bill.electricAmount)})</span>
                    </td>
                    <td className="p-3 font-bold text-nike-ink dark:text-white text-sm">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(bill.id, bill.status)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          bill.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {bill.status === 'Paid' ? t('status.paid') : t('status.unpaid')}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedBillForReceipt(bill)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print/Download Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW BILL & METER ENTRY MODAL */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveBill} className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-3">
              <h3 className="text-lg font-bold text-nike-ink dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Meter Reading & Utility Bill Entry
              </h3>
            </div>

            <div className="space-y-3 text-xs">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">
                    {language === 'th' ? 'ห้องพัก (Unit) *' : 'Unit *'}
                  </label>
                  <select
                    required
                    value={billFormData.roomId}
                    onChange={(e) => handleRoomSelectInBill(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all cursor-pointer font-medium"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {t('common.unit')} {r.roomNumber} ({r.currentTenantName || (language === 'th' ? 'ไม่มีผู้เช่า' : 'No Tenant')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">
                    {language === 'th' ? 'ประจำเดือน (Month) *' : 'Billing Month *'}
                  </label>
                  <select
                    required
                    value={currentMonthPart}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all cursor-pointer font-semibold"
                  >
                    {MONTH_NAMES.map(m => (
                      <option key={m.value} value={m.value}>
                        {language === 'th' ? m.th : m.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">
                    {language === 'th' ? 'ประจำปี (Year) *' : 'Billing Year *'}
                  </label>
                  <select
                    required
                    value={currentYearPart}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all cursor-pointer font-semibold"
                  >
                    {YEAR_OPTIONS.map(yr => (
                      <option key={yr} value={yr.toString()}>
                        {language === 'th' ? `${yr + 543} (${yr})` : yr.toString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">
                  {language === 'th' ? 'ชื่อผู้เช่า (Tenant Name)' : 'Tenant Name'}
                </label>
                <input
                  type="text"
                  readOnly
                  value={billFormData.tenantName || ''}
                  className="w-full p-2.5 rounded-xl bg-nike-soft-cloud/70 dark:bg-nike-dark-surface/70 border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white cursor-not-allowed font-semibold"
                />
              </div>

              {/* WATER METER ENTRY */}
              <div className="p-3 bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4" /> {language === 'th' ? 'จดมิเตอร์น้ำประปา' : 'Water Meter Reading'}
                  </span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold bg-blue-500/15 px-2 py-0.5 rounded-md">
                    {language === 'th' ? 'อัตราค่าน้ำ: 9 ฿/หน่วย' : 'Rate: ฿9/unit'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[11px] text-nike-stone block">{language === 'th' ? 'เลขครั้งก่อน' : 'Prev Reading'}</span>
                    <input
                      type="number"
                      required
                      value={billFormData.prevWaterMeter || 0}
                      onChange={(e) => setBillFormData({ ...billFormData, prevWaterMeter: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-nike-stone block">{language === 'th' ? 'เลขครั้งนี้' : 'Curr Reading'}</span>
                    <input
                      type="number"
                      required
                      value={billFormData.currWaterMeter || 0}
                      onChange={(e) => setBillFormData({ ...billFormData, currWaterMeter: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-nike-stone block">{language === 'th' ? 'อัตรา (฿/หน่วย)' : 'Rate (฿/unit)'}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="50"
                      required
                      value={billFormData.waterRate ?? 9}
                      onChange={(e) => setBillFormData({ ...billFormData, waterRate: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-xs text-blue-600"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-nike-stone block">{language === 'th' ? 'รวมค่าน้ำ' : 'Usage × Rate'}</span>
                    <span className="text-xs font-bold text-blue-600 block mt-2">
                      {waterUnitsPreview} {language === 'th' ? 'หน่วย' : 'units'} = {formatCurrency(waterAmtPreview)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ELECTRIC METER ENTRY */}
              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> {language === 'th' ? 'จดมิเตอร์ไฟฟ้า' : 'Electric Meter Reading'}
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-500/15 px-2 py-0.5 rounded-md">
                    {language === 'th' ? 'อัตราค่าไฟ: 4 ฿/หน่วย' : 'Rate: ฿4/unit'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[11px] text-nike-stone block">{language === 'th' ? 'เลขครั้งก่อน' : 'Prev Reading'}</span>
                    <input
                      type="number"
                      required
                      value={billFormData.prevElectricMeter || 0}
                      onChange={(e) => setBillFormData({ ...billFormData, prevElectricMeter: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-nike-stone block">{language === 'th' ? 'เลขครั้งนี้' : 'Curr Reading'}</span>
                    <input
                      type="number"
                      required
                      value={billFormData.currElectricMeter || 0}
                      onChange={(e) => setBillFormData({ ...billFormData, currElectricMeter: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-nike-stone block">{language === 'th' ? 'อัตรา (฿/หน่วย)' : 'Rate (฿/unit)'}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="10"
                      required
                      value={billFormData.electricRate ?? 4}
                      onChange={(e) => setBillFormData({ ...billFormData, electricRate: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-xs text-amber-600"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-nike-stone block">{language === 'th' ? 'รวมค่าไฟ' : 'Usage × Rate'}</span>
                    <span className="text-xs font-bold text-amber-600 block mt-2">
                      {electricUnitsPreview} {language === 'th' ? 'หน่วย' : 'units'} = {formatCurrency(electricAmtPreview)}
                    </span>
                  </div>
                </div>
              </div>

              {/* TOTAL CALCULATION PREVIEW */}
              <div className="p-4 bg-nike-soft-cloud dark:bg-nike-dark-surface rounded-xl border border-nike-hairline dark:border-nike-dark-card space-y-1 text-xs">
                <div className="flex justify-between text-nike-mute">
                  <span>{language === 'th' ? 'ค่าเช่าห้อง:' : 'Room Rent:'}</span>
                  <span className="font-semibold text-nike-ink dark:text-white">{formatCurrency(billFormData.rentAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-nike-mute">
                  <span>{language === 'th' ? `ค่าน้ำประปา (${waterUnitsPreview} หน่วย @ ${billFormData.waterRate ?? 9}):` : `Water (${waterUnitsPreview} units @ ${billFormData.waterRate ?? 9}):`}</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(waterAmtPreview)}</span>
                </div>
                <div className="flex justify-between text-nike-mute">
                  <span>{language === 'th' ? `ค่าไฟฟ้า (${electricUnitsPreview} หน่วย @ ${billFormData.electricRate ?? 4}):` : `Electricity (${electricUnitsPreview} units @ ${billFormData.electricRate ?? 4}):`}</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(electricAmtPreview)}</span>
                </div>
                <div className="flex justify-between text-nike-mute">
                  <span>{language === 'th' ? 'ค่าส่วนกลาง:' : 'Common Fee:'}</span>
                  <span className="font-semibold text-nike-ink dark:text-white">{formatCurrency(billFormData.commonFee || 300)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-nike-hairline dark:border-nike-dark-card font-bold text-sm text-nike-ink dark:text-white">
                  <span>{language === 'th' ? 'ยอดรวมสุทธิ:' : 'Grand Total:'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAmtPreview)}</span>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-nike-hairline dark:border-nike-dark-card">
              <button
                type="button"
                onClick={() => setShowBillModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card text-nike-ink dark:text-white cursor-pointer"
              >
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                {language === 'th' ? 'บันทึกและสร้างบิล' : 'Save & Generate Bill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {selectedBillForReceipt && (
        <ReceiptModal
          bill={selectedBillForReceipt}
          onClose={() => setSelectedBillForReceipt(null)}
        />
      )}

    </div>
  );
};
