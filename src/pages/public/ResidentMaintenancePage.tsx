import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MaintenanceTask, Room } from '../../types';
import { getRooms, getMaintenanceTasks, saveMaintenanceTask, getUserMaintenanceTasks, getUserBookings } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import {
  Wrench, Plus, Clock, CheckCircle2, AlertTriangle,
  User, Phone, Calendar, ArrowRight, ShieldCheck,
  Zap, Droplets, Wind, Hammer, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const ResidentMaintenancePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasApprovedLease, setHasApprovedLease] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  // Form State
  const [formData, setFormData] = useState({
    roomId: '',
    roomNumber: '101',
    category: 'Light bulb replacement' as any,
    priority: 'Medium' as any,
    description: '',
    preferredTime: 'Morning (09:00 - 12:00)',
    reporterName: user?.fullname || '',
    reporterPhone: user?.phone || '',
    reporterEmail: user?.email || '',
  });

  // Sync user info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        reporterName: user.fullname || prev.reporterName,
        reporterPhone: user.phone || prev.reporterPhone,
        reporterEmail: user.email || prev.reporterEmail,
      }));
    }
  }, [user]);

  // Load rooms and user tasks
  const loadData = async () => {
    setLoading(true);
    try {
      const roomList = await getRooms();

      let userApproved = false;
      if (user?.role === 'admin') {
        userApproved = true;
        setRooms(roomList);
        if (roomList.length > 0 && !formData.roomId) {
          setFormData(prev => ({
            ...prev,
            roomId: roomList[0].id,
            roomNumber: roomList[0].roomNumber,
          }));
        }
      } else if (user?.email) {
        const userBookings = await getUserBookings(user.email);
        const approvedBookings = userBookings.filter(b => b.status === 'Approved' || b.status === 'Completed');
        if (approvedBookings.length > 0) {
          userApproved = true;
          const approvedRoomNums = approvedBookings.map(b => b.roomNumber);
          const userRooms = roomList.filter(r => approvedRoomNums.includes(r.roomNumber));
          const availableRooms = userRooms.length > 0 ? userRooms : roomList;
          setRooms(availableRooms);
          setFormData(prev => ({
            ...prev,
            roomId: availableRooms[0].id,
            roomNumber: availableRooms[0].roomNumber,
          }));
        }
      }
      setHasApprovedLease(userApproved);

      let allUserTasks: MaintenanceTask[] = [];
      if (user?.email) {
        allUserTasks = await getUserMaintenanceTasks(user.email);
      } else {
        const allTasks = await getMaintenanceTasks();
        allUserTasks = allTasks.slice(0, 5);
      }
      setTasks(allUserTasks);
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info(language === 'th' ? 'กรุณาเข้าสู่ระบบก่อนส่งคำขอแจ้งซ่อมบำรุง' : 'Please sign in before submitting a maintenance request', { duration: 5000 });
      navigate('/login');
      return;
    }

    if (!formData.description.trim()) {
      toast.error(language === 'th' ? 'กรุณาระบุรายละเอียดอาการชำรุด' : 'Please describe the issue in detail');
      return;
    }

    if (!formData.reporterPhone.trim()) {
      toast.error(language === 'th' ? 'กรุณาระบุเบอร์โทรศัพท์ติดต่อ' : 'Please provide contact phone number');
      return;
    }

    setSubmitting(true);
    try {
      const targetRoom = rooms.find(r => r.id === formData.roomId || r.roomNumber === formData.roomNumber);
      const isOccupied = targetRoom ? (targetRoom.status === 'Occupied' || !!targetRoom.currentTenantId) : false;

      const payload: Partial<MaintenanceTask> = {
        roomId: formData.roomId,
        roomNumber: formData.roomNumber,
        occupancyType: isOccupied ? 'Occupied' : 'Vacant/Common',
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        preferredTime: formData.preferredTime,
        reporterName: formData.reporterName || user?.fullname || 'Resident',
        reporterPhone: formData.reporterPhone || user?.phone || '',
        reporterEmail: formData.reporterEmail || user?.email || '',
        reportedDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        assignedWorker: language === 'th' ? 'รอเจ้าหน้าที่มอบหมายช่าง' : 'Pending Assignment',
      };

      const result = await saveMaintenanceTask(payload);
      toast.success(
        language === 'th' 
          ? `ส่งคำขอแจ้งซ่อมห้อง ${formData.roomNumber} เรียบร้อยแล้ว! รหัสงาน: ${result.taskNo}`
          : `Maintenance request for Unit ${formData.roomNumber} submitted! Ref: ${result.taskNo}`
      );
      
      // Instantly update task list state and switch to history
      setTasks(prev => [result, ...prev.filter(x => x.id !== result.id)]);
      setFormData(prev => ({ ...prev, description: '' }));
      setActiveTab('history');
      loadData();
    } catch (err: any) {
      toast.error(language === 'th' ? 'ไม่สามารถส่งคำขอแจ้งซ่อมได้ โปรดลองอีกครั้ง' : 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'High':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">{language === 'th' ? 'ด่วนมาก (High)' : 'High'}</span>;
      case 'Medium':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">{language === 'th' ? 'ปานกลาง (Medium)' : 'Medium'}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{language === 'th' ? 'ปกติ (Low)' : 'Low'}</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'th' ? 'ซ่อมเสร็จสิ้น (Completed)' : 'Completed'}
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5 animate-spin" /> {language === 'th' ? 'กำลังดำเนินการ (In Progress)' : 'In Progress'}
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" /> {language === 'th' ? 'รอตรวจสอบ (Pending)' : 'Pending'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
        <p className="text-sm font-medium text-nike-mute dark:text-nike-stone">
          {language === 'th' ? 'กำลังโหลดระบบแจ้งซ่อม...' : 'Loading maintenance portal...'}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
          {language === 'th' ? 'กรุณาเข้าสู่ระบบก่อนใช้งาน' : 'Please Sign In'}
        </h1>
        <p className="text-sm text-nike-mute dark:text-nike-stone max-w-md mx-auto">
          {language === 'th' ? 'เข้าสู่ระบบด้วยบัญชีผู้เช่าเพื่อแจ้งซ่อมบำรุงห้องพักของคุณ' : 'Sign in with your resident account to submit repair tickets.'}
        </p>
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 rounded-full text-sm shadow-md transition-all cursor-pointer"
          >
            {t('nav.signIn')}
          </Link>
        </div>
      </div>
    );
  }

  if (!hasApprovedLease && user?.role !== 'admin') {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
          {language === 'th' ? 'ระบบแจ้งซ่อมยังไม่เปิดใช้งาน' : 'Maintenance Reporting Not Available Yet'}
        </h1>
        <p className="text-sm text-nike-mute dark:text-nike-stone max-w-md mx-auto leading-relaxed">
          {language === 'th'
            ? 'ระบบแจ้งซ่อมบำรุงเปิดให้ใช้งานเฉพาะผู้พักอาศัยที่ได้รับการอนุมัติห้องพักจากผู้ดูแลระบบ (Admin) แล้วเท่านั้น'
            : 'Maintenance reporting is exclusively available for residents whose room booking has been approved by the Admin.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/check-booking"
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {language === 'th' ? 'ตรวจสอบสถานะการจอง' : 'Check Booking Status'}
          </Link>
          <Link
            to="/rooms"
            className="px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {language === 'th' ? 'ดูห้องพักทั้งหมด' : 'Browse Units'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-nike-ink dark:text-white">
          {language === 'th' ? 'แจ้งซ่อมบำรุงภายในห้องพัก' : 'In-Room Repair & Maintenance'}
        </h1>
        <p className="text-sm text-nike-mute dark:text-nike-stone max-w-xl mx-auto leading-relaxed">
          {language === 'th' 
            ? 'หากพบอุปกรณ์หรือระบบภายในห้องพักชำรุด สามารถกรอกรายละเอียดแจ้งเรื่องให้ผู้ดูแลระบบตรวจสอบและประสานงานช่างเข้าแก้ไขได้ทันที'
            : 'Report unit issues and maintenance requests. Our management team will coordinate technicians to inspect and repair promptly.'}
        </p>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-nike-dark-elevated border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'form'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" /> {language === 'th' ? 'แบบฟอร์มแจ้งซ่อมใหม่' : 'New Request Form'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" /> {language === 'th' ? 'ประวัติและสถานะงานซ่อม' : 'Maintenance History'}
          </button>
        </div>
      </div>

      {/* TAB 1: FORM */}
      {activeTab === 'form' && (
        <div className="bg-white dark:bg-nike-dark-elevated rounded-3xl border border-nike-hairline dark:border-nike-dark-card p-6 sm:p-10 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* ROOM SELECTION */}
              <div>
                <label className="block text-xs font-bold text-nike-ink dark:text-white mb-2">
                  {language === 'th' ? 'หมายเลขห้องพักที่ต้องการแจ้งซ่อม *' : 'Unit Number *'}
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => {
                    const found = rooms.find(r => r.id === e.target.value);
                    setFormData({
                      ...formData,
                      roomId: e.target.value,
                      roomNumber: found?.roomNumber || '101',
                    });
                  }}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {t('common.unit')} {r.roomNumber} ({r.roomType})
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-xs font-bold text-nike-ink dark:text-white mb-2">
                  {language === 'th' ? 'หมวดหมู่อุปกรณ์ที่ชำรุด *' : 'Maintenance Category *'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
                >
                  <option value="Light bulb replacement">{language === 'th' ? 'ระบบไฟฟ้า / เปลี่ยนหลอดไฟ (Electrical & Lighting)' : 'Electrical & Lighting'}</option>
                  <option value="Air-con servicing">{language === 'th' ? 'เครื่องปรับอากาศ / แอร์ไม่เย็น (Air-Conditioning)' : 'Air-Conditioning & AC Service'}</option>
                  <option value="Plumbing">{language === 'th' ? 'ระบบประปา / ก๊อกน้ำ / ท่อระบายน้ำ (Plumbing & Water)' : 'Plumbing & Drainage'}</option>
                  <option value="General Repair">{language === 'th' ? 'เฟอร์นิเจอร์ / ประตูหน้าต่าง / ซ่อมทั่วไป (General Repair)' : 'Furniture & General Repair'}</option>
                </select>
              </div>

            </div>

            {/* PRIORITY & PREFERRED TIME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-nike-ink dark:text-white mb-2">
                  {language === 'th' ? 'ระดับความสำคัญ / ความเร่งด่วน *' : 'Priority Level *'}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
                >
                  <option value="Low">{language === 'th' ? 'ปกติ (Low) - ภายใน 2-3 วัน' : 'Low - Within 2-3 days'}</option>
                  <option value="Medium">{language === 'th' ? 'ปานกลาง (Medium) - ภายใน 24 ชม.' : 'Medium - Within 24 hours'}</option>
                  <option value="High">{language === 'th' ? 'ด่วนมาก (High) - น้ำรั่ว / ไฟฟ้าดับ / เร่งด่วน' : 'High - Urgent / Water leak / Power outage'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-nike-ink dark:text-white mb-2">
                  {language === 'th' ? 'ช่วงเวลาที่สะดวกให้ช่างเข้าตรวจสอบ' : 'Preferred Inspection Time'}
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
                >
                  <option value="Morning (09:00 - 12:00)">{language === 'th' ? 'ช่วงเช้า (09:00 - 12:00 น.)' : 'Morning (09:00 - 12:00)'}</option>
                  <option value="Afternoon (13:00 - 17:00)">{language === 'th' ? 'ช่วงบ่าย (13:00 - 17:00 น.)' : 'Afternoon (13:00 - 17:00)'}</option>
                  <option value="Evening (17:00 - 19:00)">{language === 'th' ? 'ช่วงเย็น (17:00 - 19:00 น.)' : 'Evening (17:00 - 19:00)'}</option>
                  <option value="Anytime (Call before arrival)">{language === 'th' ? 'สะดวกทุกเวลา (เจ้าหน้าที่ติดต่อก่อนเข้า)' : 'Anytime (Call before arrival)'}</option>
                </select>
              </div>

            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-bold text-nike-ink dark:text-white mb-2">
                {language === 'th' ? 'รายละเอียดอาการชำรุด / ปัญหาที่พบ *' : 'Issue Description *'}
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'th' ? 'ระบุอาการชำรุด เช่น แอร์มีน้ำหยด, หลอดไฟห้องน้ำไม่ติด, ก๊อกน้ำอ่างล้างหน้าปิดไม่สนิท...' : 'Describe the issue (e.g. AC leaking water, bathroom light not working, sink tap loose)...'}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                required
              />
            </div>

            {/* REPORTER CONTACT INFO */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {language === 'th' ? 'ข้อมูลผู้แจ้ง / เบอร์โทรศัพท์ติดต่อ' : 'Contact Information'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">{language === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}</label>
                  <input
                    type="text"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    placeholder={language === 'th' ? 'ชื่อผู้แจ้ง' : 'Contact Name'}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">{language === 'th' ? 'เบอร์โทรศัพท์ติดต่อ *' : 'Phone Number *'}</label>
                  <input
                    type="tel"
                    value={formData.reporterPhone}
                    onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                    placeholder="081-234-5678"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'th' ? 'กำลังส่งข้อมูล...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  <span>{language === 'th' ? 'ส่งคำขอแจ้งซ่อม' : 'Submit Maintenance Request'}</span>
                </>
              )}
            </button>

          </form>
        </div>
      )}

      {/* TAB 2: HISTORY & STATUS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16 text-slate-400 font-medium flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> {language === 'th' ? 'กำลังโหลดประวัติงานซ่อม...' : 'Loading repair history...'}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-nike-dark-elevated rounded-3xl border border-nike-hairline dark:border-nike-dark-card space-y-3 p-8">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-nike-ink dark:text-white">{language === 'th' ? 'ยังไม่มีประวัติการแจ้งซ่อม' : 'No Maintenance History'}</h3>
              <p className="text-xs text-nike-mute max-w-sm mx-auto">
                {language === 'th' ? 'หากอุปกรณ์ในห้องพักชำรุด สามารถกดแท็บ "แบบฟอร์มแจ้งซ่อมใหม่" เพื่อส่งเรื่องให้แอดมินและช่างได้ทันที' : 'If any unit fixtures need repair, use the "New Request Form" tab to notify management.'}
              </p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="bg-white dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm"
              >
                {/* TOP HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-nike-hairline dark:border-neutral-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full">
                        {t('common.unit')} {task.roomNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                        {task.taskNo}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-nike-ink dark:text-white mt-1">
                      {task.category}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>

                {/* PROGRESS TRACKER */}
                <div className="py-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center mx-auto text-xs">
                        1
                      </div>
                      <span className="text-nike-ink dark:text-white font-bold block">{language === 'th' ? 'แจ้งเรื่องเข้าระบบ' : 'Reported'}</span>
                      <span className="text-[10px] text-nike-mute block">{task.reportedDate || (language === 'th' ? 'บันทึกแล้ว' : 'Logged')}</span>
                    </div>

                    <div className="space-y-1">
                      <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                        task.status === 'In Progress' || task.status === 'Completed'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        2
                      </div>
                      <span className={`block font-bold ${task.status === 'In Progress' ? 'text-blue-600 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {language === 'th' ? 'เจ้าหน้าที่มอบหมายช่าง' : 'Technician Assigned'}
                      </span>
                      <span className="text-[10px] text-nike-mute block">
                        {task.assignedWorker || (language === 'th' ? 'รอประสานงานช่าง' : 'Pending')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                        task.status === 'Completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {task.status === 'Completed' ? '✓' : '3'}
                      </div>
                      <span className={`block font-bold ${task.status === 'Completed' ? 'text-emerald-600 font-extrabold' : 'text-slate-400'}`}>
                        {language === 'th' ? 'ซ่อมแซมเสร็จสิ้น' : 'Resolved'}
                      </span>
                      <span className="text-[10px] text-nike-mute block">
                        {task.status === 'Completed' ? (language === 'th' ? 'เรียบร้อย' : 'Done') : (language === 'th' ? 'รอช่างเข้าแก้ไข' : 'In Queue')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-medium block">{language === 'th' ? 'รายละเอียดอาการชำรุด:' : 'Issue Details:'}</span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                  {task.preferredTime && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>{language === 'th' ? 'ช่วงเวลาที่สะดวก: ' : 'Preferred Time: '}<strong className="text-slate-800 dark:text-white">{task.preferredTime}</strong></span>
                    </div>
                  )}
                  {task.assignedWorker && task.assignedWorker !== 'รอเจ้าหน้าที่มอบหมายช่าง' && task.assignedWorker !== 'Pending Assignment' && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                      <User className="w-3.5 h-3.5" />
                      <span>{language === 'th' ? 'ช่างผู้รับผิดชอบงาน: ' : 'Assigned Technician: '}<strong>{task.assignedWorker}</strong></span>
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
