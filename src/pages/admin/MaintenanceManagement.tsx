import React, { useEffect, useState } from 'react';
import { MaintenanceTask, SupplyItem, MaintenanceLog, ScheduledReminder, Room } from '../../types';
import {
  getMaintenanceTasks, saveMaintenanceTask,
  getSupplies, saveSupply,
  getMaintenanceLogs,
  getReminders, saveReminder, toggleReminder, getRooms
} from '../../services/api';
import { formatCurrency, formatDate, formatSuppliesSummary } from '../../utils/formatters';
import { Wrench, Plus, Package, History, BellRing, CheckCircle2, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';

export const MaintenanceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'supplies' | 'logs' | 'reminders'>('tasks');
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
    priority: 'Medium',
    status: 'Pending',
    assignedWorker: 'In-house Technician',
    laborCost: 100,
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

  const fetchData = async () => {
    try {
      setTasks(await getMaintenanceTasks());
      setSupplies(await getSupplies());
      setLogs(await getMaintenanceLogs());
      setReminders(await getReminders());
      setRooms(await getRooms());
    } catch (err) {
      console.error('Failed to fetch maintenance data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMaintenanceTask(taskFormData);
    toast.success('Maintenance task saved successfully');
    setShowTaskModal(false);
    fetchData();
  };

  const handleSaveSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSupply(supplyFormData);
    toast.success('Supply item updated');
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

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2.5">
            <Wrench className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            Maintenance & Supply Management
          </h1>
          <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
            Track repairs (light bulbs, air-con, plumbing), manage supply inventory, view per-unit logs, and set scheduled reminders
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
          <Wrench className="w-4 h-4" /> Active Tasks ({tasks.filter(t => t.status !== 'Completed').length})
        </button>

        <button
          onClick={() => setActiveTab('supplies')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'supplies' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-nike-mute'
          }`}
        >
          <Package className="w-4 h-4" /> Supply Stock ({supplies.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'logs' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-nike-mute'
          }`}
        >
          <History className="w-4 h-4" /> Per-Unit Maintenance Logs ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'reminders' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-nike-mute'
          }`}
        >
          <BellRing className="w-4 h-4" /> Scheduled Reminders ({reminders.length})
        </button>
      </div>

      {/* TAB 1: MAINTENANCE TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-nike-ink dark:text-white">Maintenance Work Orders</h3>
            <button
              onClick={() => {
                setTaskFormData({
                  roomId: rooms[0]?.id || '',
                  roomNumber: rooms[0]?.roomNumber || '101',
                  category: 'Light bulb replacement',
                  priority: 'Medium',
                  status: 'Pending',
                  assignedWorker: 'Technician Wichian',
                  laborCost: 150,
                  description: 'Replace dim light bulb in bathroom',
                });
                setShowTaskModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Report Maintenance Task
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-nike-hairline dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-semibold">
                  <th className="p-3">Task No / Unit</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Assigned Worker</th>
                  <th className="p-3">Total Cost</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nike-hairline/60 dark:divide-nike-dark-card/60">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-nike-soft-cloud/50 dark:hover:bg-nike-dark-card/30">
                    <td className="p-3">
                      <span className="font-bold text-nike-ink dark:text-white block">Unit {task.roomNumber}</span>
                      <span className="text-[11px] text-nike-stone">{task.taskNo}</span>
                    </td>
                    <td className="p-3 font-semibold text-nike-ink dark:text-white">
                      {task.category}
                    </td>
                    <td className="p-3 text-nike-mute dark:text-nike-stone max-w-xs truncate">
                      {task.description}
                    </td>
                    <td className="p-3 font-medium text-nike-ink dark:text-white">
                      {task.assignedWorker}
                    </td>
                    <td className="p-3 font-semibold text-nike-ink dark:text-white">
                      {formatCurrency(task.totalCost || 0)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIES */}
      {activeTab === 'supplies' && (
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-nike-ink dark:text-white">Maintenance Supply Inventory</h3>
            <button
              onClick={() => {
                setSupplyFormData({ name: '', category: 'Electrical', stockQuantity: 10, unitCost: 100, unitName: 'pcs' });
                setShowSupplyModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Supply Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supplies.map(item => (
              <div key={item.id} className="p-4 rounded-xl border border-nike-hairline dark:border-nike-dark-card bg-nike-soft-cloud/40 dark:bg-nike-dark-surface space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-nike-ink dark:text-white text-sm">{item.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                    {item.category}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-nike-stone">
                  <span>Stock Quantity: <strong className="text-nike-ink dark:text-white font-bold">{item.stockQuantity} {item.unitName}</strong></span>
                  <span>Cost: <strong className="text-nike-ink dark:text-white">{formatCurrency(item.unitCost)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PER-UNIT MAINTENANCE LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-nike-ink dark:text-white">Per-Unit Maintenance History Logs</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-nike-hairline dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-semibold">
                  <th className="p-3">Date</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Task No / Category</th>
                  <th className="p-3">Work Performed</th>
                  <th className="p-3">Supplies Used</th>
                  <th className="p-3">Performed By</th>
                  <th className="p-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nike-hairline/60 dark:divide-nike-dark-card/60">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-nike-soft-cloud/50 dark:hover:bg-nike-dark-card/30">
                    <td className="p-3 text-nike-mute dark:text-nike-stone">{log.date}</td>
                    <td className="p-3 font-bold text-nike-ink dark:text-white">Unit {log.roomNumber}</td>
                    <td className="p-3">
                      <span className="font-semibold text-nike-ink dark:text-white block">{log.category}</span>
                      <span className="text-[11px] text-nike-stone">{log.taskNo}</span>
                    </td>
                    <td className="p-3 text-nike-mute dark:text-nike-stone">{log.description}</td>
                    <td className="p-3 text-nike-mute dark:text-nike-stone">{formatSuppliesSummary(log.suppliesSummary)}</td>
                    <td className="p-3 font-medium text-nike-ink dark:text-white">{log.performedBy}</td>
                    <td className="p-3 text-right font-bold text-nike-ink dark:text-white">{formatCurrency(log.totalCost)}</td>
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
                    rem.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }`}
                >
                  {rem.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveTask} className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-nike-ink dark:text-white">Report Maintenance Task</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-nike-mute mb-1 font-medium">Select Unit *</label>
                <select
                  value={taskFormData.roomId}
                  onChange={(e) => {
                    const rm = rooms.find(r => r.id === e.target.value);
                    setTaskFormData({ ...taskFormData, roomId: e.target.value, roomNumber: rm?.roomNumber || '' });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Unit {r.roomNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-nike-mute mb-1 font-medium">Category *</label>
                <select
                  value={taskFormData.category}
                  onChange={(e) => setTaskFormData({ ...taskFormData, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                >
                  <option value="Light bulb replacement">Light bulb replacement</option>
                  <option value="Air-con servicing">Air-con servicing</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="General Repair">General Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-nike-mute mb-1 font-medium">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={taskFormData.description || ''}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-xs font-medium rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card text-nike-ink dark:text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white">Save Task</button>
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

    </div>
  );
};
