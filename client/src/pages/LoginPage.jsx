import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLES } from '@shared/constants/roles.js';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, Building2, User, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await login(email, password);
      
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Role specific redirection
      if (res.user.role === ROLES.DONOR) navigate('/donor/dashboard');
      else if (res.user.role === ROLES.HOSPITAL) navigate('/hospital/dashboard');
      else if (res.user.role === ROLES.PATIENT) navigate('/patient/dashboard');
      else if (res.user.role === ROLES.ADMIN) navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-surface-border p-8 sm:p-10 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 text-white mx-auto flex items-center justify-center shadow-md mb-3">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-brand-text">Welcome to LifeLink AI</h2>
          <p className="text-xs text-brand-muted mt-1">
            Sign in to access your dashboard and manage blood requests.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Panel */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[11px] font-bold text-coral-800 uppercase tracking-wider mb-2 text-center">
            Instant Demo Logins (Click to Autofill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('donor@lifelink.ai', 'Donor@123')}
              className="p-2 rounded-xl bg-coral-50 hover:bg-coral-100 text-coral-700 font-semibold border border-surface-border text-left flex items-center space-x-1.5 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-coral-500 shrink-0" />
              <div className="truncate">
                <p className="font-bold text-[11px]">Donor (O-)</p>
                <p className="text-[10px] text-gray-500">Alex Rivera</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('hospital@lifelink.ai', 'Hospital@123')}
              className="p-2 rounded-xl bg-coral-50 hover:bg-coral-100 text-coral-700 font-semibold border border-surface-border text-left flex items-center space-x-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-coral-500 shrink-0" />
              <div className="truncate">
                <p className="font-bold text-[11px]">Hospital Staff</p>
                <p className="text-[10px] text-gray-500">Apex Hospital</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('patient@lifelink.ai', 'Patient@123')}
              className="p-2 rounded-xl bg-coral-50 hover:bg-coral-100 text-coral-700 font-semibold border border-surface-border text-left flex items-center space-x-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-coral-500 shrink-0" />
              <div className="truncate">
                <p className="font-bold text-[11px]">Patient Family</p>
                <p className="text-[10px] text-gray-500">John Anderson</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('admin@lifelink.ai', 'Admin@123')}
              className="p-2 rounded-xl bg-coral-50 hover:bg-coral-100 text-coral-700 font-semibold border border-surface-border text-left flex items-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-coral-500 shrink-0" />
              <div className="truncate">
                <p className="font-bold text-[11px]">System Admin</p>
                <p className="text-[10px] text-gray-500">Full Access</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-brand-muted">
          Need a new account?{' '}
          <Link to="/register/donor" className="text-coral-600 font-bold hover:underline">
            Register as Donor
          </Link>
          {' '}&bull;{' '}
          <Link to="/register/hospital" className="text-coral-600 font-bold hover:underline">
            Hospital
          </Link>
        </div>

      </div>
    </div>
  );
}
