import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Search, SlidersHorizontal, RotateCcw, CheckCircle2 } from 'lucide-react';
import { RoomCard } from '../../components/common/RoomCard';
import { Room } from '../../types';
import { getRooms } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('Available'); // default to Available for guests
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomData = await getRooms();
        setRooms(roomData);
      } catch (err) {
        console.error('Failed to load rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReset = () => {
    setSearchQuery('');
    setBuildingFilter('all');
    setFloorFilter('all');
    setRoomTypeFilter('all');
    setStatusFilter('all');
    setPriceFilter('all');
  };

  const filteredRooms = rooms.filter(room => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = room.roomNumber.toLowerCase().includes(q);
      const matchName = room.roomName.toLowerCase().includes(q);
      const matchType = room.roomType.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchType) return false;
    }

    if (buildingFilter !== 'all') {
      const isBld2 = room.buildingId === 'bld-2' || room.roomNumber.startsWith('B');
      if (buildingFilter === 'bld-2' && !isBld2) return false;
      if (buildingFilter === 'bld-1' && isBld2) return false;
    }

    if (floorFilter !== 'all' && room.floor.toString() !== floorFilter) return false;
    if (roomTypeFilter !== 'all' && room.roomType !== roomTypeFilter) return false;
    if (statusFilter !== 'all' && room.status !== statusFilter) return false;

    if (priceFilter === 'under6k' && room.price >= 6000) return false;
    if (priceFilter === '6k-7k' && (room.price < 6000 || room.price > 7000)) return false;
    if (priceFilter === 'above7k' && room.price <= 7000) return false;

    return true;
  });

  const availableCount = rooms.filter(r => r.status === 'Available').length;
  const isFiltered = searchQuery || buildingFilter !== 'all' || floorFilter !== 'all' || roomTypeFilter !== 'all' || statusFilter !== 'all' || priceFilter !== 'all';

  return (
    <div className="pb-24 space-y-12 sm:space-y-16">

      {/* 🚀 NIKE CAMPAIGN HERO BILLBOARD */}
      <section className="relative bg-nike-ink text-white min-h-[380px] lg:min-h-[430px] flex items-center overflow-hidden">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/rooms/room_suite.png"
            alt="Victory Apartment Bangkok"
            className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nike-ink via-nike-ink/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-10 py-12 lg:py-14 w-full">
          <div className="max-w-3xl space-y-4">
            
            {/* Top Category Tag Pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" /> {rooms.length > 0 ? `${rooms.length} ` : ''}{t('hero.tag')}
            </div>

            {/* Monumental Display Headline */}
            <h1 className="text-campaign text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white">
              {t('hero.title')}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-2xl">
              {t('hero.sub')}
            </p>

            {/* Pill CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/rooms"
                className="bg-white text-nike-ink hover:bg-neutral-100 font-bold px-6 py-2.5 rounded-full text-xs sm:text-sm transition-all active:scale-95 shadow-lg inline-flex items-center gap-2"
              >
                {language === 'th' ? `ดูห้องพักทั้งหมด (${rooms.length > 0 ? rooms.length : 36} ห้อง)` : `Explore All ${rooms.length > 0 ? rooms.length : 36} Units`} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>



      {/* 🔍 FILTER & SEARCH BAR SECTION */}
      <section id="filter-section" className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="bg-white dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nike-hairline-soft dark:border-nike-dark-card pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nike-ink text-white dark:bg-white dark:text-nike-ink rounded-full flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-nike-ink dark:text-white">{t('filter.title')}</h3>
                <p className="text-xs text-nike-mute dark:text-nike-stone">Apartment System · 2 Floors · {rooms.length > 0 ? rooms.length : 36} Units</p>
              </div>
            </div>

            {isFiltered && (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-full bg-nike-soft-cloud hover:bg-neutral-200 dark:bg-nike-dark-card dark:hover:bg-neutral-700 text-nike-sale text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t('filter.reset')}
              </button>
            )}
          </div>

          {/* FILTER INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            
            {/* Search Pill Input */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] font-bold text-nike-ink dark:text-white block">{t('filter.title')}</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-nike-mute dark:text-nike-stone" />
                <input
                  type="text"
                  placeholder={t('filter.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card rounded-full text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
                />
              </div>
            </div>

            {/* Building Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-nike-ink dark:text-white block">{t('filter.building')}</label>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all cursor-pointer"
              >
                <option value="all">{t('filter.allBuildings')}</option>
                <option value="bld-1">{t('filter.buildingA')}</option>
                <option value="bld-2">{t('filter.buildingB')}</option>
              </select>
            </div>

            {/* Floor Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-nike-ink dark:text-white block">{t('filter.floor')}</label>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card rounded-full text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              >
                <option value="all">{t('filter.allFloors')}</option>
                <option value="1">{t('filter.floor1')}</option>
                <option value="2">{t('filter.floor2')}</option>
              </select>
            </div>

            {/* Room Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-nike-ink dark:text-white block">{t('filter.unitType')}</label>
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card rounded-full text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              >
                <option value="all">{t('filter.allTypes')}</option>
                <option value="Studio (Single Bed)">Studio (Single Bed)</option>
                <option value="Studio (Double Bed)">Studio (Double Bed)</option>
                <option value="1-Bedroom">1-Bedroom</option>
                <option value="Corner Room">Corner Room</option>
              </select>
            </div>

            {/* Rent Rate */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-nike-ink dark:text-white block">{t('filter.price')}</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card rounded-full text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              >
                <option value="all">{t('filter.allPrices')}</option>
                <option value="under6k">{t('filter.under6k')}</option>
                <option value="6k-7k">{t('filter.6kTo7k')}</option>
                <option value="above7k">{t('filter.above7k')}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-nike-ink dark:text-white block">{t('filter.status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card rounded-full text-nike-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-nike-ink dark:focus:ring-white transition-all"
              >
                <option value="all">{t('filter.allStatus')}</option>
                <option value="Available">{t('common.available')}</option>
                <option value="Occupied">{t('common.occupied')}</option>
                <option value="Reserved">{t('common.reserved')}</option>
              </select>
            </div>

          </div>

        </div>
      </section>

      {/* 🏢 ROOMS GRID SECTION */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between pb-6 border-b border-nike-hairline dark:border-nike-dark-card mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-nike-ink dark:text-white">
              {statusFilter === 'Available' ? t('nav.units') : t('hero.featuredTitle')}
            </h2>
            <p className="text-xs text-nike-mute dark:text-nike-stone mt-1">
              {t('filter.unitsFound')}: {filteredRooms.length} / {rooms.length} ({availableCount} {t('common.available')})
            </p>
          </div>
          <Link to="/rooms" className="text-xs font-bold text-nike-ink dark:text-white hover:underline flex items-center gap-1">
            {language === 'th' ? `ดูห้องพักทั้งหมด (${rooms.length > 0 ? rooms.length : 36} ห้อง)` : `Explore All ${rooms.length > 0 ? rooms.length : 36} Units`} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-24 text-nike-mute font-medium">Loading apartment units...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20 bg-nike-soft-cloud dark:bg-nike-dark-elevated rounded-3xl border border-nike-hairline dark:border-nike-dark-card space-y-4">
            <CheckCircle2 className="w-12 h-12 text-nike-mute mx-auto opacity-40" />
            <p className="text-sm font-bold text-nike-ink dark:text-white">{t('filter.noResults')}</p>
            <button
              onClick={handleReset}
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
      </section>

    </div>
  );
};
