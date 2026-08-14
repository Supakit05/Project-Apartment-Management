import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Room, RoomType, RoomStatus } from '../../types';

interface RoomModalProps {
  room?: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: Partial<Room>) => void;
}

const ALL_AMENITIES = [
  'Wi-Fi', 'Air Conditioner', 'Water Heater', 'Balcony',
  'Keycard Access', 'Refrigerator', 'Parking', 'CCTV'
];

export const RoomModal: React.FC<RoomModalProps> = ({ room, isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  const [roomNumber, setRoomNumber] = useState(room?.roomNumber || '');
  const [roomName, setRoomName] = useState(room?.roomName || '');
  const [roomType, setRoomType] = useState<RoomType>(room?.roomType || 'Standard Studio');
  const [price, setPrice] = useState(room?.price || 5500);
  const [capacity, setCapacity] = useState(room?.capacity || 2);
  const [sizeSqm, setSizeSqm] = useState(room?.sizeSqm || 28);
  const [bedType, setBedType] = useState(room?.bedType || 'King Bed');
  const [status, setStatus] = useState<RoomStatus>(room?.status || 'Available');
  const [description, setDescription] = useState(room?.description || '');
  const [coverImage, setCoverImage] = useState(room?.coverImage || '/rooms/room_standard.png');

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
    onSave({
      id: room?.id,
      roomNumber,
      roomName,
      roomType,
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
            {room ? `Edit Unit ${room.roomNumber}` : 'Add New Unit'}
          </h3>
          <button onClick={onClose} className="text-nike-mute hover:text-nike-ink dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-[14px]">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Unit Number</label>
              <input type="text" required value={roomNumber} onChange={e => setRoomNumber(e.target.value)} className={inputClass} placeholder="101" />
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Room Type</label>
              <select value={roomType} onChange={e => setRoomType(e.target.value as RoomType)} className={inputClass + " appearance-none cursor-pointer"}>
                <option value="Studio (Single Bed)">Studio (Single Bed)</option>
                <option value="Studio (Double Bed)">Studio (Double Bed)</option>
                <option value="1-Bedroom">1-Bedroom</option>
                <option value="Corner Room">Corner Room</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as RoomStatus)} className={inputClass + " appearance-none cursor-pointer"}>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Unit Name</label>
            <input type="text" required value={roomName} onChange={e => setRoomName(e.target.value)} className={inputClass} placeholder="e.g. Unit 101 (Studio - Single Bed)" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Monthly Rent (THB)</label>
              <input type="number" required min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Capacity (Guests)</label>
              <input type="number" required min="1" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Size (m²)</label>
              <input type="number" required min="1" value={sizeSqm} onChange={e => setSizeSqm(Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Bed Type</label>
            <input type="text" required value={bedType} onChange={e => setBedType(e.target.value)} className={inputClass} placeholder="e.g. King Bed" />
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Cover Image URL</label>
            <input type="text" required value={coverImage} onChange={e => setCoverImage(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Description</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-nike-ink dark:text-white">Amenities</label>
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
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Save Unit
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
