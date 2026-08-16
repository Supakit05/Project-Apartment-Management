import React, { useEffect, useState } from 'react';
import { MaintenanceTask, SupplyItem, MaintenanceLog, ScheduledReminder, Room } from '../../types';
import {
  getMaintenanceTasks, saveMaintenanceTask, deleteMaintenanceTask,
  getSupplies, saveSupply,
  getMaintenanceLogs, saveMaintenanceLog, deleteMaintenanceLog,
  getReminders, saveReminder, toggleReminder, getRooms
} from '../../services/api';
import { formatCurrency, formatDate, formatSuppliesSummary } from '../../utils/formatters';
import { Wrench, Plus, Package, History, BellRing, CheckCircle2, Clock, Search, Pencil, Trash2, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

export const MaintenanceManagement: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tasks' | 'supplies' | 'logs' | 'reminders'>('tasks');
  const [occupancyFilter, setOccupancyFilter] = useState<'All' | 'Occupied' | 'Vacant/Common'>('All');
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState<Partial<MaintenanceTask>>({
    category: 'Light bulb replacement',
    occupancyType: 'Occupied',
    priority: 'Medium',
    status: 'Pending',
    assignedWorker: 'นายช่างวิเชียร (ช่างประจำอาคาร)',
    laborCost: 150,
    totalCost: 150,
  });

  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [supplyFormData, setSupplyFormData] = useState<Partial<SupplyItem>>({
    unitName: 'pcs',
    stockQuantity: 10,
    unitCost: 100,
  });

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderFormData, setReminderFormData] = useState<Partial<ScheduledReminder>>({
    frequency: 'Every 6 Months',
    nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [selectedRoomForLogs, setSelectedRoomForLogs] = useState<string>('All');
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>('');
  const [selectedSupplyQty, setSelectedSupplyQty] = useState<number>(1);
  const [usedSuppliesList, setUsedSuppliesList] = useState<Array<{ supplyId: string; name: string; quantity: number; unitCost: number; unitName: string }>>([]);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logFormData, setLogFormData] = useState<Partial<MaintenanceLog>>({});

  const handleEditLog = (log: MaintenanceLog) => {
    setLogFormData(log);
    setShowLogModal(true);
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveMaintenanceLog(logFormData);
      toast.success('บันทึกการแก้ไขประวัติงานซ่อมเรียบร้อยแล้ว');
      setShowLogModal(false);
      fetchData();
    } catch {
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('คุณต้องการลบประวัติงานซ่อมนี้ใช่หรือไม่?')) return;
    try {
      await deleteMaintenanceLog(id);
      toast.success('ลบประวัติงานซ่อมเรียบร้อยแล้ว');
      fetchData();
    } catch {
      toast.error('ไม่สามารถลบรายการได้');
    }
  };

  const fetchData = async () => {
    try {
      setTasks(await getMaintenanceTasks());
      const supList = await getSupplies();
      setSupplies(supList);
      if (supList.length > 0 && !selectedSupplyId) {
        setSelectedSupplyId(supList[0].id);
      }
      setLogs(await getMaintenanceLogs());
      setReminders(await getReminders());
      setRooms(await getRooms());
    } catch (err) {
      console.error('Failed to fetch maintenance data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAddSupplyToTask = () => {
    const target = supplies.find(s => s.id === selectedSupplyId);
    if (!target) return;
    const qty = Math.max(1, selectedSupplyQty);
    
    setUsedSuppliesList(prev => {
      const existingIndex = prev.findIndex(item => item.supplyId === target.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex].quantity += qty;
      } else {
        updated = [...prev, {
          supplyId: target.id,
          name: target.name,
          quantity: qty,
          unitCost: target.unitCost,
          unitName: target.unitName || 'ชิ้น',
        }];
      }

      // Compute costs
      const suppliesCost = updated.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
      const labor = taskFormData.laborCost || 0;
      const suppliesSummary = updated.map(item => `${item.name} x${item.quantity} (฿${item.quantity * item.unitCost})`).join(', ');

      setTaskFormData(f => ({
        ...f,
        suppliesUsed: suppliesSummary,
        totalCost: labor + suppliesCost,
      }));

      return updated;
    });

    toast.success(`เพิ่ม ${target.name} x${qty} เรียบร้อยแล้ว`);
  };

  const handleRemoveSupplyFromTask = (supplyId: string) => {
    setUsedSuppliesList(prev => {
      const updated = prev.filter(item => item.supplyId !== supplyId);
      const suppliesCost = updated.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
      const labor = taskFormData.laborCost || 0;
      const suppliesSummary = updated.length > 0
        ? updated.map(item => `${item.name} x${item.quantity} (฿${item.quantity * item.unitCost})`).join(', ')
        : '';

      setTaskFormData(f => ({
        ...f,
        suppliesUsed: suppliesSummary,
        totalCost: labor + suppliesCost,
      }));

      return updated;
    });
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...taskFormData };
      // Ensure roomId and roomNumber are set
      if (!payload.roomId && rooms.length > 0) {
        payload.roomId = rooms[0].id;
        payload.roomNumber = rooms[0].roomNumber;
      } else if (payload.roomId && !payload.roomNumber) {
        const rm = rooms.find(r => r.id === payload.roomId);
        if (rm) payload.roomNumber = rm.roomNumber;
      }
      if (!payload.occupancyType && payload.roomNumber) {
        const rm = rooms.find(r => r.roomNumber === payload.roomNumber || r.id === payload.roomId);
        payload.occupancyType = (rm && (rm.status === 'Occupied' || !!rm.currentTenantId)) ? 'Occupied' : 'Vacant/Common';
      }

      await saveMaintenanceTask(payload);

      // Auto-deduct stock for used supplies
      if (usedSuppliesList.length > 0) {
        for (const used of usedSuppliesList) {
          const sup = supplies.find(s => s.id === used.supplyId);
          if (sup) {
            const newStock = Math.max(0, (sup.stockQuantity || 0) - used.quantity);
            await saveSupply({ ...sup, stockQuantity: newStock });
          }
        }
      }

      toast.success('บันทึกข้อมูลงานซ่อม ค่าใช้จ่าย และตัดสต็อกอะไหล่เรียบร้อยแล้ว');
      setShowTaskModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save maintenance task:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleEditTask = (task: MaintenanceTask) => {
    setUsedSuppliesList([]);
    setTaskFormData({
      ...task,
      laborCost: task.laborCost || 0,
      totalCost: task.totalCost || 0,
      suppliesUsed: task.suppliesUsed || '',
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('คุณต้องการลบรายการแจ้งซ่อมนี้ใช่หรือไม่?')) return;
    try {
      await deleteMaintenanceTask(id);
      toast.success('ลบรายการแจ้งซ่อมเรียบร้อยแล้ว');
      fetchData();
    } catch {
      toast.error('ไม่สามารถลบรายการได้');
    }
  };

  const handleSaveSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSupply(supplyFormData);
    toast.success('บันทึกข้อมูลอะไหล่เรียบร้อยแล้ว');
    setShowSupplyModal(false);
    fetchData();
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveReminder(reminderFormData);
    toast.success('Scheduled reminder saved');
    setShowReminderModal(false);
    fetchData();
  };

  const handleToggleReminder = async (id: string) => {
    await toggleReminder(id);
    fetchData();
  };

  const getTaskOccupancy = (task: MaintenanceTask): 'Occupied' | 'Vacant/Common' => {
    if (task.occupancyType === 'Vacant/Common') return 'Vacant/Common';
    const rm = rooms.find(r => r.id === task.roomId || r.roomNumber === task.roomNumber);
    if (rm) {
      return (rm.status === 'Occupied' || !!rm.currentTenantId) ? 'Occupied' : 'Vacant/Common';
    }
    return task.occupancyType === 'Occupied' ? 'Occupied' : 'Vacant/Common';
  };

  const handleAdjustSupplyStock = async (item: SupplyItem, delta: number) => {
    const newQty = Math.max(0, (item.stockQuantity || 0) + delta);
    try {
      await saveSupply({ ...item, stockQuantity: newQty });
      toast.success(`${delta > 0 ? 'เพิ่มสต็อก' : 'ตัดสต็อก'} ${item.name} สำเร็จ (คงเหลือ: ${newQty} ${item.unitName})`);
      fetchData();
    } catch {
      toast.error('ไม่สามารถอัปเดตสต็อกได้');
    }
  };

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2.5">
            <Wrench className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            {t('mnt.title')}
          </h1>
          <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
            {t('mnt.sub')}
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-nike-hairline dark:border-nike-dark-card gap-4">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'tasks' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-nike-mute'
          }`}
        >
          <Wrench className="w-4 h-4" /> {t('mnt.activeTasks')} ({tasks.filter(t => t.status !== 'Completed').length})
        </button>

        <button
          onClick={() => setActiveTab('supplies')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'supplies' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-nike-mute'
          }`}
        >
          <Package className="w-4 h-4" /> {t('mnt.supplies')} ({supplies.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'logs' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-nike-mute'
          }`}
        >
          <History className="w-4 h-4" /> {t('mnt.logs')} ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'reminders' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-nike-mute'
          }`}
        >
          <BellRing className="w-4 h-4" /> {t('mnt.reminders')} ({reminders.length})
        </button>
      </div>

      {/* TAB 1: MAINTENANCE TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-nike-hairline dark:border-nike-dark-card">
            <div>
              <h3 className="text-base font-bold text-nike-ink dark:text-white">รายการแจ้งซ่อมบำรุง (Maintenance Work Orders)</h3>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setOccupancyFilter('All')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    occupancyFilter === 'All'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  ทั้งหมด ({tasks.length})
                </button>
                <button
                  onClick={() => setOccupancyFilter('Occupied')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    occupancyFilter === 'Occupied'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  ห้องมีคนเช่า ({tasks.filter(t => getTaskOccupancy(t) === 'Occupied').length})
                </button>
                <button
                  onClick={() => setOccupancyFilter('Vacant/Common')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    occupancyFilter === 'Vacant/Common'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  ห้องว่าง ({tasks.filter(t => getTaskOccupancy(t) === 'Vacant/Common').length})
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                const defaultRoom = rooms[0];
                const defaultOccupancy = defaultRoom ? ((defaultRoom.status === 'Occupied' || !!defaultRoom.currentTenantId) ? 'Occupied' : 'Vacant/Common') : 'Vacant/Common';
                setTaskFormData({
                  roomId: defaultRoom?.id || '',
                  roomNumber: defaultRoom?.roomNumber || '101',
                  occupancyType: defaultOccupancy,
                  category: 'Light bulb replacement',
                  priority: 'Medium',
                  status: 'Pending',
                  assignedWorker: 'นายช่างวิเชียร',
                  laborCost: 150,
                  description: 'เปลี่ยนหลอดไฟในห้องพัก',
                });
                setShowTaskModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> แจ้งซ่อมบำรุงใหม่
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-nike-hairline dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-semibold">
                  <th className="p-3">เลขห้อง / รหัสงาน</th>
                  <th className="p-3">ประเภทการเช่า</th>
                  <th className="p-3">หมวดหมู่</th>
                  <th className="p-3">รายละเอียด</th>
                  <th className="p-3">ช่างผู้ดูแล</th>
                  <th className="p-3">ค่าใช้จ่ายรวม</th>
                  <th className="p-3">ความสำคัญ</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nike-hairline/60 dark:divide-nike-dark-card/60">
                {tasks
                  .filter(task => {
                    if (occupancyFilter === 'Occupied') return getTaskOccupancy(task) === 'Occupied';
                    if (occupancyFilter === 'Vacant/Common') return getTaskOccupancy(task) === 'Vacant/Common';
                    return true;
                  })
                  .map(task => {
                    const taskOccupancy = getTaskOccupancy(task);
                    return (
                  <tr key={task.id} className="hover:bg-nike-soft-cloud/50 dark:hover:bg-nike-dark-card/30">
                    <td className="p-3">
                      <span className="font-bold text-nike-ink dark:text-white block">ห้อง {task.roomNumber}</span>
                      <span className="text-[11px] text-nike-stone">{task.taskNo}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        taskOccupancy === 'Vacant/Common'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {taskOccupancy === 'Vacant/Common' ? 'ห้องว่าง' : 'ห้องมีคนเช่า'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-nike-ink dark:text-white">
                      <div>{task.category}</div>
                      {task.preferredTime && (
                        <div className="text-[10px] text-rose-500 font-medium">{task.preferredTime}</div>
                      )}
                    </td>
                    <td className="p-3 text-nike-mute dark:text-nike-stone max-w-xs">
                      <div className="line-clamp-2 font-medium text-slate-800 dark:text-slate-200">{task.description}</div>
                      {task.reporterName && (
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                          ผู้แจ้ง: {task.reporterName} {task.reporterPhone ? `(${task.reporterPhone})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-nike-ink dark:text-white">
                      <select
                        value={task.assignedWorker || ''}
                        onChange={async (e) => {
                          await saveMaintenanceTask({ ...task, assignedWorker: e.target.value });
                          toast.success(`มอบหมายช่าง: ${e.target.value}`);
                          fetchData();
                        }}
                        className="p-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="รอเจ้าหน้าที่มอบหมายช่าง">-- เลือกช่าง --</option>
                        <option value="นายช่างวิเชียร (ช่างประจำอาคาร)">นายช่างวิเชียร (ช่างประจำอาคาร)</option>
                        <option value="ช่างประเสริฐ (Air Service)">ช่างประเสริฐ (Air Service)</option>
                        <option value="ช่างมนัส (ช่างประปา)">ช่างมนัส (ช่างประปา)</option>
                        <option value="ช่างสมคิด (ช่างระบบไฟ)">ช่างสมคิด (ช่างระบบไฟ)</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleEditTask(task)}
                        className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group"
                        title="กดเพื่อบันทึกหรือแก้ไขค่าใช้จ่าย"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{formatCurrency(task.totalCost || 0)}</span>
                        <Pencil className="w-3 h-3 text-slate-400 group-hover:text-rose-600" />
                      </button>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        task.priority === 'High' ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={task.status}
                        onChange={async (e) => {
                          await saveMaintenanceTask({ ...task, status: e.target.value as any });
                          toast.success(`Task status updated to ${e.target.value}`);
                          fetchData();
                        }}
                        className="p-1 rounded-lg text-xs font-semibold bg-nike-soft-cloud dark:bg-nike-dark-surface border border-nike-hairline text-nike-ink dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIES */}
      {activeTab === 'supplies' && (
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-nike-ink dark:text-white">คลังสต็อกอะไหล่ & วัสดุอุปกรณ์</h3>
              <p className="text-xs text-nike-mute dark:text-nike-stone mt-0.5">จัดการจำนวนอะไหล่คงเหลือ และกดตัดสต็อก/เพิ่มสต็อกได้ทันที</p>
            </div>
            <button
              onClick={() => {
                setSupplyFormData({ name: '', category: 'Electrical', stockQuantity: 10, unitCost: 100, unitName: 'ชิ้น' });
                setShowSupplyModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> เพิ่มรายการอะไหล่ใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supplies.map(item => {
              const isLowStock = (item.stockQuantity ?? 0) <= 3;
              return (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-nike-dark-surface shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-nike-ink dark:text-white text-sm">{item.name}</h4>
                      <span className="text-[11px] text-slate-500">{item.category}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isLowStock
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    }`}>
                      {isLowStock ? 'สต็อกใกล้หมด' : 'มีในคลัง'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-1 px-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-slate-500">ราคาต่อหน่วย: <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(item.unitCost)}</strong></span>
                    <span className="text-slate-500">คงเหลือ: <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{item.stockQuantity}</strong> {item.unitName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-medium mr-1">ตัด/เพิ่ม:</span>
                      <button
                        onClick={() => handleAdjustSupplyStock(item, -1)}
                        disabled={(item.stockQuantity ?? 0) <= 0}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
                        title="ตัดสต็อกออก 1 หน่วย"
                      >
                        -1 ตัดออก
                      </button>
                      <button
                        onClick={() => handleAdjustSupplyStock(item, 1)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-bold text-xs transition-all cursor-pointer"
                        title="เพิ่มสต็อกเข้า 1 หน่วย"
                      >
                        +1 เติมเข้า
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSupplyFormData(item);
                        setShowSupplyModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                      title="แก้ไขราคาหรือจำนวน"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PER-UNIT MAINTENANCE LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-nike-hairline dark:border-nike-dark-card">
            <div>
              <h3 className="text-base font-bold text-nike-ink dark:text-white">ประวัติงานซ่อมและค่าใช้จ่ายรายห้อง</h3>
              <p className="text-xs text-nike-mute dark:text-nike-stone mt-0.5">ตรวจสอบประวัติการซ่อมบำรุง อะไหล่ที่เบิกใช้ และสรุปค่าใช้จ่ายแยกรายห้อง</p>
            </div>

            {/* ROOM FILTER DROPDOWN */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-nike-mute">เลือกห้องพัก:</span>
              <select
                value={selectedRoomForLogs}
                onChange={(e) => setSelectedRoomForLogs(e.target.value)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="All">ทุกห้องพัก (All Units)</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.roomNumber}>ห้อง {r.roomNumber} ({r.roomType})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-nike-hairline dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-semibold">
                  <th className="p-3">วันที่ซ่อม</th>
                  <th className="p-3">ห้องพัก</th>
                  <th className="p-3">รหัสงาน / หมวดหมู่</th>
                  <th className="p-3">รายละเอียดงานที่ทำ</th>
                  <th className="p-3">อะไหล่ที่ใช้ & ราคา</th>
                  <th className="p-3">ช่างผู้ดูแล</th>
                  <th className="p-3 text-right">ค่าใช้จ่ายรวม</th>
                  <th className="p-3 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nike-hairline/60 dark:divide-nike-dark-card/60">
                {logs
                  .filter(log => selectedRoomForLogs === 'All' ? true : (log.roomNumber === selectedRoomForLogs || log.roomId === selectedRoomForLogs))
                  .map(log => (
                  <tr key={log.id} className="hover:bg-nike-soft-cloud/50 dark:hover:bg-nike-dark-card/30">
                    <td className="p-3 text-nike-mute dark:text-nike-stone whitespace-nowrap">{log.date}</td>
                    <td className="p-3 font-bold text-nike-ink dark:text-white whitespace-nowrap">ห้อง {log.roomNumber}</td>
                    <td className="p-3">
                      <span className="font-semibold text-nike-ink dark:text-white block">{log.category}</span>
                      <span className="text-[11px] text-nike-stone font-mono">{log.taskNo}</span>
                    </td>
                    <td className="p-3 text-nike-mute dark:text-nike-stone max-w-xs">{log.description}</td>
                    <td className="p-3">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800/40">
                        {formatSuppliesSummary(log.suppliesSummary)}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-nike-ink dark:text-white">{log.performedBy}</td>
                    <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(log.totalCost)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditLog(log)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="แก้ไขประวัติและค่าใช้จ่าย"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="ลบรายการประวัติ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEDULED REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-nike-ink dark:text-white">Scheduled Maintenance Reminders</h3>
            <button
              onClick={() => {
                setReminderFormData({ title: '', category: 'Air-con servicing', frequency: 'Every 6 Months', nextDueDate: new Date().toISOString().split('T')[0] });
                setShowReminderModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Set New Reminder
            </button>
          </div>

          <div className="space-y-3">
            {reminders.map(rem => (
              <div key={rem.id} className="p-4 rounded-xl border border-nike-hairline dark:border-nike-dark-card bg-nike-soft-cloud/40 dark:bg-nike-dark-surface flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-nike-ink dark:text-white text-sm">{rem.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                      {rem.frequency}
                    </span>
                  </div>
                  <span className="text-xs text-nike-stone mt-1 block">Target: {rem.roomNumber || 'Building Common'} | Next Due: <strong className="text-nike-ink dark:text-white">{rem.nextDueDate}</strong></span>
                </div>
                <button
                  onClick={() => handleToggleReminder(rem.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    rem.isActive
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                      : 'bg-nike-soft-cloud dark:bg-nike-dark-surface border-nike-hairline text-nike-mute'
                  }`}
                >
                  {rem.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveTask} className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-nike-hairline dark:border-nike-dark-card">
              <h3 className="text-base font-bold text-nike-ink dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-600" />
                {taskFormData.id ? `บันทึกค่าใช้จ่าย & มอบหมายช่าง ห้อง ${taskFormData.roomNumber}` : 'แจ้งซ่อมบำรุงใหม่'}
              </h3>
              {taskFormData.taskNo && (
                <span className="text-xs font-mono font-bold text-nike-mute">{taskFormData.taskNo}</span>
              )}
            </div>

            <div className="space-y-4 text-xs max-h-[78vh] overflow-y-auto overflow-x-hidden pr-1">
              {/* IF EDITING EXISTING TASK: SHOW RESIDENT REPORTED INFO AS READ-ONLY */}
              {taskFormData.id ? (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      ข้อมูลที่ผู้พักอาศัยแจ้ง
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      taskFormData.occupancyType === 'Vacant/Common'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {taskFormData.occupancyType === 'Vacant/Common' ? 'ห้องว่าง' : 'ห้องมีคนเช่า'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">ห้องพัก / หมวดหมู่:</span>
                      <span className="font-bold text-slate-800 dark:text-white">ห้อง {taskFormData.roomNumber}</span>
                      <span className="text-slate-500 dark:text-slate-400 block">{taskFormData.category}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">ผู้แจ้ง & ติดต่อ:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{taskFormData.reporterName || 'ผู้พักอาศัย'}</span>
                      <span className="text-slate-500 dark:text-slate-400 block">{taskFormData.reporterPhone || '-'}</span>
                    </div>
                  </div>

                  {taskFormData.preferredTime && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      ช่วงเวลาที่สะดวกให้เข้าซ่อม: {taskFormData.preferredTime}
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block text-[10px] mb-0.5">รายละเอียดอาการชำรุดที่แจ้ง:</span>
                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">
                      {taskFormData.description || '-'}
                    </div>
                  </div>
                </div>
              ) : (
                /* IF CREATING NEW TASK: SHOW EDITABLE FIELDS */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nike-mute mb-1 font-medium">ประเภทการเช่า *</label>
                      <select
                        value={taskFormData.occupancyType || 'Occupied'}
                        onChange={(e) => setTaskFormData({ ...taskFormData, occupancyType: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all font-semibold text-rose-600 dark:text-rose-400"
                      >
                        <option value="Occupied">ห้องมีคนเช่า</option>
                        <option value="Vacant/Common">ห้องว่าง</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-nike-mute mb-1 font-medium">เลือกห้องพัก *</label>
                      <select
                        value={taskFormData.roomId || (rooms[0]?.id || '')}
                        onChange={(e) => {
                          const rm = rooms.find(r => r.id === e.target.value);
                          const isOccupied = rm ? (rm.status === 'Occupied' || !!rm.currentTenantId) : false;
                          setTaskFormData({
                            ...taskFormData,
                            roomId: e.target.value,
                            roomNumber: rm?.roomNumber || '',
                            occupancyType: isOccupied ? 'Occupied' : 'Vacant/Common',
                          });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all font-medium"
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>ห้อง {r.roomNumber} ({r.roomType})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-nike-mute mb-1 font-medium">หมวดหมู่งานซ่อม *</label>
                    <select
                      value={taskFormData.category}
                      onChange={(e) => setTaskFormData({ ...taskFormData, category: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                    >
                      <option value="Light bulb replacement">เปลี่ยนหลอดไฟ</option>
                      <option value="Air-con servicing">ล้าง/ซ่อมแอร์</option>
                      <option value="Plumbing">ระบบประปา/สุขภัณฑ์</option>
                      <option value="Electrical">ระบบไฟฟ้า/เต้ารับ</option>
                      <option value="General Repair">งานซ่อมทั่วไป</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-nike-mute mb-1 font-medium">รายละเอียดอาการชำรุด *</label>
                    <textarea
                      required
                      rows={2}
                      value={taskFormData.description || ''}
                      onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {/* ADMIN & TECHNICIAN ASSIGNMENT & STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-nike-mute mb-1 font-medium">ช่างผู้ดูแล *</label>
                  <select
                    value={taskFormData.assignedWorker || 'รอเจ้าหน้าที่มอบหมายช่าง'}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assignedWorker: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all font-medium"
                  >
                    <option value="รอเจ้าหน้าที่มอบหมายช่าง">-- เลือกช่างผู้ดูแล --</option>
                    <option value="นายช่างวิเชียร (ช่างประจำอาคาร)">นายช่างวิเชียร (ช่างประจำอาคาร)</option>
                    <option value="ช่างประเสริฐ (Air Service)">ช่างประเสริฐ (Air Service)</option>
                    <option value="ช่างมนัส (ช่างประปา)">ช่างมนัส (ช่างประปา)</option>
                    <option value="ช่างสมคิด (ช่างระบบไฟ)">ช่างสมคิด (ช่างระบบไฟ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-nike-mute mb-1 font-medium">สถานะงาน *</label>
                  <select
                    value={taskFormData.status || 'Pending'}
                    onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all font-semibold"
                  >
                    <option value="Pending">รอดำเนินการ</option>
                    <option value="In Progress">กำลังดำเนินการ</option>
                    <option value="Completed">ซ่อมเสร็จสิ้น</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-nike-mute mb-1 font-medium">ระดับความเร่งด่วน *</label>
                <select
                  value={taskFormData.priority || 'Medium'}
                  onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                >
                  <option value="Low">ปกติ</option>
                  <option value="Medium">ปานกลาง</option>
                  <option value="High">ด่วนมาก</option>
                </select>
              </div>

              {/* SUPPLIES SELECTION SECTION */}
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl space-y-3">
                <span className="font-bold text-blue-900 dark:text-blue-300 block text-xs">
                  รายการอะไหล่ที่เบิกใช้ (ระบบจะคำนวณราคา & ตัดสต็อกให้อัตโนมัติ)
                </span>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <select
                    value={selectedSupplyId}
                    onChange={(e) => setSelectedSupplyId(e.target.value)}
                    className="flex-1 min-w-0 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs text-slate-800 dark:text-white focus:outline-none"
                  >
                    {supplies.map(s => (
                      <option key={s.id} value={s.id} disabled={(s.stockQuantity ?? 0) <= 0}>
                        {s.name} - {formatCurrency(s.unitCost)} (คงเหลือ: {s.stockQuantity} {s.unitName})
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      value={selectedSupplyQty}
                      onChange={(e) => setSelectedSupplyQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs text-center font-bold text-slate-800 dark:text-white focus:outline-none shrink-0"
                    />

                    <button
                      type="button"
                      onClick={handleAddSupplyToTask}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs flex items-center justify-center"
                    >
                      + เบิกใช้อะไหล่
                    </button>
                  </div>
                </div>

                {/* LIST OF SELECTED SUPPLIES */}
                {usedSuppliesList.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {usedSuppliesList.map(item => (
                      <div key={item.supplyId} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/40 text-xs">
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {item.name} <span className="text-blue-600 dark:text-blue-400 font-bold">x{item.quantity} {item.unitName}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(item.quantity * item.unitCost)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSupplyFromTask(item.supplyId)}
                            className="text-rose-500 hover:text-rose-700 font-bold px-1 cursor-pointer"
                            title="ลบรายการนี้"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">ยังไม่มีการเบิกอะไหล่ (หากงานนี้ใช้อะไหล่ สามารถเลือกจากด้านบนเพื่อเพิ่มได้ครับ)</p>
                )}
              </div>

              {/* COST INPUTS SECTION */}
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-xs">
                  บันทึกค่าใช้จ่ายงานซ่อม
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">ค่าแรงช่าง (บาท) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">฿</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={taskFormData.laborCost === 0 ? '' : (taskFormData.laborCost ?? '')}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const valStr = e.target.value.replace(/[^0-9]/g, '');
                          const num = valStr === '' ? 0 : parseInt(valStr, 10);
                          const suppliesCost = usedSuppliesList.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
                          setTaskFormData(prev => ({
                            ...prev,
                            laborCost: num,
                            totalCost: num + suppliesCost,
                          }));
                        }}
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">ค่าใช้จ่ายรวมทั้งสิ้น (บาท) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs">฿</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={taskFormData.totalCost === 0 ? '' : (taskFormData.totalCost ?? '')}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const valStr = e.target.value.replace(/[^0-9]/g, '');
                          const num = valStr === '' ? 0 : parseInt(valStr, 10);
                          setTaskFormData(prev => ({
                            ...prev,
                            totalCost: num,
                          }));
                        }}
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-nike-hairline dark:border-nike-dark-card">
              <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-xs font-medium rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card text-nike-ink dark:text-white cursor-pointer">ยกเลิก</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs">บันทึกข้อมูลงาน & ค่าใช้จ่าย</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE SUPPLY MODAL */}
      {showSupplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveSupply} className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-nike-ink dark:text-white">Add Supply Item</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-nike-mute mb-1 font-medium">Item Name *</label>
                <input
                  type="text"
                  required
                  value={supplyFormData.name || ''}
                  onChange={(e) => setSupplyFormData({ ...supplyFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-nike-mute mb-1 font-medium">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={supplyFormData.stockQuantity || 10}
                    onChange={(e) => setSupplyFormData({ ...supplyFormData, stockQuantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-nike-mute mb-1 font-medium">Unit Cost (THB) *</label>
                  <input
                    type="number"
                    required
                    value={supplyFormData.unitCost || 100}
                    onChange={(e) => setSupplyFormData({ ...supplyFormData, unitCost: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowSupplyModal(false)} className="px-4 py-2 text-xs font-medium rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card text-nike-ink dark:text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white">Save Item</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE REMINDER MODAL */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveReminder} className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-nike-ink dark:text-white">Set Maintenance Reminder</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-nike-mute mb-1 font-medium">Reminder Title *</label>
                <input
                  type="text"
                  required
                  value={reminderFormData.title || ''}
                  onChange={(e) => setReminderFormData({ ...reminderFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-surface border border-nike-hairline text-nike-ink dark:text-white"
                  placeholder="e.g. 6-Month Air-con Service"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-nike-mute mb-1 font-medium">Frequency</label>
                  <select
                    value={reminderFormData.frequency}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, frequency: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-surface border border-nike-hairline text-nike-ink dark:text-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Every 6 Months">Every 6 Months</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-nike-mute mb-1 font-medium">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={reminderFormData.nextDueDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, nextDueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-surface border border-nike-hairline text-nike-ink dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowReminderModal(false)} className="px-4 py-2 text-xs font-medium rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card text-nike-ink dark:text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white">Save Reminder</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT LOG MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveLog} className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-nike-hairline dark:border-nike-dark-card">
              <h3 className="text-base font-bold text-nike-ink dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-rose-600" />
                แก้ไขประวัติงานซ่อม ห้อง {logFormData.roomNumber}
              </h3>
              <span className="text-xs font-mono font-bold text-nike-mute">{logFormData.taskNo}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-nike-mute mb-1 font-medium">รายละเอียดงานที่ทำ *</label>
                <textarea
                  required
                  rows={2}
                  value={logFormData.description || ''}
                  onChange={(e) => setLogFormData({ ...logFormData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-nike-mute mb-1 font-medium">อะไหล่และอุปกรณ์ที่ใช้ *</label>
                <input
                  type="text"
                  value={logFormData.suppliesSummary || ''}
                  onChange={(e) => setLogFormData({ ...logFormData, suppliesSummary: e.target.value })}
                  placeholder="เช่น หลอดไฟ LED 12W x2 (฿230)"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nike-mute mb-1 font-medium">ช่างผู้ดูแล *</label>
                  <input
                    type="text"
                    value={logFormData.performedBy || ''}
                    onChange={(e) => setLogFormData({ ...logFormData, performedBy: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-nike-mute mb-1 font-medium">ค่าใช้จ่ายรวม (บาท) *</label>
                  <input
                    type="number"
                    min="0"
                    value={logFormData.totalCost ?? 0}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setLogFormData({ ...logFormData, totalCost: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-nike-hairline dark:border-nike-dark-card">
              <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 text-xs font-medium rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card text-nike-ink dark:text-white cursor-pointer">ยกเลิก</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs">บันทึกการแก้ไข</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
