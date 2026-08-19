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

// Public Pages (Home loaded directly for immediate first paint, rest lazy-loaded)
import { Home } from './pages/public/Home';
const Rooms = React.lazy(() => import('./pages/public/Rooms').then(m => ({ default: m.Rooms })));
const RoomDetail = React.lazy(() => import('./pages/public/RoomDetail').then(m => ({ default: m.RoomDetail })));
const BookingPage = React.lazy(() => import('./pages/public/BookingPage').then(m => ({ default: m.BookingPage })));
const Login = React.lazy(() => import('./pages/public/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/public/Register').then(m => ({ default: m.Register })));
const PaymentPage = React.lazy(() => import('./pages/public/PaymentPage').then(m => ({ default: m.PaymentPage })));
const CheckBookingPage = React.lazy(() => import('./pages/public/CheckBookingPage').then(m => ({ default: m.CheckBookingPage })));
const ProfilePage = React.lazy(() => import('./pages/public/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ResidentMaintenancePage = React.lazy(() => import('./pages/public/ResidentMaintenancePage').then(m => ({ default: m.ResidentMaintenancePage })));
const MyApartmentPage = React.lazy(() => import('./pages/public/MyApartmentPage').then(m => ({ default: m.MyApartmentPage })));

// Admin Pages (Lazy loaded on demand)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const BuildingManagement = React.lazy(() => import('./pages/admin/BuildingManagement').then(m => ({ default: m.BuildingManagement })));
const TenantManagement = React.lazy(() => import('./pages/admin/TenantManagement').then(m => ({ default: m.TenantManagement })));
const UtilityReceiptManagement = React.lazy(() => import('./pages/admin/UtilityReceiptManagement').then(m => ({ default: m.UtilityReceiptManagement })));
const MaintenanceManagement = React.lazy(() => import('./pages/admin/MaintenanceManagement').then(m => ({ default: m.MaintenanceManagement })));
const RoomManagement = React.lazy(() => import('./pages/admin/RoomManagement').then(m => ({ default: m.RoomManagement })));
const BookingManagement = React.lazy(() => import('./pages/admin/BookingManagement').then(m => ({ default: m.BookingManagement })));
const ActivityLogList = React.lazy(() => import('./pages/admin/ActivityLogList').then(m => ({ default: m.ActivityLogList })));
const NotificationCenter = React.lazy(() => import('./pages/admin/NotificationCenter').then(m => ({ default: m.NotificationCenter })));

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
    <div className="min-h-screen bg-slate-50 dark:bg-nike-dark-surface text-slate-900 dark:text-white relative">
      <AdminSidebar />
      <main className="md:ml-64 p-4 sm:p-6 md:p-10 min-h-screen">
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
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '16px',
            padding: '14px 18px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
          },
        }}
      />
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-nike-canvas dark:bg-nike-dark-surface">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-nike-ink/20 dark:border-white/20 border-t-nike-ink dark:border-t-white rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-nike-mute dark:text-nike-stone">กำลังโหลด...</span>
            </div>
          </div>
        }
      >
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
          <Route path="/my-apartment" element={<PublicLayout><MyApartmentPage /></PublicLayout>} />
          <Route path="/my-maintenance" element={<PublicLayout><ResidentMaintenancePage /></PublicLayout>} />
          <Route path="/resident/maintenance" element={<PublicLayout><ResidentMaintenancePage /></PublicLayout>} />
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
      </React.Suspense>
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
