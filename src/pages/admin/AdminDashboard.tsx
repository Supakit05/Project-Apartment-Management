import React, { useEffect, useState } from 'react';
import {
  Building2, CheckCircle2, Wrench,
  DollarSign, BellRing, FileText, PlusCircle, RotateCw
} from 'lucide-react';
import { Room, Lease, UtilityBill, MaintenanceTask, ScheduledReminder } from '../../types';
import {
  getRooms, getLeases, getUtilityBills,
  getMaintenanceTasks, getReminders
} from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { ApartmentFloorGrid } from '../../components/admin/ApartmentFloorGrid';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRooms(await getRooms());
      setLeases(await getLeases());
      setBills(await getUtilityBills());
      setTasks(await getMaintenanceTasks());
      setReminders(await getReminders());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard data refreshed!');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalUnits = rooms.length;
  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
  const availableCount = rooms.filter(r => r.status === 'Available').length;
  const maintenanceCount = rooms.filter(r => r.status === 'Maintenance').length;
  const reservedCount = rooms.filter(r => r.status === 'Reserved').length;

  const occupancyRate = totalUnits > 0 ? Math.round((occupiedCount / totalUnits) * 100) : 0;

  const totalMonthlyRent = leases
    .filter(l => l.status === 'Active')
    .reduce((sum, l) => sum + l.rentAmount, 0);

  const pendingBills = bills.filter(b => b.status === 'Pending');
  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Apartment Admin Dashboard
          </h1>
          <p className="text-[14px] text-slate-500 dark:text-slate-300 mt-0.5">
            Manage 24 apartment units across 2 floors — tenants, leases, billing & maintenance
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer"
            title="Refresh Live Data"
          >
            <RotateCw className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <Link
            to="/admin/tenants"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> New Lease / Tenant
          </Link>
          <Link
            to="/admin/utility-bills"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Generate Invoice / Receipt
          </Link>
          <Link
            to="/admin/maintenance"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-all flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4" /> Maintenance / Supplies
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-nike-mute">
            <span className="text-[12px] font-semibold uppercase tracking-wider">Total Units</span>
            <Building2 className="w-5 h-5 text-nike-ink dark:text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-nike-ink dark:text-white">{totalUnits}</span>
            <span className="text-xs text-nike-stone font-medium">units (2 floors)</span>
          </div>
          <div className="w-full bg-nike-soft-cloud dark:bg-nike-dark-card h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all" style={{ width: `${occupancyRate}%` }}></div>
          </div>
          <span className="text-[12px] text-blue-600 dark:text-blue-400 font-medium block">
            Occupancy Rate: {occupancyRate}%
          </span>
        </div>

        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[12px] font-semibold uppercase tracking-wider">Available Units</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-emerald-600 dark:text-emerald-400">{availableCount}</span>
            <span className="text-xs text-nike-stone">vacant</span>
          </div>
          <span className="text-[12px] text-nike-stone block">
            {occupiedCount} occupied, {reservedCount} reserved
          </span>
        </div>

        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[12px] font-semibold uppercase tracking-wider">Monthly Rent Revenue</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[26px] font-bold text-nike-ink dark:text-white block">
            {formatCurrency(totalMonthlyRent)}
          </span>
          <span className="text-[12px] text-amber-600 dark:text-amber-400 font-medium block">
            {pendingBills.length} pending bills ({formatCurrency(pendingBills.reduce((s, b) => s + b.totalAmount, 0))})
          </span>
        </div>

        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[12px] font-semibold uppercase tracking-wider">Active Maintenance</span>
            <Wrench className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-rose-600 dark:text-rose-400">{activeTasks.length}</span>
            <span className="text-xs text-nike-stone">tasks pending</span>
          </div>
          <span className="text-[12px] text-nike-stone block">
            {maintenanceCount} units under maintenance
          </span>
        </div>

      </div>

      {/* 24-ROOM VISUAL FLOOR GRID */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-nike-hairline dark:border-nike-dark-card pb-3">
          <div>
            <h2 className="text-xl font-bold text-nike-ink dark:text-white">
              24-Unit Floor Grid (12 rooms × 2 floors)
            </h2>
            <p className="text-xs text-nike-mute dark:text-nike-stone">
              Click on a unit to view tenant info, meter readings, and maintenance history
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-nike-soft-cloud dark:bg-nike-dark-card hover:bg-nike-hairline text-nike-ink dark:text-white transition-colors"
          >
            Refresh
          </button>
        </div>

        <ApartmentFloorGrid rooms={rooms} onRefresh={fetchDashboardData} />
      </div>

      {/* LOWER WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SCHEDULED REMINDERS */}
        <div className="lg:col-span-6 bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-nike-ink dark:text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-amber-500" />
              Scheduled Maintenance Reminders
            </h3>
            <Link to="/admin/maintenance" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {reminders.length === 0 ? (
              <p className="text-xs text-nike-mute dark:text-nike-stone py-4 text-center">No scheduled reminders</p>
            ) : (
              reminders.map((rem) => (
                <div key={rem.id} className="p-3.5 bg-nike-soft-cloud dark:bg-nike-dark-surface rounded-xl border border-nike-hairline dark:border-nike-dark-card flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-nike-ink dark:text-white block">
                      {rem.title}
                    </span>
                    <span className="text-nike-stone block">
                      Target: <strong className="text-nike-ink dark:text-white">{rem.roomNumber || 'Building Common'}</strong> | Cycle: {rem.frequency}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 block">
                      Due: {rem.nextDueDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACTIVE MAINTENANCE TASKS */}
        <div className="lg:col-span-6 bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-nike-ink dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-rose-500" />
              Maintenance Queue
            </h3>
            <Link to="/admin/maintenance" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              All Tasks
            </Link>
          </div>

          <div className="space-y-3">
            {activeTasks.length === 0 ? (
              <p className="text-xs text-nike-mute dark:text-nike-stone py-4 text-center">No pending maintenance tasks</p>
            ) : (
              activeTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-3.5 bg-nike-soft-cloud dark:bg-nike-dark-surface rounded-xl border border-nike-hairline dark:border-nike-dark-card flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-nike-ink dark:text-white">
                        Unit {task.roomNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        {task.category}
                      </span>
                    </div>
                    <p className="text-nike-mute dark:text-nike-stone line-clamp-1">{task.description}</p>
                    <span className="text-[11px] text-nike-stone block">Assigned: {task.assignedWorker}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 whitespace-nowrap">
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
