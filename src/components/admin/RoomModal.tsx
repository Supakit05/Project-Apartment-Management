import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Room, RoomType, RoomStatus, Building } from '../../types';
import { getBuildings } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface RoomModalProps {
  room?: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: Partial<Room>) => void;
  defaultBuildingId?: string;
}

const ALL_AMENITIES = [
  'Wi-Fi', 'Air Conditioner', 'Water Heater', 'Balcony',
  'Keycard Access', 'Refrigerator', 'Parking', 'CCTV'
];

export const RoomModal: React.FC<RoomModalProps> = ({ room, isOpen, onClose, onSave, defaultBuildingId }) => {
  if (!isOpen) return null;

  const { t, language } = useLanguage();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(room?.buildingId || defaultBuildingId || '');
  const [roomNumber, setRoomNumber] = useState(room?.roomNumber || '');
  const [floor, setFloor] = useState<number>(room?.floor || 1);
  const [roomType, setRoomType] = useState<RoomType>(room?.roomType || 'Standard Studio');
  const [price, setPrice] = useState(room?.price || 5500);
  const [capacity, setCapacity] = useState(room?.capacity || 2);
  const [sizeSqm, setSizeSqm] = useState(room?.sizeSqm || 28);
  const [bedType, setBedType] = useState(room?.bedType || 'King Bed');
  const [status, setStatus] = useState<RoomStatus>(room?.status || 'Available');
  const [description, setDescription] = useState(room?.description || '');
  const [coverImage, setCoverImage] = useState(room?.coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80');

  useEffect(() => {
    getBuildings().then(data => {
      setBuildings(data);
      if (!selectedBuildingId && data.length > 0) {
        setSelectedBuildingId(data[0].id);
      }
    });
  }, []);

  const handleRoomNumberChange = (val: string) => {
    setRoomNumber(val);
    if (!room) {
      const clean = val.replace(/^[^0-9]+/g, '');
      if (clean.length >= 3) {
        const parsedFloor = parseInt(clean.substring(0, clean.length - 2), 10);
        if (!isNaN(parsedFloor) && parsedFloor > 0) setFloor(parsedFloor);
      } else if (clean.length > 0) {
        const parsedFloor = parseInt(clean[0], 10);
        if (!isNaN(parsedFloor) && parsedFloor > 0) setFloor(parsedFloor);
      }
    }
  };

  const parsedAmenities = typeof room?.amenities === 'string'
    ? JSON.parse(room.amenities || '[]')
    : ALL_AMENITIES;

  const [amenities, setAmenities] = useState<string[]>(parsedAmenities);

  const toggleAmenity = (item: string) => {
    setAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find(b => b.id === selectedBuildingId);
    onSave({
      id: room?.id,
      roomNumber,
      floor: Number(floor) || 1,
      roomName: `Unit ${roomNumber} (${bld?.name || ''})`,
      roomType,
      buildingId: selectedBuildingId,
      buildingName: bld?.name || bld?.code || 'A',
      price: Number(price),
      capacity: Number(capacity),
      sizeSqm: Number(sizeSqm),
      bedType,
      status,
      description,
      amenities: JSON.stringify(amenities),
      coverImage,
    });
    onClose();
  };

  const inputClass = "w-full p-3 bg-nike-soft-cloud dark:bg-nike-dark-card border border-nike-hairline dark:border-nike-dark-card text-nike-ink dark:text-white text-[14px] rounded-xl focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-nike-canvas dark:bg-nike-dark-elevated border border-nike-hairline dark:border-nike-dark-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 rounded-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between border-b border-nike-hairline-soft dark:border-nike-dark-card pb-3">
          <h3 className="text-[18px] font-bold text-nike-ink dark:text-white">
            {room 
              ? (language === 'th' ? `แก้ไขข้อมูลห้อง ${room.roomNumber}` : `Edit Unit ${room.roomNumber}`)
              : (language === 'th' ? 'เพิ่มห้องพักใหม่' : 'Add New Unit')}
          </h3>
          <button onClick={onClose} className="text-nike-mute hover:text-nike-ink dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-[14px]">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
                {language === 'th' ? 'ตึก / อาคาร' : 'Building / Tower'}
              </label>
              <select
                value={selectedBuildingId}
                onChange={e => setSelectedBuildingId(e.target.value)}
                className={inputClass + " appearance-none cursor-pointer font-bold"}
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>
                    {language === 'en' ? (b.name.includes('อาคาร A') ? 'Building A (Victory Tower A)' : b.name.includes('อาคาร B') ? 'Building B (Victory Residence B)' : b.name) : b.name} ({language === 'th' ? 'รหัส' : 'Code'} {b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
                {language === 'th' ? 'เลขห้อง' : 'Unit Number'}
              </label>
              <input 
                type="text" 
                required 
                value={roomNumber} 
                onChange={e => handleRoomNumberChange(e.target.value)} 
                className={inputClass} 
                placeholder={language === 'th' ? 'เช่น 101, 202, A301' : 'e.g. 101, 202, A301'} 
              />
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
                {language === 'th' ? 'ชั้น' : 'Floor'}
              </label>
              <input type="number" required min="1" value={floor} onChange={e => setFloor(Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
                {language === 'th' ? 'ประเภทห้อง' : 'Unit Type'}
              </label>
              <select value={roomType} onChange={e => setRoomType(e.target.value as RoomType)} className={inputClass + " appearance-none cursor-pointer"}>
                <option value="Studio (Single Bed)">Studio (Single Bed)</option>
                <option value="Studio (Double Bed)">Studio (Double Bed)</option>
                <option value="1-Bedroom">1-Bedroom</option>
                <option value="Corner Room">Corner Room</option>
                <option value="Standard Studio">Standard Studio</option>
                <option value="Deluxe Studio">Deluxe Studio</option>
                <option value="1-Bedroom Suite">1-Bedroom Suite</option>
                <option value="Corner Suite">Corner Suite</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
                {language === 'th' ? 'สถานะห้อง' : 'Unit Status'}
              </label>
              <select value={status} onChange={e => setStatus(e.target.value as RoomStatus)} className={inputClass + " appearance-none cursor-pointer font-bold"}>
                <option value="Available">{t('common.available')}</option>
                <option value="Reserved">{t('common.reserved')}</option>
                <option value="Occupied">{t('common.occupied')}</option>
                <option value="Maintenance">{t('common.maintenance')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
                {language === 'th' ? 'ค่าเช่ารายเดือน (บาท)' : 'Monthly Rent (THB)'}
              </label>
              <input type="number" required min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
                {language === 'th' ? 'จำนวนผู้เข้าพัก' : 'Capacity (Guests)'}
              </label>
              <input type="number" required min="1" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
                {language === 'th' ? 'ขนาด (ตร.ม.)' : 'Size (sqm)'}
              </label>
              <input type="number" required min="1" value={sizeSqm} onChange={e => setSizeSqm(Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
              {language === 'th' ? 'ประเภทเตียง' : 'Bed Type'}
            </label>
            <input type="text" required value={bedType} onChange={e => setBedType(e.target.value)} className={inputClass} placeholder="e.g. King Bed" />
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
              {language === 'th' ? 'URL รูปภาพหน้าปก' : 'Cover Image URL'}
            </label>
            <input type="text" required value={coverImage} onChange={e => setCoverImage(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
              {language === 'th' ? 'รายละเอียดเพิ่มเติม' : 'Description'}
            </label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">
              {language === 'th' ? 'สิ่งอำนวยความสะดวก' : 'Amenities'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_AMENITIES.map(item => (
                <label key={item} className="flex items-center gap-2 p-2 bg-nike-soft-cloud dark:bg-nike-dark-card text-[13px] font-medium text-nike-ink dark:text-white cursor-pointer rounded-xl px-3 border border-nike-hairline">
                  <input type="checkbox" checked={amenities.includes(item)} onChange={() => toggleAmenity(item)} className="w-4 h-4" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-nike-hairline-soft dark:border-nike-dark-card">
            <button type="button" onClick={onClose} className="flex-1 border border-nike-hairline text-nike-mute font-medium py-3 rounded-xl hover:text-nike-ink transition-colors">
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button type="submit" className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">
              {language === 'th' ? 'บันทึกข้อมูลห้อง' : 'Save Unit'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
