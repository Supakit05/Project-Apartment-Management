import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, Search, Building2 } from 'lucide-react';
import { Room, RoomStatus, Building } from '../../types';
import { getRooms, saveRoom, deleteRoom as apiDeleteRoom, getBuildings } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { RoomModal } from '../../components/admin/RoomModal';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

export const RoomManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialBuildingId = searchParams.get('buildingId') || 'All';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [buildingFilter, setBuildingFilter] = useState<string>(initialBuildingId);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const fetchRooms = async (targetBldId?: string) => {
    const activeBldId = targetBldId !== undefined ? targetBldId : buildingFilter;
    try {
      const [roomList, bldList] = await Promise.all([getRooms(), getBuildings()]);
      setRooms(roomList);
      setBuildings(bldList);
      applyFilters(roomList, searchQuery, statusFilter, activeBldId, bldList);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  useEffect(() => {
    const bldParam = searchParams.get('buildingId') || 'All';
    setBuildingFilter(bldParam);
    fetchRooms(bldParam);
  }, [searchParams]);

  const applyFilters = (list: Room[], query: string, status: string, bldId: string, bldList?: Building[]) => {
    let result = [...list];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(r => (r.roomNumber || '').toLowerCase().includes(q) || (r.roomType || '').toLowerCase().includes(q));
    }
    if (status !== 'All') {
      result = result.filter(r => r.status === status);
    }
    if (bldId !== 'All') {
      const allBlds = bldList || buildings;
      const targetBld = allBlds.find(b => b.id === bldId || b.code === bldId);

      result = result.filter(r => {
        // Direct ID match
        if (targetBld && r.buildingId === targetBld.id) return true;
        if (r.buildingId === bldId) return true;

        // Building B identification (check code or explicit ID 'bld-2')
        const isBldB = (targetBld && (targetBld.code === 'B' || targetBld.id === 'bld-2')) || bldId === 'bld-2';
        const isBldA = (targetBld && (targetBld.code === 'A' || targetBld.id === 'bld-1')) || bldId === 'bld-1';

        const roomIsB = r.buildingId === 'bld-2' || (r.roomNumber && r.roomNumber.toUpperCase().startsWith('B'));

        if (isBldB) return roomIsB;
        if (isBldA) return !roomIsB;

        return r.buildingId === bldId;
      });
    }
    setFilteredRooms(result);
  };

  const getRoomBuildingName = (room: Room) => {
    if (room.buildingName) {
      if (language === 'en') {
        if (room.buildingName.includes('อาคาร A') || room.buildingName.includes('Tower A')) return 'Building A (Victory Tower A)';
        if (room.buildingName.includes('อาคาร B') || room.buildingName.includes('Residence B')) return 'Building B (Victory Residence B)';
      }
      return room.buildingName;
    }
    if (room.buildingId === 'bld-2' || (room.roomNumber && room.roomNumber.toUpperCase().startsWith('B'))) {
      return language === 'th' ? 'อาคาร B (Victory Residence B)' : 'Building B (Victory Residence B)';
    }
    return language === 'th' ? 'อาคาร A (Victory Tower A)' : 'Building A (Victory Tower A)';
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    applyFilters(rooms, q, statusFilter, buildingFilter);
  };

  const handleStatusFilterChange = (st: string) => {
    setStatusFilter(st);
    applyFilters(rooms, searchQuery, st, buildingFilter);
  };

  const handleBuildingFilterChange = (bldId: string) => {
    setBuildingFilter(bldId);
    applyFilters(rooms, searchQuery, statusFilter, bldId);
  };

  const handleQuickStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    await saveRoom({ id: roomId, status: newStatus });
    toast.success(`Updated room status to ${newStatus}`);
    fetchRooms();
  };

  const handleDelete = async (roomId: string, roomNo: string) => {
    if (window.confirm(`Are you sure you want to delete Room ${roomNo}?`)) {
      await apiDeleteRoom(roomId);
      toast.info(`Deleted Room ${roomNo}`);
      fetchRooms();
    }
  };

  const handleSaveModal = async (roomData: Partial<Room>) => {
    await saveRoom(roomData);
    toast.success(roomData.id ? 'Room updated successfully' : 'New room created');
    fetchRooms();
  };

  const getBuildingDisplayName = (bldId: string) => {
    const b = buildings.find(item => item.id === bldId || item.code === bldId);
    if (b) {
      if (language === 'en') {
        if (b.name.includes('อาคาร A') || b.name.includes('Tower A')) return 'Building A (Victory Tower A)';
        if (b.name.includes('อาคาร B') || b.name.includes('Residence B')) return 'Building B (Victory Residence B)';
      }
      return b.name;
    }
    if (bldId === 'bld-2') return language === 'th' ? 'อาคาร B (Victory Residence B)' : 'Building B (Victory Residence B)';
    return language === 'th' ? 'อาคาร A (Victory Tower A)' : 'Building A (Victory Tower A)';
  };

  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nike-hairline dark:border-nike-dark-card pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-nike-ink dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" /> {t('roomMgmt.title')}
          </h1>
          <p className="text-[14px] text-nike-mute dark:text-nike-stone mt-0.5">
            {t('roomMgmt.sub')}
          </p>
        </div>

        <button
          onClick={() => { setSelectedRoom(null); setModalOpen(true); }}
          className="bg-blue-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" /> {t('roomMgmt.addRoom')}
        </button>
      </div>

      {/* BUILDING CONTEXT BANNER */}
      {buildingFilter !== 'All' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-blue-900 dark:text-blue-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              {language === 'th' ? 'กำลังจัดการห้องพักเฉพาะ: ' : 'Managing units in: '}{getBuildingDisplayName(buildingFilter)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/buildings"
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
            >
              {language === 'th' ? 'กลับหน้าจัดการอาคาร' : 'Back to Buildings'}
            </Link>
            <button
              onClick={() => handleBuildingFilterChange('All')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {language === 'th' ? 'แสดงทุกอาคาร' : 'Show All Buildings'}
            </button>
          </div>
        </div>
      )}

      {/* CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={buildingFilter !== 'All' ? "sm:col-span-3 relative" : "sm:col-span-2 relative"}>
          <Search className="w-4 h-4 text-nike-mute absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder={t('roomMgmt.search')}
            className="w-full pl-10 p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border-0 text-nike-ink dark:text-white text-[14px] rounded-[24px] focus:outline-none"
          />
        </div>

        {buildingFilter === 'All' && (
          <div>
            <select
              value={buildingFilter}
              onChange={e => handleBuildingFilterChange(e.target.value)}
              className="w-full p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border-0 text-nike-ink dark:text-white text-[14px] rounded-[24px] focus:outline-none cursor-pointer font-medium"
            >
              <option value="All">{t('roomMgmt.allBuildings')}</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>
                  {language === 'en' ? (b.name.includes('อาคาร A') ? 'Building A (Victory Tower A)' : b.name.includes('อาคาร B') ? 'Building B (Victory Residence B)' : b.name) : b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <select
            value={statusFilter}
            onChange={e => handleStatusFilterChange(e.target.value)}
            className="w-full p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border-0 text-nike-ink dark:text-white text-[14px] rounded-[24px] focus:outline-none cursor-pointer font-medium"
          >
            <option value="All">{t('roomMgmt.allStatuses')}</option>
            <option value="Available">{t('common.available')}</option>
            <option value="Reserved">{t('common.reserved')}</option>
            <option value="Occupied">{t('common.occupied')}</option>
            <option value="Maintenance">{t('common.maintenance')}</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-nike-hairline-soft dark:border-nike-dark-card text-nike-mute dark:text-nike-stone font-medium text-[13px]">
              <th className="p-4">{t('roomMgmt.unitNo')}</th>
              <th className="p-4">{t('roomMgmt.building')}</th>
              <th className="p-4">{t('roomMgmt.type')}</th>
              <th className="p-4">{t('roomMgmt.rent')}</th>
              <th className="p-4">{t('roomMgmt.size')}</th>
              <th className="p-4">{t('roomMgmt.status')}</th>
              <th className="p-4 text-right">{t('roomMgmt.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nike-hairline-soft dark:divide-nike-dark-card">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-nike-mute">
                  {language === 'th' ? 'ไม่พบข้อมูลห้องพักที่ตรงกับเงื่อนไข' : 'No units found matching query'}
                </td>
              </tr>
            ) : (
              filteredRooms.map(room => (
                <tr key={room.id} className="hover:bg-nike-soft-cloud dark:hover:bg-nike-dark-card/50 transition-colors">
                  <td className="p-4 font-bold text-nike-ink dark:text-white">
                    {t('common.unit')} {room.roomNumber}
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                    {getRoomBuildingName(room)}
                  </td>
                  <td className="p-4 text-nike-mute dark:text-nike-stone font-medium">{room.roomType}</td>
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
                      <option value="Available">{t('common.available')}</option>
                      <option value="Reserved">{t('common.reserved')}</option>
                      <option value="Occupied">{t('common.occupied')}</option>
                      <option value="Maintenance">{t('common.maintenance')}</option>
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
        defaultBuildingId={buildingFilter !== 'All' ? buildingFilter : undefined}
      />

    </div>
  );
};
