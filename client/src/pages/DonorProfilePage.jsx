import React, { useState, useEffect } from 'react';
import { donorService } from '../modules/donors/donorService.js';
import { BLOOD_GROUPS } from '@shared/constants/bloodGroups.js';
import {
  User,
  Heart,
  MapPin,
  Calendar,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DonorProfilePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bloodGroup: 'O+',
    city: '',
    latitude: 40.75,
    longitude: -73.98,
    lastDonationDate: '',
    medicalNotes: ''
  });

  const [eligibilityStatus, setEligibilityStatus] = useState('ELIGIBLE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await donorService.getProfile();
        if (res && res.profile) {
          const p = res.profile;
          setFormData({
            fullName: p.full_name || '',
            phone: p.phone || '',
            bloodGroup: p.blood_group || 'O+',
            city: p.city || '',
            latitude: p.latitude || 40.75,
            longitude: p.longitude || -73.98,
            lastDonationDate: p.last_donation_date || '',
            medicalNotes: p.medical_notes || ''
          });
          setEligibilityStatus(p.medical_eligibility_status || 'ELIGIBLE');
        }
      } catch (err) {
        console.error('Failed to load donor profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      setSaving(true);
      await donorService.updateProfile(formData);
      setMessage({ type: 'success', text: 'Donor profile updated successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-brand-muted">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-10 shadow-sm">
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 text-white flex items-center justify-center shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brand-text">Donor Profile & Medical Registry</h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Keep your location and donation availability accurate to receive matching emergency broadcasts.
            </p>
          </div>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-sm font-black">&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Full Legal Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs font-extrabold text-coral-600 focus:ring-2 focus:ring-coral-400 focus:outline-none bg-white"
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">City / Approximate Zone</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Last Donation Date</label>
              <input
                type="date"
                name="lastDonationDate"
                value={formData.lastDonationDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Clinical Eligibility Review</label>
              <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-brand-text">{eligibilityStatus}</span>
                <span className="text-[10px] text-brand-muted">(Managed by Clinical Staff)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              Medical Notes / Health Disclosures (Optional)
            </label>
            <textarea
              rows="2"
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              placeholder="e.g. Completed routine health check; no travel restrictions."
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
            />
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="p-4 rounded-2xl bg-coral-50/70 border border-surface-border flex items-start space-x-3 text-xs">
            <Lock className="w-5 h-5 text-coral-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-coral-900">Privacy & Confidentiality Protected</p>
              <p className="text-brand-muted">
                Your phone number and exact street address are never made public. Only verified hospitals receive authorized contact permissions when you explicitly accept a blood request.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
