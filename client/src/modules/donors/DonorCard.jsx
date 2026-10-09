import React from 'react';
import { Heart, MapPin, Calendar, CheckCircle2, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function DonorCard({ profile, onToggleAvailability, toggling = false }) {
  if (!profile) return null;

  const isAvail = profile.is_available === 1 || profile.is_available === true;

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-coral-500 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-coral-200">
            {profile.blood_group}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-brand-text">{profile.full_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{profile.medical_eligibility_status || 'ELIGIBLE'}</span>
              </span>
            </div>
            <p className="text-xs text-brand-muted mt-0.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-coral-500" />
              <span>{profile.city} &bull; Verified Donor Account</span>
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="bg-coral-50/70 p-3 rounded-2xl border border-surface-border flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs font-bold text-coral-900">
              {isAvail ? 'Available to Donate' : 'Temporarily Inactive'}
            </p>
            <p className="text-[11px] text-brand-muted">
              {isAvail ? 'Accepting emergency matches' : 'Paused for recovery/travel'}
            </p>
          </div>
          <button
            onClick={() => onToggleAvailability(!isAvail)}
            disabled={toggling}
            className={`p-1 transition-transform ${isAvail ? 'text-coral-500 hover:scale-110' : 'text-gray-400 hover:scale-110'}`}
          >
            {isAvail ? (
              <ToggleRight className="w-9 h-9 fill-coral-100" />
            ) : (
              <ToggleLeft className="w-9 h-9" />
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 pt-6 text-center">
        <div className="p-3 bg-coral-50/40 rounded-xl border border-coral-100">
          <p className="text-[11px] text-brand-muted font-medium">Total Donations</p>
          <p className="text-xl font-extrabold text-coral-600 mt-1">{profile.donation_count || 0}</p>
        </div>
        <div className="p-3 bg-coral-50/40 rounded-xl border border-coral-100">
          <p className="text-[11px] text-brand-muted font-medium">Last Donated</p>
          <p className="text-xs font-bold text-brand-text mt-2">{formatDate(profile.last_donation_date)}</p>
        </div>
        <div className="p-3 bg-coral-50/40 rounded-xl border border-coral-100">
          <p className="text-[11px] text-brand-muted font-medium">Lives Impacted</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{(profile.donation_count || 0) * 3}</p>
        </div>
      </div>
    </div>
  );
}
