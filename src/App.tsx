import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import { AdminSidebar } from './components/admin/AdminSidebar';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public Pages
import { Home } from './pages/public/Home';
import { Rooms } from './pages/public/Rooms';
import { RoomDetail } from './pages/public/RoomDetail';
import { BookingPage } from './pages/public/BookingPage';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { PaymentPage } from './pages/public/PaymentPage';
import { CheckBookingPage } from './pages/public/CheckBookingPage';
import { ProfilePage } from './pages/public/ProfilePage';



import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BuildingManagement } from './pages/admin/BuildingManagement';
import { TenantManagement } from './pages/admin/TenantManagement';
import { UtilityReceiptManagement } from './pages/admin/UtilityReceiptManagement';
import { MaintenanceManagement } from './pages/admin/MaintenanceManagement';
import { RoomManagement } from './pages/admin/RoomManagement';
import { BookingManagement } from './pages/admin/BookingManagement';
import { ActivityLogList } from './pages/admin/ActivityLogList';
import { NotificationCenter } from './pages/admin/NotificationCenter';

// Protected Route Guard (Strict Admin Check)
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin') {
    toast.error('Access Denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Admin Layout Wrapper
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-nike-dark-surface text-slate-900 dark:text-white overflow-x-hidden">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto w-full max-w-full">
        {children}
      </main>
    </div>
  );
};

// Public Layout Wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-nike-canvas dark:bg-nike-dark-surface text-nike-ink dark:text-white">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/rooms" element={<PublicLayout><Rooms /></PublicLayout>} />
        <Route path="/rooms/:id" element={<PublicLayout><RoomDetail /></PublicLayout>} />
        <Route path="/booking/:roomId" element={<PublicLayout><BookingPage /></PublicLayout>} />
        <Route path="/payment/:bookingId" element={<PublicLayout><PaymentPage /></PublicLayout>} />


        <Route path="/check-booking" element={<PublicLayout><CheckBookingPage /></PublicLayout>} />
        <Route path="/track-booking" element={<PublicLayout><CheckBookingPage /></PublicLayout>} />
        <Route path="/my-bookings" element={<PublicLayout><CheckBookingPage /></PublicLayout>} />
        <Route path="/profile" element={<PublicLayout><ProfilePage /></PublicLayout>} />

        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/signup" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/sign-up" element={<PublicLayout><Register /></PublicLayout>} />

        {/* ADMIN PROTECTED ROUTES */}
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdminRoute>} />
        <Route path="/admin/buildings" element={<ProtectedAdminRoute><AdminLayout><BuildingManagement /></AdminLayout></ProtectedAdminRoute>} />
        <Route path="/admin/tenants" element={<ProtectedAdminRoute><AdminLayout><TenantManagement /></AdminLayout></ProtectedAdminRoute>} />
        <Route path="/admin/utility-bills" element={<ProtectedAdminRoute><AdminLayout><UtilityReceiptManagement /></AdminLayout></ProtectedAdminRoute>} />
        <Route path="/admin/maintenance" element={<ProtectedAdminRoute><AdminLayout><MaintenanceManagement /></AdminLayout></ProtectedAdminRoute>} />
        <Route path="/admin/rooms" element={<ProtectedAdminRoute><AdminLayout><RoomManagement /></AdminLayout></ProtectedAdminRoute>} />
        <Route path="/admin/bookings" element={<ProtectedAdminRoute><AdminLayout><BookingManagement /></AdminLayout></ProtectedAdminRoute>} />
        <Route path="/admin/activity-log" element={<ProtectedAdminRoute><AdminLayout><ActivityLogList /></AdminLayout></ProtectedAdminRoute>} />
        <Route path="/admin/notifications" element={<ProtectedAdminRoute><AdminLayout><NotificationCenter /></AdminLayout></ProtectedAdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
