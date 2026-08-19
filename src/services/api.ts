import {
  Room, Tenant, Lease, UtilityBill, BillStatus, MaintenanceTask, SupplyItem,
  MaintenanceLog, ScheduledReminder, AppNotification, ActivityLog, Booking, Building
} from '../types';

const API_BASE = '/api';

// Initial Mock Data for Local Fallback
const MOCK_BUILDINGS: Building[] = [
  {
    id: 'bld-1',
    name: 'อาคาร A (Victory Tower A)',
    code: 'A',
    floors: 2,
    totalRooms: 24,
    address: '123/1 ถนนสุขุมวิท กรุงเทพฯ',
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-01-01'
  },
  {
    id: 'bld-2',
    name: 'อาคาร B (Victory Residence B)',
    code: 'B',
    floors: 2,
    totalRooms: 12,
    address: '123/2 ถนนสุขุมวิท กรุงเทพฯ',
    coverImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-02-15'
  }
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.error || error.message || res.statusText);
  }
  return res.json();
}

// ----------------------------------------------------
// BUILDINGS API
// ----------------------------------------------------
export const getBuildings = async (): Promise<Building[]> => {
  try {
    return await fetchJson<Building[]>(`${API_BASE}/buildings`);
  } catch {
    return getStored<Building[]>('apartment_buildings', MOCK_BUILDINGS);
  }
};

export const saveBuilding = async (buildingData: Partial<Building>): Promise<Building> => {
  try {
    if (buildingData.id) {
      return await fetchJson<Building>(`${API_BASE}/buildings/${buildingData.id}`, {
        method: 'PUT',
        body: JSON.stringify(buildingData),
      });
    }
    return await fetchJson<Building>(`${API_BASE}/buildings`, {
      method: 'POST',
      body: JSON.stringify(buildingData),
    });
  } catch {
    const list = getStored<Building[]>('apartment_buildings', MOCK_BUILDINGS);
    let updated: Building;
    if (buildingData.id) {
      const idx = list.findIndex(b => b.id === buildingData.id);
      updated = { ...list[idx], ...buildingData } as Building;
      if (idx !== -1) list[idx] = updated;
    } else {
      updated = {
        id: `bld-${Date.now()}`,
        name: buildingData.name || 'อาคารใหม่',
        code: buildingData.code || 'C',
        floors: buildingData.floors || 5,
        totalRooms: buildingData.totalRooms || 20,
        description: buildingData.description || '',
        coverImage: buildingData.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        createdAt: new Date().toISOString().split('T')[0]
      };
      list.push(updated);
    }
    setStored('apartment_buildings', list);
    return updated;
  }
};

export const deleteBuilding = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/buildings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete building on server');
  } catch (err) {
    console.warn('Backend delete failed, removing locally:', err);
  } finally {
    const list = getStored<Building[]>('apartment_buildings', MOCK_BUILDINGS);
    const filtered = list.filter(b => b.id !== id);
    setStored('apartment_buildings', filtered);
  }
};

// ----------------------------------------------------
// ROOMS / APARTMENT UNITS API
// ----------------------------------------------------
export const getRooms = async (): Promise<Room[]> => {
  return fetchJson<Room[]>(`${API_BASE}/rooms`);
};

export const getRoomById = async (id: string): Promise<Room | null> => {
  try {
    return await fetchJson<Room>(`${API_BASE}/rooms/${id}`);
  } catch {
    return null;
  }
};

export const saveRoom = async (roomData: Partial<Room>): Promise<Room> => {
  if (roomData.id) {
    return fetchJson<Room>(`${API_BASE}/rooms/${roomData.id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  }
  return fetchJson<Room>(`${API_BASE}/rooms`, {
    method: 'POST',
    body: JSON.stringify(roomData),
  });
};

export const deleteRoom = async (id: string): Promise<void> => {
  await fetch(`${API_BASE}/rooms/${id}`, { method: 'DELETE' });
};

// ----------------------------------------------------
// TENANTS API
// ----------------------------------------------------
export const getTenants = async (): Promise<Tenant[]> => {
  return fetchJson<Tenant[]>(`${API_BASE}/tenants`);
};

export const saveTenant = async (tenantData: Partial<Tenant>): Promise<Tenant> => {
  if (tenantData.id) {
    return fetchJson<Tenant>(`${API_BASE}/tenants/${tenantData.id}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    });
  }
  return fetchJson<Tenant>(`${API_BASE}/tenants`, {
    method: 'POST',
    body: JSON.stringify(tenantData),
  });
};

export const deleteTenant = async (id: string): Promise<void> => {
  await fetch(`${API_BASE}/tenants/${id}`, { method: 'DELETE' });
};

// ----------------------------------------------------
// LEASES & OCCUPANCY CONFLICT PREVENTION API
// ----------------------------------------------------
export const getLeases = async (): Promise<Lease[]> => {
  return fetchJson<Lease[]>(`${API_BASE}/leases`);
};

export const checkLeaseConflict = async (
  roomId: string,
  startDate: string,
  endDate: string,
  excludeLeaseId?: string
): Promise<{ hasConflict: boolean; conflictingLease?: Lease }> => {
  return fetchJson(`${API_BASE}/leases/check-conflict`, {
    method: 'POST',
    body: JSON.stringify({ roomId, startDate, endDate, excludeLeaseId }),
  });
};

export const saveLease = async (leaseData: Partial<Lease>): Promise<{ success: boolean; lease?: Lease; message?: string }> => {
  const method = leaseData.id ? 'PUT' : 'POST';
  const url = leaseData.id ? `${API_BASE}/leases/${leaseData.id}` : `${API_BASE}/leases`;

  try {
    const result = await fetchJson<{ success: boolean; lease?: Lease; message?: string }>(url, {
      method,
      body: JSON.stringify(leaseData),
    });
    return result;
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to save lease' };
  }
};

export const terminateLease = async (leaseId: string): Promise<void> => {
  await fetch(`${API_BASE}/leases/${leaseId}/terminate`, { method: 'PUT' });
};

// ----------------------------------------------------
// UTILITY BILLS & RECEIPT API
// ----------------------------------------------------
export const getUtilityBills = async (): Promise<UtilityBill[]> => {
  return fetchJson<UtilityBill[]>(`${API_BASE}/utility-bills`);
};

export const saveUtilityBill = async (billData: Partial<UtilityBill>): Promise<UtilityBill> => {
  if (billData.id) {
    return fetchJson<UtilityBill>(`${API_BASE}/utility-bills/${billData.id}`, {
      method: 'PUT',
      body: JSON.stringify(billData),
    });
  }
  return fetchJson<UtilityBill>(`${API_BASE}/utility-bills`, {
    method: 'POST',
    body: JSON.stringify(billData),
  });
};

export const updateBillStatus = async (billId: string, status: BillStatus, slipImage?: string): Promise<UtilityBill | null> => {
  try {
    return await fetchJson<UtilityBill>(`${API_BASE}/utility-bills/${billId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, slipImage }),
    });
  } catch {
    return null;
  }
};

// ----------------------------------------------------
// MAINTENANCE TASKS & SUPPLY USAGE API
// ----------------------------------------------------
export const getMaintenanceTasks = async (): Promise<MaintenanceTask[]> => {
  return fetchJson<MaintenanceTask[]>(`${API_BASE}/maintenance-tasks`);
};

export const getUserMaintenanceTasks = async (email: string): Promise<MaintenanceTask[]> => {
  return fetchJson<MaintenanceTask[]>(`${API_BASE}/maintenance-tasks/user/${encodeURIComponent(email)}`);
};

export const saveMaintenanceTask = async (taskData: Partial<MaintenanceTask>): Promise<MaintenanceTask> => {
  if (taskData.id) {
    return fetchJson<MaintenanceTask>(`${API_BASE}/maintenance-tasks/${taskData.id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }
  return fetchJson<MaintenanceTask>(`${API_BASE}/maintenance-tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

export const deleteMaintenanceTask = async (id: string): Promise<void> => {
  await fetchJson<void>(`${API_BASE}/maintenance-tasks/${id}`, {
    method: 'DELETE',
  });
};

// ----------------------------------------------------
// SUPPLIES API
// ----------------------------------------------------
export const getSupplies = async (): Promise<SupplyItem[]> => {
  return fetchJson<SupplyItem[]>(`${API_BASE}/supplies`);
};

export const saveSupply = async (supplyData: Partial<SupplyItem>): Promise<SupplyItem> => {
  if (supplyData.id) {
    return fetchJson<SupplyItem>(`${API_BASE}/supplies/${supplyData.id}`, {
      method: 'PUT',
      body: JSON.stringify(supplyData),
    });
  }
  return fetchJson<SupplyItem>(`${API_BASE}/supplies`, {
    method: 'POST',
    body: JSON.stringify(supplyData),
  });
};

// ----------------------------------------------------
// MAINTENANCE LOGS API (PER-UNIT HISTORY)
// ----------------------------------------------------
export const getMaintenanceLogs = async (roomId?: string): Promise<MaintenanceLog[]> => {
  const url = roomId ? `${API_BASE}/maintenance-logs?roomId=${roomId}` : `${API_BASE}/maintenance-logs`;
  return fetchJson<MaintenanceLog[]>(url);
};

export const saveMaintenanceLog = async (logData: Partial<MaintenanceLog>): Promise<MaintenanceLog> => {
  if (logData.id) {
    return fetchJson<MaintenanceLog>(`${API_BASE}/maintenance-logs/${logData.id}`, {
      method: 'PUT',
      body: JSON.stringify(logData),
    });
  }
  return fetchJson<MaintenanceLog>(`${API_BASE}/maintenance-logs`, {
    method: 'POST',
    body: JSON.stringify(logData),
  });
};

export const deleteMaintenanceLog = async (id: string): Promise<void> => {
  await fetchJson<void>(`${API_BASE}/maintenance-logs/${id}`, {
    method: 'DELETE',
  });
};

// ----------------------------------------------------
// SCHEDULED REMINDERS API
// ----------------------------------------------------
export const getReminders = async (): Promise<ScheduledReminder[]> => {
  return fetchJson<ScheduledReminder[]>(`${API_BASE}/reminders`);
};

export const saveReminder = async (reminderData: Partial<ScheduledReminder>): Promise<ScheduledReminder> => {
  if (reminderData.id) {
    return fetchJson<ScheduledReminder>(`${API_BASE}/reminders/${reminderData.id}`, {
      method: 'PUT',
      body: JSON.stringify(reminderData),
    });
  }
  return fetchJson<ScheduledReminder>(`${API_BASE}/reminders`, {
    method: 'POST',
    body: JSON.stringify(reminderData),
  });
};

export const toggleReminder = async (id: string): Promise<ScheduledReminder | null> => {
  try {
    return await fetchJson<ScheduledReminder>(`${API_BASE}/reminders/${id}/toggle`, { method: 'PUT' });
  } catch {
    return null;
  }
};

// ----------------------------------------------------
// BOOKINGS API (PUBLIC BOOKING REQUESTS)
// ----------------------------------------------------
export const getBookings = async (): Promise<Booking[]> => {
  return fetchJson<Booking[]>(`${API_BASE}/bookings`);
};

export const getUserBookings = async (email: string): Promise<Booking[]> => {
  return fetchJson<Booking[]>(`${API_BASE}/bookings/user/${encodeURIComponent(email)}`);
};

export const createBooking = async (bookingData: Partial<Booking>): Promise<Booking> => {
  return fetchJson<Booking>(`${API_BASE}/bookings`, {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

export const updateBookingStatus = async (bookingId: string, status: string): Promise<Booking | null> => {
  try {
    return await fetchJson<Booking>(`${API_BASE}/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  } catch {
    return null;
  }
};

export const cancelBooking = async (bookingId: string): Promise<Booking | null> => {
  try {
    return await fetchJson<Booking>(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  } catch {
    return null;
  }
};

export const trackBookings = async (query: string): Promise<Booking[]> => {
  return fetchJson<Booking[]>(`${API_BASE}/bookings/track?query=${encodeURIComponent(query)}`);
};


// ----------------------------------------------------
// NOTIFICATIONS API
// ----------------------------------------------------
export const getNotifications = async (): Promise<AppNotification[]> => {
  return fetchJson<AppNotification[]>(`${API_BASE}/notifications`);
};

export const addNotification = async (notif: Partial<AppNotification>): Promise<AppNotification> => {
  return fetchJson<AppNotification>(`${API_BASE}/notifications`, {
    method: 'POST',
    body: JSON.stringify(notif),
  });
};

export const markNotificationsRead = async (): Promise<void> => {
  await fetch(`${API_BASE}/notifications/mark-read`, { method: 'PUT' });
};

export const markNotificationAsRead = async (id: string): Promise<AppNotification | void> => {
  try {
    return await fetchJson<AppNotification>(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
    });
  } catch (err) {
    console.warn('Backend mark-read failed, updating locally:', err);
    const list = getStored<AppNotification[]>('apartment_notifications', []);
    const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
    setStored('apartment_notifications', updated);
  }
};

export const deleteNotification = async (id: string): Promise<void> => {
  try {
    await fetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Backend delete notification failed:', err);
  }
};

// ----------------------------------------------------
// ACTIVITY LOGS API
// ----------------------------------------------------
export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  return fetchJson<ActivityLog[]>(`${API_BASE}/activity-logs`);
};

// ----------------------------------------------------
// AUTH API
// ----------------------------------------------------
export const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    return await fetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed' };
  }
};

export const registerApiUser = async (fullname: string, email: string, password: string, phone?: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    return await fetchJson(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ fullname, email, password, phone }),
    });
  } catch (err: any) {
    return { success: false, error: err.message || 'Registration failed' };
  }
};

export const updateUserProfile = async (fullname: string, email: string, phone?: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    return await fetchJson(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify({ fullname, email, phone }),
    });
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update profile' };
  }
};
