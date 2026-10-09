import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../modules/requests/requestService.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '@shared/constants/bloodGroups.js';
import { URGENCY_LEVELS } from '@shared/constants/urgencyLevels.js';
import { ROLES } from '@shared/constants/roles.js';
import {
  PlusCircle,
  Building2,
  Droplet,
  Calendar,
  AlertTriangle,
  FileText,
  MapPin,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export default function CreateRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Prepopulate default datetime (e.g. tomorrow)
  const defaultRequiredTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    hospitalName: user?.role === ROLES.HOSPITAL ? (user.profile?.name || user.fullName) : 'Apex Multi-Speciality Hospital',
    requiredBloodGroup: 'O-',
    bloodComponent: BLOOD_COMPONENTS.WHOLE_BLOOD,
    unitsRequired: 2,
    urgencyLevel: URGENCY_LEVELS.CRITICAL,
    requiredDatetime: defaultRequiredTime,
    description: '',
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

    try {
      setLoading(true);
      const res = await requestService.createRequest({
        ...formData,
        unitsRequired: parseInt(formData.unitsRequired, 10)
      });

      if (res && res.request) {
        navigate(`/requests/${res.request.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit blood request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1 text-xs font-bold text-coral-600 hover:text-coral-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-3xl border border-surface-border p-8 sm:p-10 shadow-xl">
        
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 text-white flex items-center justify-center shadow-md">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brand-text">Create Blood Request</h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Initiate an emergency blood requirement for clinical verification and precision donor outreach.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          
          {/* Hospital Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                Hospital / Medical Center Name
              </label>
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
              <label className="block text-xs font-bold text-brand-text mb-1">
                Urgency Level
              </label>
              <select
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-coral-600 focus:ring-2 focus:ring-coral-400 focus:outline-none bg-white"
              >
                <option value={URGENCY_LEVELS.CRITICAL}>Critical (Emergency Immediate)</option>
                <option value={URGENCY_LEVELS.URGENT}>Urgent (Within 24 Hours)</option>
                <option value={URGENCY_LEVELS.NORMAL}>Normal (Scheduled Elective)</option>
              </select>
            </div>
          </div>

          {/* Blood Group & Component & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                Required Blood Group
              </label>
              <select
                name="requiredBloodGroup"
                value={formData.requiredBloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs font-extrabold text-coral-600 focus:ring-2 focus:ring-coral-400 focus:outline-none bg-white"
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                Blood Component
              </label>
              <select
                name="bloodComponent"
                value={formData.bloodComponent}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none bg-white"
              >
                {Object.values(BLOOD_COMPONENTS).map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">
                Units Required
              </label>
              <input
                type="number"
                name="unitsRequired"
                min="1"
                max="20"
                required
                value={formData.unitsRequired}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs font-bold focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Required DateTime */}
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              Required By Date & Time
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="datetime-local"
                name="requiredDatetime"
                required
                value={formData.requiredDatetime}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Clinical description */}
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1">
              Clinical Notes / Diagnosis Context
            </label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Acute trauma case in ICU requiring immediate emergency O- reserve. Crossmatch sample prepared."
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none"
            />
          </div>

          {/* Security & Verification Notice */}
          <div className="p-4 rounded-2xl bg-coral-50/70 border border-surface-border text-xs space-y-1">
            <p className="font-bold text-coral-900">LifeLink Authorization Note</p>
            <p className="text-brand-muted">
              {user?.role === ROLES.HOSPITAL
                ? 'As a certified hospital partner, submitting this request will immediately mark it Verified and activate matching algorithms.'
                : 'Patient submissions will be marked "Pending Verification" until certified by hospital staff.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Droplet className="w-4 h-4 fill-current" />
              <span>{loading ? 'Submitting Emergency Request...' : 'Publish Blood Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
