import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Room } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { BedDouble, Maximize2, ArrowUpRight } from 'lucide-react';

export const RoomCard: React.FC<{ room: Room }> = ({ room }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isAvailable = room.status === 'Available';

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Available': return t('common.available');
      case 'Reserved': return t('common.reserved');
      case 'Occupied': return t('common.occupied');
      default: return status;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if user didn't click directly on an anchor/button element
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    navigate(`/rooms/${room.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
    >
      
      {/* STUDIO STAGE / IMAGE CONTAINER */}
      <div className="relative h-56 overflow-hidden bg-nike-soft-cloud dark:bg-nike-dark-card flex items-center justify-center">
        <img
          src={room.coverImage || '/rooms/room_standard.png'}
          alt={room.roomName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* TOP LEFT: UNIT PILL */}
        <div className="absolute top-3 left-3">
          <span className="bg-nike-ink/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-nike-ink text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
            {t('common.floor')} {room.floor} · {t('common.unit')} {room.roomNumber}
          </span>
        </div>

        {/* TOP RIGHT: STATUS PILL */}
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-xs ${
            isAvailable 
              ? 'bg-nike-success text-white' 
              : room.status === 'Reserved' 
                ? 'bg-amber-500 text-white' 
                : 'bg-nike-sale text-white'
          }`}>
            {getStatusText(room.status)}
          </span>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* CATEGORY & NAME */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold text-nike-mute dark:text-nike-stone">
              {room.roomType}
            </span>
          </div>

          <h3 className="font-bold text-lg text-nike-ink dark:text-white line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
            {room.roomName}
          </h3>

          <p className="text-xs font-normal text-nike-mute dark:text-nike-stone line-clamp-2 mt-1.5 leading-relaxed">
            {room.description}
          </p>

          {/* KEY METRICS */}
          <div className="flex items-center gap-4 text-xs font-medium text-nike-charcoal dark:text-nike-stone mt-3 pt-3 border-t border-nike-hairline-soft dark:border-nike-dark-card">
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-nike-ink dark:text-white" /> {room.sizeSqm} {t('room.sqm')}
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-nike-ink dark:text-white" /> {room.bedType}
            </span>
          </div>
        </div>

        {/* PRICE & CTAS */}
        <div className="flex items-end justify-between pt-3 border-t border-nike-hairline-soft dark:border-nike-dark-card">
          <div>
            <span className="text-[10px] font-medium text-nike-mute dark:text-nike-stone block mb-0.5">
              {t('track.field.rate')}
            </span>
            <span className="text-xl font-bold text-nike-ink dark:text-white leading-none block">
              {formatCurrency(room.price)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/rooms/${room.id}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3.5 py-2 text-xs font-bold rounded-full bg-nike-soft-cloud hover:bg-neutral-200 dark:bg-nike-dark-card dark:hover:bg-neutral-700 text-nike-ink dark:text-white transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap"
            >
              {t('room.detailsBtn')} <ArrowUpRight className="w-3 h-3" />
            </Link>
            {isAvailable && (
              <Link
                to={`/booking/${room.id}`}
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 text-xs font-bold rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-sm whitespace-nowrap"
              >
                {t('room.bookBtn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
