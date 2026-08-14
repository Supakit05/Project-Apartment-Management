import React, { useState } from 'react';
import { Room, MaintenanceLog } from '../../types';
import { formatCurrency, formatSuppliesSummary } from '../../utils/formatters';
import { UserCheck, Wrench, Home, X } from 'lucide-react';
import { getMaintenanceLogs } from '../../services/api';

interface ApartmentFloorGridProps {
  rooms: Room[];
  onSelectRoom?: (room: Room) => void;
  onRefresh?: () => void;
}

export const ApartmentFloorGrid: React.FC<ApartmentFloorGridProps> = ({ rooms, onSelectRoom }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomLogs, setRoomLogs] = useState<MaintenanceLog[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'logs'>('info');

  const floor1Rooms = rooms.filter(r => r.floor === 1 || (r.roomNumber || '').startsWith('1')).sort((a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''));
  const floor2Rooms = rooms.filter(r => r.floor === 2 || (r.roomNumber || '').startsWith('2')).sort((a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''));

  const handleRoomClick = async (room: Room) => {
    setSelectedRoom(room);
    setActiveTab('info');
    try {
      const logs = await getMaintenanceLogs(room.id);
      setRoomLogs(logs);
    } catch {
      setRoomLogs([]);
    }
    if (onSelectRoom) onSelectRoom(room);
  };

  const getStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-emerald-500/15 text-emerald-600 dark:text-white border-emerald-500/40 font-semibold',
          dot: 'bg-emerald-500',
          text: 'Available'
        };
      case 'Occupied':
        return {
          bg: 'bg-blue-500/15 text-blue-600 dark:text-white border-blue-500/40 font-semibold',
          dot: 'bg-blue-500',
          text: 'Occupied'
        };
      case 'Reserved':
        return {
          bg: 'bg-amber-500/15 text-amber-600 dark:text-white border-amber-500/40 font-semibold',
          dot: 'bg-amber-500',
          text: 'Reserved'
        };
      case 'Maintenance':
        return {
          bg: 'bg-rose-500/15 text-rose-600 dark:text-white border-rose-500/40 font-semibold',
          dot: 'bg-rose-500',
          text: 'Maintenance'
        };
      default:
        return {
          bg: 'bg-gray-500/15 text-gray-600 dark:text-white border-gray-500/40 font-semibold',
          dot: 'bg-gray-500',
          text: status
        };
    }
  };

  const renderFloorGrid = (floorTitle: string, floorRooms: Room[]) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-nike-hairline dark:border-nike-dark-card pb-2">
        <h3 className="text-lg font-semibold text-nike-ink dark:text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {floorTitle} ({floorRooms.length} units)
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-slate-800 dark:text-white font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Available
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 text-slate-800 dark:text-white font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Occupied
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-slate-800 dark:text-white font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Reserved
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 text-slate-800 dark:text-white font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Maintenance
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {floorRooms.map((room) => {
          const badge = getStatusBadge(room.status);
          return (
            <button
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] transition-all text-left relative overflow-hidden group shadow-2xs"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xl font-bold tracking-tight text-nike-ink dark:text-white">
                  Unit {room.roomNumber}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border flex items-center gap-1.5 ${badge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                  {badge.text}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-300 truncate">
                  {room.roomType}
                </div>

                {room.currentTenantName ? (
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate flex items-center gap-1">
                    <UserCheck className="w-3 h-3 flex-shrink-0" />
                    {room.currentTenantName}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 dark:text-slate-400 italic">
                    (No Tenant)
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between w-full text-xs">
                <span className="font-semibold text-nike-ink dark:text-white">
                  {formatCurrency(room.price)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">/month</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Floor 1 Grid */}
      {renderFloorGrid('Floor 1 (Units 101 - 112)', floor1Rooms)}

      {/* Floor 2 Grid */}
      {renderFloorGrid('Floor 2 (Units 201 - 212)', floor2Rooms)}

      {/* Quick Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-nike-hairline dark:border-nike-dark-card pb-4">
              <div>
                <span className="text-xs font-semibold tracking-wider text-nike-mute dark:text-nike-stone uppercase">
                  Unit Details
                </span>
                <h3 className="text-2xl font-bold text-nike-ink dark:text-white flex items-center gap-2">
                  Unit {selectedRoom.roomNumber} ({selectedRoom.roomName})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1.5 rounded-full hover:bg-nike-soft-cloud dark:hover:bg-nike-dark-card text-nike-mute hover:text-nike-ink dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-nike-hairline dark:border-nike-dark-card gap-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-nike-ink dark:border-white text-nike-ink dark:text-white font-bold'
                    : 'border-transparent text-nike-mute'
                }`}
              >
                Tenant & Pricing Info
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'logs'
                    ? 'border-nike-ink dark:border-white text-nike-ink dark:text-white font-bold'
                    : 'border-transparent text-nike-mute'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Maintenance History ({roomLogs.length})
              </button>
            </div>

            {activeTab === 'info' ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 bg-nike-soft-cloud dark:bg-nike-dark-surface p-4 rounded-xl">
                  <div>
                    <span className="text-xs text-nike-mute dark:text-nike-stone block">Current Status</span>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(selectedRoom.status).bg}`}>
                      {getStatusBadge(selectedRoom.status).text}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-nike-mute dark:text-nike-stone block">Monthly Rent</span>
                    <span className="text-base font-bold text-nike-ink dark:text-white block mt-0.5">
                      {formatCurrency(selectedRoom.price)} / month
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-nike-mute dark:text-nike-stone block">Room Type</span>
                    <span className="font-medium text-nike-ink dark:text-white block mt-0.5">
                      {selectedRoom.roomType} ({selectedRoom.sizeSqm} m²)
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-nike-mute dark:text-nike-stone block">Current Tenant</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                      {selectedRoom.currentTenantName || 'No Active Tenant'}
                    </span>
                  </div>
                </div>

                <div className="border border-nike-hairline dark:border-nike-dark-card p-4 rounded-xl space-y-2">
                  <h4 className="font-semibold text-nike-ink dark:text-white text-xs uppercase tracking-wider">
                    Latest Meter Readings
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-nike-mute dark:text-nike-stone block">Water Meter:</span>
                      <span className="font-medium text-nike-ink dark:text-white">{selectedRoom.currWaterMeter || selectedRoom.prevWaterMeter || '-'} units</span>
                    </div>
                    <div>
                      <span className="text-nike-mute dark:text-nike-stone block">Electric Meter:</span>
                      <span className="font-medium text-nike-ink dark:text-white">{selectedRoom.currElectricMeter || selectedRoom.prevElectricMeter || '-'} units</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {roomLogs.length === 0 ? (
                  <p className="text-xs text-nike-mute dark:text-nike-stone py-4 text-center">
                    No maintenance records for this unit.
                  </p>
                ) : (
                  roomLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-nike-soft-cloud dark:bg-nike-dark-surface rounded-xl border border-nike-hairline dark:border-nike-dark-card text-xs space-y-1">
                      <div className="flex justify-between items-center font-medium text-nike-ink dark:text-white">
                        <span>{log.category} ({log.taskNo})</span>
                        <span className="text-nike-mute dark:text-nike-stone">{log.date}</span>
                      </div>
                      <p className="text-nike-mute dark:text-nike-stone">{log.description}</p>
                      <div className="flex justify-between text-[11px] pt-1 text-nike-stone">
                        <span>Supplies: {formatSuppliesSummary(log.suppliesSummary)}</span>
                        <span className="font-semibold text-nike-ink dark:text-white">Total: {formatCurrency(log.totalCost)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-nike-soft-cloud dark:bg-nike-dark-card hover:bg-nike-hairline text-nike-ink dark:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
