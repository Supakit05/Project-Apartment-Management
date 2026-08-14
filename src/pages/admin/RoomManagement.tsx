import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Search, Building2 } from 'lucide-react';
import { Room, RoomStatus } from '../../types';
import { getRooms, saveRoom, deleteRoom as apiDeleteRoom } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { RoomModal } from '../../components/admin/RoomModal';
import { toast } from 'sonner';

export const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const fetchRooms = async () => {
    try {
      const list = await getRooms();
      setRooms(list);
      applyFilters(list, searchQuery, statusFilter);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const applyFilters = (list: Room[], query: string, status: string) => {
    let result = [...list];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(r => (r.roomName || '').toLowerCase().includes(q) || (r.roomNumber || '').includes(q) || (r.roomType || '').toLowerCase().includes(q));
    }
    if (status !== 'All') {
      result = result.filter(r => r.status === status);
    }
    setFilteredRooms(result);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    applyFilters(rooms, q, statusFilter);
  };

  const handleStatusFilterChange = (st: string) => {
    setStatusFilter(st);
    applyFilters(rooms, searchQuery, st);
  };

  const handleQuickStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    await saveRoom({ id: roomId, status: newStatus });
    toast.success(`Updated unit status to ${newStatus}`);
    fetchRooms();
  };

  const handleDelete = async (roomId: string, roomNo: string) => {
    if (window.confirm(`Are you sure you want to delete Unit ${roomNo}?`)) {
      await apiDeleteRoom(roomId);
      toast.info(`Deleted Unit ${roomNo}`);
      fetchRooms();
    }
  };

  const handleSaveModal = async (roomData: Partial<Room>) => {
    await saveRoom(roomData);
    toast.success(roomData.id ? 'Unit updated successfully' : 'New unit created');
    fetchRooms();
  };

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nike-hairline dark:border-nike-dark-card pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" /> Apartment Units Directory
          </h1>
          <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
            Manage unit details, pricing, floor assignments, and current status
          </p>
        </div>

        <button
          onClick={() => { setSelectedRoom(null); setModalOpen(true); }}
          className="bg-blue-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Unit
        </button>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-nike-mute absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by unit name, number, or type..."
            className="w-full pl-10 p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border-0 text-nike-ink dark:text-white text-[14px] rounded-[24px] focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => handleStatusFilterChange(e.target.value)}
            className="w-full p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border-0 text-nike-ink dark:text-white text-[14px] rounded-[24px] focus:outline-none cursor-pointer"
          >
            <option value="All">All Unit Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-nike-hairline-soft dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-medium text-[13px]">
              <th className="p-4">Unit No.</th>
              <th className="p-4">Unit Name</th>
              <th className="p-4">Room Type</th>
              <th className="p-4">Monthly Rent</th>
              <th className="p-4">Size & Capacity</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nike-hairline-soft dark:divide-nike-dark-card">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-nike-mute">
                  No units found matching query
                </td>
              </tr>
            ) : (
              filteredRooms.map(room => (
                <tr key={room.id} className="hover:bg-nike-soft-cloud dark:hover:bg-nike-dark-card/50 transition-colors">
                  <td className="p-4 font-bold text-nike-ink dark:text-white">
                    Unit {room.roomNumber}
                  </td>
                  <td className="p-4 font-medium text-nike-ink dark:text-white">
                    {room.roomName}
                  </td>
                  <td className="p-4 text-nike-mute dark:text-nike-stone">{room.roomType}</td>
                  <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(room.price)}
                  </td>
                  <td className="p-4 text-nike-mute dark:text-nike-stone">{room.sizeSqm} m² ({room.capacity} Guests)</td>
                  <td className="p-4">
                    <select
                      value={room.status}
                      onChange={e => handleQuickStatusChange(room.id, e.target.value as RoomStatus)}
                      className={`p-1.5 text-[12px] font-bold rounded-full border-0 focus:outline-none cursor-pointer ${
                        room.status === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        room.status === 'Reserved' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        room.status === 'Occupied' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => { setSelectedRoom(room); setModalOpen(true); }}
                      className="p-2 text-nike-mute hover:text-nike-ink dark:hover:text-white transition-colors"
                      title="Edit Unit"
                    >
                      <Edit3 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id, room.roomNumber)}
                      className="p-2 text-rose-500 hover:opacity-80 transition-opacity"
                      title="Delete Unit"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RoomModal
        room={selectedRoom}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
      />

    </div>
  );
};
