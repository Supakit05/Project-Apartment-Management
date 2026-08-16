import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Room } from '../../types';
import { getBuildings, saveBuilding, deleteBuilding, getRooms } from '../../services/api';
import { Building2, Plus, Edit2, Trash2, Home, Users, Search, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

export const BuildingManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Partial<Building> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, rData] = await Promise.all([getBuildings(), getRooms()]);
      setBuildings(bData);
      setRooms(rData);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลอาคารได้');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBuilding({
      name: '',
      code: '',
      floors: 5,
      totalRooms: 20,
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (building: Building) => {
    setEditingBuilding(building);
    setIsModalOpen(true);
  };

  const handleDeleteBuilding = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบ "${name}" ใช่หรือไม่?`)) {
      try {
        await deleteBuilding(id);
        toast.success(`ลบ ${name} เรียบร้อยแล้ว`);
        loadData();
      } catch {
        toast.error('เกิดข้อผิดพลาดในการลบอาคาร');
      }
    }
  };

  const handleSubmitBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilding?.name || !editingBuilding?.code) {
      toast.error('กรุณากรอกชื่ออาคารและรหัสอาคาร');
      return;
    }

    try {
      await saveBuilding(editingBuilding);
      toast.success(editingBuilding.id ? 'แก้ไขข้อมูลอาคารเรียบร้อย' : 'เพิ่มอาคารใหม่เรียบร้อย');
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('ไม่สามารถบันทึกข้อมูลอาคารได้');
    }
  };

  const filteredBuildings = buildings.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to calculate stats per building
  const getBuildingStats = (buildingId: string, buildingCode: string) => {
    const bCode = (buildingCode || '').toLowerCase();
    const buildingRooms = rooms.filter(r => {
      if (r.buildingId && r.buildingId === buildingId) return true;
      if (r.buildingName && (r.buildingName.toLowerCase().includes(bCode) || r.buildingName.toLowerCase() === bCode)) return true;
      if (bCode && r.roomNumber.toLowerCase().startsWith(bCode)) return true;
      if (!r.buildingId && !r.buildingName) {
        if (buildingId === 'bld-1' || bCode === 'a') return r.floor === 1 || r.roomNumber.startsWith('1');
        if (buildingId === 'bld-2' || bCode === 'b') return r.floor === 2 || r.roomNumber.startsWith('2');
      }
      return false;
    });
    const total = buildingRooms.length;
    const occupied = buildingRooms.filter(r => r.status === 'Occupied').length;
    const available = buildingRooms.filter(r => r.status === 'Available').length;
    const maintenance = buildingRooms.filter(r => r.status === 'Maintenance').length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, maintenance, occupancyRate };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-nike-dark-card p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t('bld.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('bld.sub')}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          {t('bld.addBtn')}
        </button>
      </div>

      {/* Global Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-nike-dark-card p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">อาคารทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{buildings.length} อาคาร</p>
          </div>
        </div>

        <div className="bg-white dark:bg-nike-dark-card p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ห้องพักในระบบรวม</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{rooms.length} ห้อง</p>
          </div>
        </div>

        <div className="bg-white dark:bg-nike-dark-card p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">อัตราการเข้าพักรวม</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="ค้นหาตามชื่อตึก หรือรหัสตึก..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nike-dark-card border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Building List Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">กำลังโหลดข้อมูลอาคาร...</div>
      ) : filteredBuildings.length === 0 ? (
        <div className="bg-white dark:bg-nike-dark-card p-12 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">ไม่พบข้อมูลอาคาร</h3>
          <p className="text-slate-500 text-sm mt-1">กดปุ่ม "เพิ่มตึกใหม่" เพื่อสร้างข้อมูลอาคารแรกในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBuildings.map((building) => {
            const stats = getBuildingStats(building.id, building.code);
            return (
              <div
                key={building.id}
                className="bg-white dark:bg-nike-dark-card rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
              >
                {/* Building Cover & Header */}
                <div className="relative h-48 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={building.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                    alt={building.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    รหัสตึก: {building.code}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold">{building.name}</h3>
                    <p className="text-xs text-slate-200 opacity-90 line-clamp-1 mt-0.5">{building.address || 'ไม่มีที่อยู่ระบุ'}</p>
                  </div>
                </div>

                {/* Content & Stats */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {building.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับอาคารนี้'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="block text-xs text-slate-400">ห้องทั้งหมด</span>
                        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{stats.total || building.totalRooms}</span>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <span className="block text-xs text-emerald-600 dark:text-emerald-400">ห้องว่าง</span>
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{stats.available}</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <span className="block text-xs text-blue-600 dark:text-blue-400">มีคนเช่า</span>
                        <span className="text-base font-bold text-blue-600 dark:text-blue-400">{stats.occupied}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(building)}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="แก้ไขข้อมูลตึก"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBuilding(building.id, building.name)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        title="ลบตึก"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/admin/rooms?buildingId=${building.id}`)}
                      className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                    >
                      จัดการห้องในตึกนี้
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && editingBuilding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-nike-dark-card rounded-2xl max-w-lg w-full p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                {editingBuilding.id ? 'แก้ไขข้อมูลอาคาร' : 'เพิ่มตึกใหม่'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBuilding} className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ชื่ออาคาร <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น อาคาร A (Victory Tower A)"
                    value={editingBuilding.name || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    รหัสอาคาร <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น A, B"
                    value={editingBuilding.code || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">จำนวนชั้น</label>
                  <input
                    type="number"
                    min="1"
                    value={editingBuilding.floors || 1}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, floors: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">จำนวนห้องรวม</label>
                  <input
                    type="number"
                    min="1"
                    value={editingBuilding.totalRooms || 1}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, totalRooms: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">ที่อยู่อาคาร / ทำเล</label>
                <input
                  type="text"
                  placeholder="เช่น 123/1 ถนนสุขุมวิท กรุงเทพฯ"
                  value={editingBuilding.address || ''}
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">URL รูปภาพหน้าปก</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingBuilding.coverImage || ''}
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, coverImage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">คำอธิบายตึก</label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดเพิ่มเติมของอาคาร เช่น สิ่งอำนวยความสะดวก..."
                  value={editingBuilding.description || ''}
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
