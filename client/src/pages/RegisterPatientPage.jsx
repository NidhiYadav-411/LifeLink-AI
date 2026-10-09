import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLES } from '@shared/constants/roles.js';
import { User, Mail, Lock, Phone, HeartHandshake } from 'lucide-react';

export default function RegisterPatientPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        role: ROLES.PATIENT
      });
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-surface-border p-8 sm:p-10 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 text-white mx-auto flex items-center justify-center shadow-md mb-3">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-brand-text">Patient & Family Registration</h2>
          <p className="text-xs text-brand-muted mt-1">
            Submit emergency blood requests and track matching donors in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. John Anderson"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">Primary Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1-555-0144"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Register Patient Account'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-brand-muted">
          Already registered?{' '}
          <Link to="/login" className="text-coral-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
