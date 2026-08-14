import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { loginAdmin, registerApiUser, updateUserProfile } from '../services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (fullname: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (fullname: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('apt_auth_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    return null;
  });

  const role: UserRole = user?.role || 'customer';

  useEffect(() => {
    if (user) {
      localStorage.setItem('apt_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('apt_auth_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> => {
    const result = await loginAdmin(email.trim().toLowerCase(), password.trim());

    if (result.success && result.user) {
      const authUser: User = {
        id: result.user.id,
        fullname: result.user.fullname,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role || 'customer',
      };
      setUser(authUser);
      toast.success(`Welcome back, ${authUser.fullname}`);
      return { success: true, role: authUser.role };
    }

    const err = result.error || 'Invalid email or password.';
    toast.error(err);
    return { success: false, error: err };
  };

  const register = async (fullname: string, email: string, password: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    const result = await registerApiUser(fullname, email, password, phone);

    if (result.success && result.user) {
      const authUser: User = {
        id: result.user.id,
        fullname: result.user.fullname,
        email: result.user.email,
        phone,
        role: 'customer',
      };
      setUser(authUser);
      toast.success(`Account created! Welcome to Victory Apartment, ${fullname}`);
      return { success: true };
    }

    const err = result.error || 'Registration failed.';
    toast.error(err);
    return { success: false, error: err };
  };

  const updateProfile = async (fullname: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No authenticated user' };
    const res = await updateUserProfile(fullname.trim(), user.email, phone?.trim());
    if (res.success && res.user) {
      const updated: User = {
        ...user,
        fullname: res.user.fullname || fullname.trim(),
        phone: res.user.phone || phone?.trim(),
      };
      setUser(updated);
      localStorage.setItem('apt_auth_user', JSON.stringify(updated));
      return { success: true };
    }
    const err = res.error || 'Failed to update profile.';
    toast.error(err);
    return { success: false, error: err };
  };

  const logout = () => {
    setUser(null);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated: Boolean(user),
      login,
      register,
      updateProfile,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
