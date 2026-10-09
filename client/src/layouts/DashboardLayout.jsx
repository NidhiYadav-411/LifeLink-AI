import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLES, ROLE_LABELS } from '@shared/constants/roles.js';
import {
  Activity,
  Heart,
  PlusCircle,
  Clock,
  Shield,
  User,
  Users,
  Building2,
  FileText
} from 'lucide-react';

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case ROLES.DONOR:
        return [
          { to: '/donor/dashboard', label: 'My Dashboard', icon: Activity },
          { to: '/donor/profile', label: 'Donor Profile & Availability', icon: User },
        ];
      case ROLES.PATIENT:
        return [
          { to: '/patient/dashboard', label: 'Patient Dashboard', icon: Activity },
          { to: '/requests/create', label: 'Create Blood Request', icon: PlusCircle },
        ];
      case ROLES.HOSPITAL:
        return [
          { to: '/hospital/dashboard', label: 'Hospital Command Center', icon: Activity },
          { to: '/requests/create', label: 'New Emergency Request', icon: PlusCircle },
        ];
      case ROLES.ADMIN:
        return [
          { to: '/admin/dashboard', label: 'Platform Administration', icon: Shield },
          { to: '/hospital/dashboard', label: 'Hospital View', icon: Building2 },
          { to: '/requests/create', label: 'Create Request', icon: PlusCircle },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-brand-text">
      <Navbar />

      {/* Sub-header navigation tabs */}
      <div className="bg-white border-b border-surface-border sticky top-16 sm:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-coral-500 text-white shadow-sm'
                        : 'text-brand-muted hover:text-coral-600 hover:bg-coral-50/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
