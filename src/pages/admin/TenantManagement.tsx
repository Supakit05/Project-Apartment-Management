import React, { useEffect, useState } from 'react';
import { Tenant, Lease, Room } from '../../types';
import { getTenants, saveTenant, deleteTenant, getLeases, saveLease, terminateLease, getRooms } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Users, UserPlus, FileSignature, Phone, Mail, CheckCircle2, Printer, Plus, Trash2, Edit3, Home, Search } from 'lucide-react';
import { ContractModal } from '../../components/admin/ContractModal';
import { toast } from 'sonner';

export const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');

  const [showTenantModal, setShowTenantModal] = useState(false);
  const [tenantFormData, setTenantFormData] = useState<Partial<Tenant>>({});

  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [leaseFormData, setLeaseFormData] = useState<Partial<Lease>>({
    billingCycle: 'monthly',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
  });

  const [selectedLeaseForContract, setSelectedLeaseForContract] = useState<Lease | null>(null);

  const fetchData = async () => {
    try {
      setTenants(await getTenants());
      setLeases(await getLeases());
      setRooms(await getRooms());
    } catch (err) {
      console.error('Failed to fetch tenant data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenTenantModal = (tenant?: Tenant) => {
    setTenantFormData(tenant || {});
    setShowTenantModal(true);
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantFormData.fullname) {
      toast.error('Please enter tenant full name');
      return;
    }
    await saveTenant(tenantFormData);
    toast.success('Tenant profile saved successfully');
    setShowTenantModal(false);
    fetchData();
  };

  const handleDeleteTenant = async (id: string) => {
    if (confirm('Are you sure you want to delete this tenant profile?')) {
      await deleteTenant(id);
      toast.success('Tenant profile deleted');
      fetchData();
    }
  };

  const handleOpenLeaseModal = (tenant?: Tenant) => {
    setLeaseFormData({
      tenantId: tenant?.id || tenants[0]?.id || '',
      tenantName: tenant?.fullname || tenants[0]?.fullname || '',
      tenantPhone: tenant?.phone || tenants[0]?.phone || '',
      roomId: rooms[0]?.id || '',
      roomNumber: rooms[0]?.roomNumber || '',
      rentAmount: rooms[0]?.price || 5500,
      billingCycle: 'monthly',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    });
    setShowLeaseModal(true);
  };

  const handleRoomSelectInLease = (roomId: string) => {
    const rm = rooms.find(r => r.id === roomId);
    if (rm) {
      setLeaseFormData(prev => ({
        ...prev,
        roomId: rm.id,
        roomNumber: rm.roomNumber,
        rentAmount: rm.price,
      }));
    }
  };

  const handleSaveLease = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveLease(leaseFormData);

    if (!result.success) {
      toast.error(result.message || 'Failed to save lease agreement');
      return;
    }

    toast.success('Lease agreement assigned successfully!');
    setShowLeaseModal(false);
    fetchData();
  };

  const handleTerminateLease = async (leaseId: string) => {
    if (confirm('Are you sure you want to terminate this lease agreement?')) {
      await terminateLease(leaseId);
      toast.success('Lease terminated and unit marked as available');
      fetchData();
    }
  };

  const filteredTenants = tenants.filter(t =>
    (t.fullname || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.phone || '').includes(search) ||
    (t.unitNumber || '').includes(search)
  );

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2.5">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Tenants & Lease Agreements
          </h1>
          <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
            Assign tenants to units, set lease start/end dates, billing cycles, and generate rental contracts
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleOpenTenantModal()}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card hover:bg-nike-hairline text-nike-ink dark:text-white transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add Tenant Profile
          </button>
          <button
            onClick={() => handleOpenLeaseModal()}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FileSignature className="w-4 h-4" /> + Create Lease Agreement
          </button>
        </div>
      </div>

      {/* ACTIVE LEASES SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl">
          <span className="text-xs text-nike-mute dark:text-nike-stone font-medium">Active Leases</span>
          <span className="text-3xl font-bold text-nike-ink dark:text-white block mt-1">
            {leases.filter(l => l.status === 'Active').length} active
          </span>
        </div>
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl">
          <span className="text-xs text-nike-mute dark:text-nike-stone font-medium">Registered Tenants</span>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 block mt-1">
            {tenants.length} tenants
          </span>
        </div>
        <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card p-5 rounded-2xl">
          <span className="text-xs text-nike-mute dark:text-nike-stone font-medium">Occupancy Conflict Protection</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-4 h-4" /> Active (prevents double booking)
          </span>
        </div>
      </div>

      {/* ACTIVE LEASES TABLE SECTION */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-nike-ink dark:text-white flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-blue-600" />
            Active Lease Agreements & Occupancy
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-nike-hairline dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-semibold">
                <th className="p-3">Unit</th>
                <th className="p-3">Tenant Name</th>
                <th className="p-3">Lease Start & End</th>
                <th className="p-3">Rent / Cycle</th>
                <th className="p-3">Deposit Amount</th>
                <th className="p-3">Lease Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nike-hairline/60 dark:divide-nike-dark-card/60">
              {leases.map((lease) => (
                <tr key={lease.id} className="hover:bg-nike-soft-cloud/50 dark:hover:bg-nike-dark-card/30">
                  <td className="p-3 font-bold text-nike-ink dark:text-white text-sm">
                    Unit {lease.roomNumber}
                  </td>
                  <td className="p-3 font-medium text-nike-ink dark:text-white">
                    {lease.tenantName}
                    <span className="block text-[11px] text-nike-stone">{lease.tenantPhone}</span>
                  </td>
                  <td className="p-3 text-nike-mute dark:text-nike-stone">
                    {formatDate(lease.checkInDate)} to {formatDate(lease.checkOutDate)}
                  </td>
                  <td className="p-3 font-semibold text-nike-ink dark:text-white">
                    {formatCurrency(lease.rentAmount)}
                    <span className="block text-[11px] text-nike-stone">
                      ({lease.billingCycle})
                    </span>
                  </td>
                  <td className="p-3 text-nike-mute dark:text-nike-stone">
                    {formatCurrency(lease.depositAmount)}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      lease.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    }`}>
                      {lease.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => setSelectedLeaseForContract(lease)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition-colors inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> PDF Contract
                    </button>
                    {lease.status === 'Active' && (
                      <button
                        onClick={() => handleTerminateLease(lease.id)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                      >
                        Terminate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TENANTS DIRECTORY TABLE */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-nike-ink dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Tenant Directory Records
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-nike-mute" />
            <input
              type="text"
              placeholder="Search name, phone or unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-surface border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map((tenant) => (
            <div key={tenant.id} className="p-4 rounded-xl border border-nike-hairline dark:border-nike-dark-card bg-nike-soft-cloud/40 dark:bg-nike-dark-surface space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-nike-ink dark:text-white text-base">{tenant.fullname}</h4>
                  <span className="text-xs text-nike-stone block">ID / Passport: {tenant.idCardPassport || '-'}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenTenantModal(tenant)} className="p-1 text-nike-mute hover:text-nike-ink dark:hover:text-white">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteTenant(tenant.id)} className="p-1 text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-nike-mute dark:text-nike-stone">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> {tenant.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> {tenant.email || '-'}
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-3.5 h-3.5" /> Assigned: <strong className="text-nike-ink dark:text-white">{tenant.unitNumber ? `Unit ${tenant.unitNumber}` : 'Unassigned'}</strong>
                </div>
              </div>

              <button
                onClick={() => handleOpenLeaseModal(tenant)}
                className="w-full py-2 text-xs font-semibold rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Assign to Unit / Create Lease
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE / EDIT TENANT MODAL */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveTenant} className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-nike-ink dark:text-white">
              {tenantFormData.id ? 'Edit Tenant Profile' : 'Register New Tenant'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={tenantFormData.fullname || ''}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, fullname: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={tenantFormData.phone || ''}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="081-234-5678"
                />
              </div>

              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={tenantFormData.email || ''}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">ID Card / Passport No.</label>
                <input
                  type="text"
                  value={tenantFormData.idCardPassport || ''}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, idCardPassport: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="1-1002-XXXXX-XX-X"
                />
              </div>

              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Emergency Contact</label>
                <input
                  type="text"
                  value={tenantFormData.emergencyContact || ''}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, emergencyContact: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="Contact Person & Phone Number"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTenantModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card text-nike-ink dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE LEASE AGREEMENT MODAL */}
      {showLeaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveLease} className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-3">
              <h3 className="text-lg font-bold text-nike-ink dark:text-white flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-blue-600" />
                Create Lease Agreement & Assign Unit
              </h3>
              <p className="text-xs text-nike-mute dark:text-nike-stone">
                Occupancy Conflict Protection will automatically prevent overlapping active leases on the same unit.
              </p>
            </div>

            <div className="space-y-3 text-xs">

              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Select Tenant *</label>
                <select
                  required
                  value={leaseFormData.tenantId}
                  onChange={(e) => {
                    const sel = tenants.find(t => t.id === e.target.value);
                    setLeaseFormData({
                      ...leaseFormData,
                      tenantId: e.target.value,
                      tenantName: sel?.fullname || '',
                      tenantPhone: sel?.phone || '',
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.fullname} ({t.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Select Apartment Unit *</label>
                <select
                  required
                  value={leaseFormData.roomId}
                  onChange={(e) => handleRoomSelectInLease(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Unit {r.roomNumber} (Floor {r.floor}) - {r.status} - {formatCurrency(r.price)}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Lease Start Date (Check-in) *</label>
                  <input
                    type="date"
                    required
                    value={leaseFormData.checkInDate || ''}
                    onChange={(e) => setLeaseFormData({ ...leaseFormData, checkInDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Lease End Date (Check-out) *</label>
                  <input
                    type="date"
                    required
                    value={leaseFormData.checkOutDate || ''}
                    onChange={(e) => setLeaseFormData({ ...leaseFormData, checkOutDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Rent Amount (THB) *</label>
                  <input
                    type="number"
                    required
                    value={leaseFormData.rentAmount || 5500}
                    onChange={(e) => setLeaseFormData({ ...leaseFormData, rentAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Billing Cycle *</label>
                  <select
                    value={leaseFormData.billingCycle || 'monthly'}
                    onChange={(e) => setLeaseFormData({ ...leaseFormData, billingCycle: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-nike-mute dark:text-nike-stone mb-1 font-medium">Security Deposit Amount (THB)</label>
                <input
                  type="number"
                  value={leaseFormData.depositAmount || (leaseFormData.rentAmount ? leaseFormData.rentAmount * 2 : 11000)}
                  onChange={(e) => setLeaseFormData({ ...leaseFormData, depositAmount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-surface border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-nike-hairline dark:border-nike-dark-card">
              <button
                type="button"
                onClick={() => setShowLeaseModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-nike-soft-cloud dark:bg-nike-dark-card text-nike-ink dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Lease
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRINTABLE RENT CONTRACT MODAL */}
      {selectedLeaseForContract && (
        <ContractModal
          lease={selectedLeaseForContract}
          onClose={() => setSelectedLeaseForContract(null)}
        />
      )}

    </div>
  );
};
