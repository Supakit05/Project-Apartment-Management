import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Booking, Room, MaintenanceTask, MaintenanceCategory, MaintenancePriority } from '../../types';
import { getUserBookings, getRooms, getMaintenanceTasks, saveMaintenanceTask } from '../../services/api';
import { formatCurrency, formatDate, getTranslatedRoomName, getTranslatedRoomType } from '../../utils/formatters';
import {
  Home, Building2, Wrench, Calendar, CheckCircle2, Clock,
  Lock, Plus, FileText, UserCheck, AlertCircle, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const MyApartmentPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [matchedRoom, setMatchedRoom] = useState<Room | null>(null);
  const [unitTasks, setUnitTasks] = useState<MaintenanceTask[]>([]);

  // Repair Modal State
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [submittingRepair, setSubmittingRepair] = useState(false);
  const [repairCategory, setRepairCategory] = useState<MaintenanceCategory>('Light bulb replacement');
  const [repairPriority, setRepairPriority] = useState<MaintenancePriority>('Medium');
  const [repairDescription, setRepairDescription] = useState('');

  const loadTenantData = async () => {
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [userBookings, allRooms, allTasks] = await Promise.all([
        getUserBookings(user.email),
        getRooms(),
        getMaintenanceTasks(),
      ]);

      // Find an approved or active booking for this user
      const active = userBookings.find(b => b.status === 'Approved' || b.status === 'Completed' || b.status === 'Pending') || userBookings[0] || null;
      setActiveBooking(active);

      if (active) {
        const cleanActiveNum = (active.roomNumber || '').trim();
        const room = allRooms.find(r => 
          r.id === active.roomId || 
          r.roomNumber === cleanActiveNum ||
          r.roomNumber === `A${cleanActiveNum}` ||
          r.roomNumber === `B${cleanActiveNum}` ||
          r.roomNumber.replace(/^[AB]/i, '') === cleanActiveNum.replace(/^[AB]/i, '')
        );
        setMatchedRoom(room || null);

        // Filter maintenance tasks specifically for this unit
        const roomNum = active.roomNumber || room?.roomNumber;
        if (roomNum) {
          const roomTasks = allTasks.filter(t => t.roomNumber === roomNum);
          setUnitTasks(roomTasks);
        }
      }
    } catch (err) {
      console.error('Failed to load tenant apartment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, [isAuthenticated, user?.email]);

  const handleOpenRepairModal = () => {
    setRepairCategory('Light bulb replacement');
    setRepairPriority('Medium');
    setRepairDescription('');
    setShowRepairModal(true);
  };

  const handleSubmitRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairDescription.trim()) {
      toast.error(language === 'th' ? 'กรุณาระบุรายละเอียดอาการชำรุด' : 'Please provide issue description');
      return;
    }

    const roomNum = activeBooking?.roomNumber || matchedRoom?.roomNumber || '101';
    const roomId = matchedRoom?.id || activeBooking?.roomId || '';

    setSubmittingRepair(true);
    try {
      await saveMaintenanceTask({
        roomId,
        roomNumber: roomNum,
        occupancyType: 'Occupied',
        category: repairCategory,
        priority: repairPriority,
        status: 'Pending',
        assignedWorker: language === 'th' ? 'ช่างประจำอาคาร' : 'Building Technician',
        laborCost: 0,
        description: repairDescription.trim(),
      });

      toast.success(
        language === 'th' 
          ? `ส่งแจ้งซ่อมบำรุงห้อง ${roomNum} เรียบร้อยแล้ว` 
          : `Maintenance request submitted for Unit ${roomNum}`
      );
      setShowRepairModal(false);
      loadTenantData();
    } catch (err) {
      console.error('Failed to submit repair:', err);
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาดในการส่งข้อมูลแจ้งซ่อม' : 'Failed to submit maintenance request');
    } finally {
      setSubmittingRepair(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
          {language === 'th' ? 'กรุณาเข้าสู่ระบบเพื่อใช้งานระบบห้องพักของฉัน' : 'Please Sign In to Access Your Unit Portal'}
        </h1>
        <p className="text-sm text-nike-mute dark:text-nike-stone max-w-md mx-auto">
          {language === 'th' 
            ? 'เข้าสู่ระบบด้วยบัญชีผู้เช่าเพื่อดูรายละเอียดห้องพัก สัญญาเช่า และส่งเรื่องแจ้งซ่อมบำรุงอัตโนมัติ'
            : 'Sign in to your resident account to view unit specs, lease contract, and auto-locked maintenance reporting.'}
        </p>
        <div>
          <Link
            to="/check-booking"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full text-sm shadow-md transition-all cursor-pointer"
          >
            {t('nav.signIn')} / {t('nav.checkBooking')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm font-medium text-nike-mute dark:text-nike-stone">
          {language === 'th' ? 'กำลังโหลดข้อมูลห้องพักของคุณ...' : 'Loading your resident portal...'}
        </p>
      </div>
    );
  }

  if (!activeBooking) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Home className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
          {language === 'th' ? 'ไม่พบห้องพักที่อนุมัติในขณะนี้' : 'No Active Rented Unit Found'}
        </h1>
        <p className="text-sm text-nike-mute dark:text-nike-stone max-w-md mx-auto">
          {language === 'th'
            ? 'หากคุณได้ส่งคำขอจองห้องพักแล้ว สามารถตรวจสอบสถานะการอนุมัติได้ที่หน้า "ตรวจสอบการจอง"'
            : 'If you submitted a booking application, check your application approval status on "Check Booking".'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/check-booking"
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {t('nav.checkBooking')}
          </Link>
          <Link
            to="/rooms"
            className="px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {t('nav.units')}
          </Link>
        </div>
      </div>
    );
  }

  const roomNum = activeBooking.roomNumber || matchedRoom?.roomNumber || '101';
  const buildingName = matchedRoom?.buildingName || (roomNum.toUpperCase().startsWith('B') ? 'อาคาร B (Victory Residence B)' : 'อาคาร A (Victory Tower A)');
  const buildingDisplay = language === 'en' 
    ? (buildingName.includes('อาคาร A') ? 'Building A (Victory Tower A)' : 'Building B (Victory Residence B)') 
    : buildingName;

  const isLeaseActive = activeBooking.status === 'Approved' || activeBooking.status === 'Completed';

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nike-hairline dark:border-nike-dark-card pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === 'th' ? 'ผู้เช่าที่ยืนยันแล้ว' : 'Verified Resident'}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isLeaseActive 
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                : activeBooking.status === 'Cancelled' || activeBooking.status === 'Rejected'
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                  : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            }`}>
              {isLeaseActive 
                ? (language === 'th' ? 'สัญญาใช้งานอยู่' : 'Active Lease')
                : activeBooking.status === 'Cancelled'
                  ? (language === 'th' ? 'ยกเลิกการจองแล้ว' : 'Booking Cancelled')
                  : activeBooking.status === 'Rejected'
                    ? (language === 'th' ? 'ไม่อนุมัติการจอง' : 'Booking Rejected')
                    : (language === 'th' ? 'รออนุมัติการจอง' : 'Pending Approval')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white mt-2 flex items-center gap-2">
            <Home className="w-7 h-7 text-blue-600" />
            {language === 'th' ? `ห้องพักของฉัน (${t('common.unit')} ${roomNum})` : `My Apartment (${t('common.unit')} ${roomNum})`}
          </h1>
          <p className="text-xs sm:text-sm text-nike-mute dark:text-nike-stone mt-1">
            {buildingDisplay} · {language === 'th' ? 'ระบบจัดการข้อมูลผู้พักอาศัยและแจ้งซ่อมบำรุงประจำห้อง' : 'Resident Hub & Auto-Locked Unit Maintenance'}
          </p>
        </div>

        {isLeaseActive ? (
          <button
            onClick={handleOpenRepairModal}
            className="px-5 py-3 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            {language === 'th' ? 'แจ้งซ่อมบำรุงห้องพัก' : 'Report Maintenance'}
          </button>
        ) : (
          <div className="px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {activeBooking.status === 'Cancelled'
                ? (language === 'th' ? 'ยกเลิกสัญญา/การจองแล้ว (ไม่สามารถแจ้งซ่อมได้)' : 'Booking Cancelled (Maintenance Disabled)')
                : activeBooking.status === 'Rejected'
                  ? (language === 'th' ? 'คำขอไม่อนุมัติ (ไม่สามารถแจ้งซ่อมได้)' : 'Application Rejected (Maintenance Disabled)')
                  : (language === 'th' ? 'ระบบแจ้งซ่อมจะเปิดใช้งานหลังการจองได้รับการอนุมัติ' : 'Maintenance reporting unlocks after approval')}
            </span>
          </div>
        )}
      </div>

      {/* UNIT BANNER CARD */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {matchedRoom?.coverImage ? (
              <img
                src={matchedRoom.coverImage}
                alt={`Unit ${roomNum}`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-nike-hairline dark:border-nike-dark-card shadow-sm shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                <Building2 className="w-12 h-12" />
              </div>
            )}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
                {t('common.unit')} {roomNum} · {buildingDisplay}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-nike-ink dark:text-white">
                {matchedRoom ? getTranslatedRoomName(matchedRoom.roomName, matchedRoom.roomNumber, language) : `${t('common.unit')} ${roomNum}`}
              </h2>
              <p className="text-xs text-nike-mute dark:text-nike-stone font-medium">
                {matchedRoom?.roomType ? getTranslatedRoomType(matchedRoom.roomType, language) : 'Studio'} · {matchedRoom?.sizeSqm || 28} m² ({matchedRoom?.capacity || 2} {language === 'th' ? 'ท่าน' : 'Guests'})
              </p>
            </div>
          </div>

          <div className="bg-nike-soft-cloud dark:bg-nike-dark-surface p-4 rounded-2xl border border-nike-hairline dark:border-nike-dark-card text-left md:text-right shrink-0 w-full md:w-auto">
            <span className="text-xs text-nike-mute dark:text-nike-stone font-medium block">{t('roomMgmt.rent')}</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
              {formatCurrency(matchedRoom?.price || activeBooking.totalPrice || 6500)}
            </span>
            <span className="text-[11px] text-nike-stone font-medium block mt-0.5">/{t('common.month')}</span>
          </div>
        </div>

        {/* LEASE & RESIDENT SPECS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-nike-hairline dark:border-nike-dark-card">
          <div className="p-4 bg-nike-soft-cloud/60 dark:bg-nike-dark-surface/60 rounded-2xl border border-nike-hairline dark:border-nike-dark-card">
            <span className="text-xs text-nike-mute dark:text-nike-stone font-medium block">{t('tnt.colPeriod')}</span>
            <span className="text-sm font-bold text-nike-ink dark:text-white block mt-1">
              {formatDate(activeBooking.checkIn)} – {formatDate(activeBooking.checkOut)}
            </span>
          </div>

          <div className="p-4 bg-nike-soft-cloud/60 dark:bg-nike-dark-surface/60 rounded-2xl border border-nike-hairline dark:border-nike-dark-card">
            <span className="text-xs text-nike-mute dark:text-nike-stone font-medium block">{language === 'th' ? 'ชื่อผู้เช่าในสัญญา' : 'Contract Resident'}</span>
            <span className="text-sm font-bold text-nike-ink dark:text-white block mt-1">
              {activeBooking.guestName}
            </span>
            <span className="text-[11px] text-nike-stone block mt-0.5">{activeBooking.guestPhone}</span>
          </div>

          <div className="p-4 bg-nike-soft-cloud/60 dark:bg-nike-dark-surface/60 rounded-2xl border border-nike-hairline dark:border-nike-dark-card">
            <span className="text-xs text-nike-mute dark:text-nike-stone font-medium block">{language === 'th' ? 'การป้องกันสิทธิ์จอง' : 'Room Lock Policy'}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-2">
              <Lock className="w-3.5 h-3.5" />
              {language === 'th' ? 'ล็อคสิทธิ์แจ้งซ่อมเฉพาะห้องนี้' : 'Auto-locked to your assigned unit'}
            </span>
          </div>
        </div>
      </div>

      {/* UNIT MAINTENANCE REPAIR HISTORY SECTION */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-nike-hairline dark:border-nike-dark-card pb-4">
          <div>
            <h3 className="text-lg font-bold text-nike-ink dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-rose-600" />
              {language === 'th' ? `ประวัติการแจ้งซ่อมห้องพัก (${t('common.unit')} ${roomNum})` : `Unit Maintenance Tickets (${t('common.unit')} ${roomNum})`}
            </h3>
            <p className="text-xs text-nike-mute dark:text-nike-stone mt-0.5">
              {language === 'th' ? 'รายการแจ้งซ่อมที่ส่งจากห้องของคุณ สามารถติดตามสถานะการเข้าซ่อมได้ตลอด 24 ชม.' : 'Real-time repair ticket statuses for your specific apartment unit.'}
            </p>
          </div>

          {isLeaseActive && (
            <button
              onClick={handleOpenRepairModal}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              {language === 'th' ? 'แจ้งซ่อมใหม่' : 'New Ticket'}
            </button>
          )}
        </div>

        {unitTasks.length === 0 ? (
          <div className="text-center py-12 bg-nike-soft-cloud/50 dark:bg-nike-dark-surface/50 rounded-2xl border border-dashed border-nike-hairline dark:border-nike-dark-card p-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-nike-ink dark:text-white">
              {language === 'th' ? 'ยังไม่มีประวัติการแจ้งซ่อมสำหรับห้องนี้' : 'No Maintenance Issues Reported'}
            </h4>
            <p className="text-xs text-nike-mute dark:text-nike-stone max-w-sm mx-auto">
              {isLeaseActive
                ? (language === 'th' ? 'หากพบสิ่งอำนวยความสะดวกหรือหลอดไฟ ท่อน้ำ แอร์ชำรุด สามารถกดปุ่ม "แจ้งซ่อมบำรุงห้องพัก" ได้ทันที' : 'If any facility, lighting, plumbing, or AC requires repair, click "Report Maintenance".')
                : (language === 'th' ? 'ระบบเปิดให้แจ้งซ่อมบำรุงเฉพาะห้องพักที่มีสัญญาการเช่าที่ใช้งานอยู่เท่านั้น' : 'Maintenance reporting is available exclusively for active lease tenants.')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-nike-hairline dark:divide-nike-dark-card">
            {unitTasks.map((task) => (
              <div key={task.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-nike-ink dark:text-white bg-nike-soft-cloud dark:bg-nike-dark-surface px-2.5 py-1 rounded-lg border border-nike-hairline dark:border-nike-dark-card">
                      {task.category}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-nike-ink dark:text-white font-medium pt-1">
                    {task.description}
                  </p>
                  <span className="text-[11px] text-nike-stone block">
                    {language === 'th' ? 'ผู้รับผิดชอบ: ' : 'Assigned Technician: '}{task.assignedWorker || (language === 'th' ? 'นายช่างวิเชียร' : 'Wichian')}
                  </span>
                </div>

                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs ${
                    task.status === 'Completed' ? 'bg-emerald-500 text-white' :
                    task.status === 'In Progress' ? 'bg-blue-600 text-white animate-pulse' :
                    'bg-amber-500 text-white'
                  }`}>
                    {task.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {task.status === 'Completed' ? (language === 'th' ? 'ซ่อมเสร็จสิ้น' : 'Completed') :
                     task.status === 'In Progress' ? (language === 'th' ? 'กำลังดำเนินการซ่อม' : 'In Progress') :
                     (language === 'th' ? 'รอช่างรับเรื่อง' : 'Pending Verification')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AUTO-LOCKED REPAIR MODAL */}
      {showRepairModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-nike-hairline dark:border-nike-dark-card pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-nike-ink dark:text-white">
                    {language === 'th' ? 'แจ้งซ่อมบำรุงห้องพัก' : 'Report Unit Repair'}
                  </h3>
                  <p className="text-xs text-nike-mute dark:text-nike-stone">
                    {language === 'th' ? 'กรอกรายละเอียดปัญหาเพื่อแจ้งช่างเข้าดำเนินการ' : 'Submit repair details for building technician response.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRepairModal(false)}
                className="p-2 text-nike-mute hover:text-nike-ink dark:hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRepair} className="space-y-4">
              
              {/* AUTO-LOCKED ROOM NUMBER FIELD */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                    {t('roomMgmt.unitNo')}
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    {language === 'th' ? 'ล็อคเลขห้องของคุณอัตโนมัติ' : 'Auto-locked to your unit'}
                  </span>
                </div>
                <input
                  type="text"
                  disabled
                  value={`${t('common.unit')} ${roomNum} (${buildingDisplay})`}
                  className="w-full bg-transparent border-0 font-bold text-blue-950 dark:text-blue-100 text-sm focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* CATEGORY SELECTOR */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-nike-ink dark:text-white">
                  {language === 'th' ? 'หมวดหมู่อาการชำรุด *' : 'Issue Category *'}
                </label>
                <select
                  value={repairCategory}
                  onChange={(e) => setRepairCategory(e.target.value as MaintenanceCategory)}
                  className="w-full p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white text-xs rounded-xl focus:outline-none cursor-pointer font-medium"
                >
                  <option value="Light bulb replacement">{language === 'th' ? 'ระบบไฟฟ้า / หลอดไฟ (Lighting & Power)' : 'Lighting & Power'}</option>
                  <option value="Plumbing">{language === 'th' ? 'ระบบประปา / ห้องน้ำ (Plumbing & Sanitation)' : 'Plumbing & Sanitation'}</option>
                  <option value="Air-con servicing">{language === 'th' ? 'เครื่องปรับอากาศ / ล้างแอร์ (Air Conditioner)' : 'Air Conditioning'}</option>
                  <option value="Electrical">{language === 'th' ? 'ระบบไฟฟ้าหลัก / เบรกเกอร์ (Electrical System)' : 'Electrical System'}</option>
                  <option value="General Repair">{language === 'th' ? 'งานซ่อมทั่วไป (General Repair)' : 'General Repair'}</option>
                </select>
              </div>

              {/* PRIORITY SELECTOR */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-nike-ink dark:text-white">
                  {language === 'th' ? 'ระดับความสำคัญ *' : 'Priority Level *'}
                </label>
                <select
                  value={repairPriority}
                  onChange={(e) => setRepairPriority(e.target.value as MaintenancePriority)}
                  className="w-full p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white text-xs rounded-xl focus:outline-none cursor-pointer font-medium"
                >
                  <option value="Low">{language === 'th' ? 'ปกติ (Low - ซ่อมตามรอบ)' : 'Low (Standard)'}</option>
                  <option value="Medium">{language === 'th' ? 'ปานกลาง (Medium - ซ่อมภายใน 24 ชม.)' : 'Medium (Within 24 Hours)'}</option>
                  <option value="High">{language === 'th' ? 'ด่วน (High - ดำเนินการทันที / ฉุกเฉิน)' : 'High (Urgent Attention)'}</option>
                </select>
              </div>

              {/* DESCRIPTION TEXTAREA */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-nike-ink dark:text-white">
                  {language === 'th' ? 'รายละเอียดอาการชำรุด / ตำแหน่งที่พบ *' : 'Detailed Description *'}
                </label>
                <textarea
                  rows={3}
                  value={repairDescription}
                  onChange={(e) => setRepairDescription(e.target.value)}
                  placeholder={language === 'th' ? 'เช่น หลอดไฟระเบียงดับ, น้ำหยดใต้ซิงก์ล้างจาน...' : 'e.g. Balcony light bulb flickers, water drip under kitchen sink...'}
                  className="w-full p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white text-xs rounded-xl focus:outline-none placeholder-nike-mute"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRepairModal(false)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingRepair}
                  className="px-6 py-2.5 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingRepair ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                  {language === 'th' ? 'ส่งเรื่องแจ้งซ่อมบำรุง' : 'Submit Repair Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
