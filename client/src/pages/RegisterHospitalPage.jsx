import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ROLES } from '@shared/constants/roles.js';
import { Building2, Shield, MapPin, Mail, Lock, Phone, UserCheck } from 'lucide-react';

export default function RegisterHospitalPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '', // Staff contact person
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    hospitalName: '',
    registrationNumber: '',
    city: 'New York',
    address: '',
    contactPhone: '',
    latitude: 40.7527,
    longitude: -73.9772
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
        role: ROLES.HOSPITAL
      });
      navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.message || 'Hospital registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-surface-border p-8 sm:p-10 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 text-white mx-auto flex items-center justify-center shadow-md mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-brand-text">Hospital & Medical Center Registration</h2>
          <p className="text-xs text-brand-muted mt-1">
            Authorize and manage emergency blood broadcasts for your healthcare facility.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Hospital / Clinic Official Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="hospitalName"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="Apex Multi-Speciality Hospital"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">State License / Registration No.</label>
              <div className="relative">
                <Shield className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="HOSP-NY-84920"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">Complete Physical Street Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="450 Lexington Ave, New York, NY 10017"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Authorized Contact Officer Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Dr. Evelyn Stone"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Official Hospital Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="hospital@facility.org"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>{loading ? 'Registering Facility...' : 'Submit Hospital Registration'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-brand-muted">
          Already verified?{' '}
          <Link to="/login" className="text-coral-600 font-bold hover:underline">
            Hospital Login
          </Link>
        </div>

      </div>
    </div>
  );
}
