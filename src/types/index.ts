export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  fullname: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  created_at?: string;
}

export type RoomType = 'Studio (Single Bed)' | 'Studio (Double Bed)' | '1-Bedroom' | 'Corner Room' | 'Standard Studio' | 'Deluxe Studio' | '1-Bedroom Suite' | 'Corner Suite';
export type RoomStatus = 'Available' | 'Reserved' | 'Occupied' | 'Maintenance';

export interface Building {
  id: string;
  name: string;
  code: string;
  floors: number;
  totalRooms: number;
  description?: string;
  coverImage?: string;
  address?: string;
  createdAt?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  roomName: string;
  roomType: RoomType;
  description: string;
  capacity: number;
  price: number;
  status: RoomStatus;
  amenities: string;
  sizeSqm: number;
  bedType: string;
  coverImage?: string;
  gallery?: string;
  buildingId?: string;
  buildingName?: string;
  currentTenantId?: string;
  currentTenantName?: string;
  prevWaterMeter?: number;
  currWaterMeter?: number;
  prevElectricMeter?: number;
  currElectricMeter?: number;
  createdAt?: string;
}

// ----------------------------------------------------------------------
// APARTMENT MANAGEMENT SPECIFIC TYPES
// ----------------------------------------------------------------------

export type BillingCycle = 'monthly' | 'yearly';

export interface Tenant {
  id: string;
  fullname: string;
  phone: string;
  email: string;
  idCardPassport: string;
  emergencyContact: string;
  unitId?: string;
  unitNumber?: string;
  createdAt: string;
}

export type LeaseStatus = 'Active' | 'Terminated' | 'Expired';

export interface Lease {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  roomId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  rentAmount: number;
  billingCycle: BillingCycle;
  depositAmount: number;
  status: LeaseStatus;
  notes?: string;
  createdAt: string;
}

export type BillStatus = 'Pending' | 'Paid';

export interface UtilityBill {
  id: string;
  invoiceNo: string;
  leaseId: string;
  roomId: string;
  roomNumber: string;
  buildingName?: string;
  tenantName?: string;
  billingMonth: string;
  rentAmount: number;
  prevWaterMeter: number;
  currWaterMeter: number;
  waterRate: number;
  waterAmount: number;
  prevElectricMeter: number;
  currElectricMeter: number;
  electricRate: number;
  electricAmount: number;
  commonFee: number;
  totalAmount: number;
  status: BillStatus;
  paymentDate?: string;
  slipImage?: string;
  createdAt: string;
}

export type MaintenanceCategory = 'Light bulb replacement' | 'Air-con servicing' | 'Plumbing' | 'Electrical' | 'General Repair';
export type MaintenancePriority = 'Low' | 'Medium' | 'High';
export type MaintenanceTaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type ReminderFrequency = 'None' | 'Monthly' | 'Quarterly' | 'Every 6 Months' | 'Yearly';
export type OccupancyMaintenanceType = 'Occupied' | 'Vacant/Common';

export interface SupplyUsage {
  supply_id: string;
  name: string;
  quantity: number;
  unit_cost: number;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  unitCost: number;
  unitName: string;
}

export interface MaintenanceTask {
  id: string;
  taskNo: string;
  roomId: string;
  roomNumber: string;
  buildingName?: string;
  occupancyType: OccupancyMaintenanceType;
  category: MaintenanceCategory;
  description: string;
  reportedDate: string;
  dueDate: string;
  priority: MaintenancePriority;
  status: MaintenanceTaskStatus;
  assignedWorker: string;
  suppliesUsed: string; // JSON string from backend
  laborCost: number;
  totalCost: number;
  recurringReminder: ReminderFrequency;
  createdAt: string;
  completedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  roomId: string;
  roomNumber: string;
  date: string;
  taskNo: string;
  category: MaintenanceCategory;
  description: string;
  suppliesSummary: string;
  totalCost: number;
  performedBy: string;
}

export interface ScheduledReminder {
  id: string;
  title: string;
  category: MaintenanceCategory;
  roomId?: string;
  roomNumber?: string;
  frequency: ReminderFrequency;
  lastTriggered?: string;
  nextDueDate: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  bookingNo: string;
  roomId: string;
  roomNumber?: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  specialRequests?: string;
  status: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  details: string;
  createdAt: string;
}
