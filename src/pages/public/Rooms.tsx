import React, { useEffect, useState } from 'react';
import { RoomCard } from '../../components/common/RoomCard';
import { Room } from '../../types';
import { getRooms } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

export const Rooms: React.FC = () => {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = (room.roomNumber || '').toLowerCase().includes(q);
      const nameMatch = (room.roomName || '').toLowerCase().includes(q);
      const typeMatch = (room.roomType || '').toLowerCase().includes(q);
      if (!numMatch && !nameMatch && !typeMatch) return false;
    }

    // Building filter
    if (buildingFilter !== 'all') {
      const isBld2 = room.buildingId === 'bld-2' || room.roomNumber.startsWith('B');
      if (buildingFilter === 'bld-2' && !isBld2) return false;
      if (buildingFilter === 'bld-1' && isBld2) return false;
    }

    // Floor filter
    if (floorFilter !== 'all' && room.floor.toString() !== floorFilter) return false;
    
    // Status filter
    if (statusFilter !== 'all' && room.status !== statusFilter) return false;
    
    // Type filter
    if (typeFilter !== 'all' && room.roomType !== typeFilter) return false;
    
    return true;
  });

  const availableCount = rooms.filter(r => r.status === 'Available').length;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 space-y-8">
      
      {/* SUB-NAV BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-medium text-nike-mute dark:text-nike-stone">
        <Link to="/" className="hover:text-nike-ink dark:hover:text-white transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <span className="text-nike-ink dark:text-white font-bold">{t('nav.units')}</span>
      </div>

      {/* PLP TITLE & FILTER BAR */}
      <div className="border-b border-nike-hairline dark:border-nike-dark-card pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-nike-ink dark:text-white">
            {t('nav.units')}
          </h1>
          <p className="text-xs text-nike-mute dark:text-nike-stone mt-1">
            {t('filter.unitsFound')}: {filteredRooms.length} / {rooms.length} ({availableCount} {t('common.available')})
          </p>
        </div>

        {/* SEARCH INPUT & PILL FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <input
            type="text"
            placeholder={t('filter.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all w-full sm:w-56"
          />

          {/* Building selector */}
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all cursor-pointer font-bold text-blue-600 dark:text-blue-400"
          >
            <option value="all">{t('filter.allBuildings')}</option>
            <option value="bld-1">{t('filter.buildingA')}</option>
            <option value="bld-2">{t('filter.buildingB')}</option>
          </select>

          {/* Floor selector */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all cursor-pointer"
          >
            <option value="all">{t('filter.allFloors')}</option>
            <option value="1">{t('filter.floor1')}</option>
            <option value="2">{t('filter.floor2')}</option>
          </select>

          {/* Type selector */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all cursor-pointer"
          >
            <option value="all">{t('filter.allTypes')}</option>
            <option value="Studio (Single Bed)">Studio (Single Bed)</option>
            <option value="Studio (Double Bed)">Studio (Double Bed)</option>
            <option value="1-Bedroom">1-Bedroom</option>
            <option value="1-Bedroom Suite">1-Bedroom Suite</option>
            <option value="Corner Room">Corner Room</option>
          </select>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-nike-soft-cloud dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all cursor-pointer"
          >
            <option value="all">{t('filter.allStatus')}</option>
            <option value="Available">{t('common.available')}</option>
            <option value="Occupied">{t('common.occupied')}</option>
            <option value="Reserved">{t('common.reserved')}</option>
          </select>
        </div>
      </div>

      {/* 4-UP UNITS GRID */}
      {loading ? (
        <div className="text-center py-24 text-nike-mute font-medium">Loading residential units...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-24 bg-nike-soft-cloud dark:bg-nike-dark-elevated rounded-3xl border border-nike-hairline dark:border-nike-dark-card space-y-3">
          <p className="text-sm font-bold text-nike-ink dark:text-white">{t('filter.noResults')}</p>
          <button
            onClick={() => { setBuildingFilter('all'); setFloorFilter('all'); setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
            className="text-xs font-bold text-nike-ink dark:text-white hover:underline"
          >
            {t('filter.reset')} &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
};
