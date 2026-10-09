import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import NotificationBell from './NotificationBell.jsx';
import { Heart, Activity, User, LogOut, Menu, X, ShieldAlert, PlusCircle } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '@shared/constants/roles.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicLanding = location.pathname === '/';

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === ROLES.DONOR) return '/donor/dashboard';
    if (user.role === ROLES.HOSPITAL) return '/hospital/dashboard';
    if (user.role === ROLES.PATIENT) return '/patient/dashboard';
    if (user.role === ROLES.ADMIN) return '/admin/dashboard';
    return '/';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`${isPublicLanding ? 'bg-coral-500 text-white shadow-md' : 'bg-white text-brand-text border-b border-surface-border sticky top-0 z-40'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
              isPublicLanding ? 'bg-white text-coral-500' : 'bg-coral-500 text-white'
            }`}>
              <Heart className="w-6 h-6 fill-current animate-pulse-subtle" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isPublicLanding ? 'text-white' : 'text-coral-500'}`}>
                LifeLink <span className={isPublicLanding ? 'text-coral-100 font-semibold text-lg' : 'text-brand-text font-semibold text-lg'}>AI</span>
              </span>
              <span className={`text-[10px] tracking-wider uppercase font-medium -mt-1 ${isPublicLanding ? 'text-coral-100' : 'text-brand-muted'}`}>
                Emergency Blood Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:opacity-80 ${
                isPublicLanding ? 'text-white' : 'text-brand-text hover:text-coral-500'
              }`}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className={`text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                    isPublicLanding
                      ? 'text-white bg-coral-600 px-3 py-1.5 rounded-lg'
                      : 'text-coral-600 bg-coral-50 px-3 py-1.5 rounded-lg border border-surface-border'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {(user.role === ROLES.PATIENT || user.role === ROLES.HOSPITAL || user.role === ROLES.ADMIN) && (
                  <Link
                    to="/requests/create"
                    className="text-sm font-semibold flex items-center space-x-1 text-white bg-coral-500 hover:bg-coral-600 px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Blood Request</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3 border-l pl-4 border-surface-border">
                  <NotificationBell isLanding={isPublicLanding} />

                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isPublicLanding ? 'bg-white text-coral-600' : 'bg-coral-100 text-coral-700'
                    }`}>
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`text-xs font-bold leading-tight ${isPublicLanding ? 'text-white' : 'text-brand-text'}`}>
                        {user.fullName}
                      </span>
                      <span className={`text-[10px] font-semibold ${isPublicLanding ? 'text-coral-100' : 'text-coral-500'}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className={`p-1.5 rounded-lg transition-colors ${
                      isPublicLanding ? 'hover:bg-coral-600 text-white' : 'hover:bg-gray-100 text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                    isPublicLanding
                      ? 'text-white hover:bg-coral-600 border border-white/40'
                      : 'text-coral-500 hover:bg-coral-50 border border-surface-border'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/register/donor"
                  className={`text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all ${
                    isPublicLanding
                      ? 'bg-white text-coral-500 hover:bg-coral-50'
                      : 'bg-coral-500 text-white hover:bg-coral-600'
                  }`}
                >
                  Donate Blood
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationBell isLanding={isPublicLanding} />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg focus:outline-none ${
                isPublicLanding ? 'text-white hover:bg-coral-600' : 'text-brand-text hover:bg-coral-50'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-4 pt-2 pb-6 space-y-3 ${
          isPublicLanding ? 'bg-coral-600 text-white' : 'bg-white border-b border-surface-border shadow-lg'
        }`}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-coral-300"
              >
                Dashboard ({ROLE_LABELS[user.role]})
              </Link>
              {(user.role === ROLES.PATIENT || user.role === ROLES.HOSPITAL || user.role === ROLES.ADMIN) && (
                <Link
                  to="/requests/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold"
                >
                  + Create Blood Request
                </Link>
              )}
              {user.role === ROLES.DONOR && (
                <Link
                  to="/donor/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium"
                >
                  My Donor Profile
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-sm font-semibold text-red-300 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-white/20 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg border border-white/30 text-sm font-semibold"
              >
                Log In
              </Link>
              <Link
                to="/register/donor"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg bg-white text-coral-500 text-sm font-bold shadow-sm"
              >
                Register as Donor
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
