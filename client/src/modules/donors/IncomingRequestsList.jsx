import React, { useState } from 'react';
import { formatDateTime, formatDistance } from '../../utils/formatters.js';
import UrgencyBadge from '../../components/common/UrgencyBadge.jsx';
import { Check, X, MapPin, Building2, Droplet, Clock, HeartHandshake } from 'lucide-react';

export default function IncomingRequestsList({ requests = [], onRespond = () => {}, responding = false }) {
  const [selectedNotes, setSelectedNotes] = useState({});

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-surface-border p-12 text-center text-brand-muted">
        <HeartHandshake className="w-10 h-10 text-coral-300 mx-auto mb-3" />
        <p className="text-base font-bold text-brand-text">No Incoming Requests Right Now</p>
        <p className="text-xs mt-1">
          When a hospital verifies an urgent blood request matching your blood group, you will receive an instant alert here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((item) => {
        const hasResponded = item.donor_response !== null && item.donor_response !== undefined;
        const isAccepted = item.donor_response === 'ACCEPTED';
        const isDeclined = item.donor_response === 'DECLINED';

        return (
          <div
            key={item.match_id}
            className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
              isAccepted
                ? 'border-emerald-300 bg-emerald-50/20'
                : isDeclined
                ? 'border-gray-200 opacity-60'
                : 'border-surface-border hover:border-coral-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-coral-600 bg-coral-50 px-2.5 py-1 rounded-md border border-coral-200">
                  {item.request_code}
                </span>
                <span className="text-sm font-bold text-brand-text">
                  {item.units_required} Unit(s) needed of {item.required_blood_group} ({item.blood_component})
                </span>
              </div>
              <UrgencyBadge level={item.urgency_level} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs text-brand-muted">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-coral-500 shrink-0" />
                <span className="font-semibold text-brand-text truncate">{item.hospital_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-coral-500 shrink-0" />
                <span>{formatDistance(item.distance_km)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-coral-500 shrink-0" />
                <span>Needed: {formatDateTime(item.required_datetime)}</span>
              </div>
            </div>

            {item.description && (
              <p className="text-xs text-brand-text bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-4">
                <span className="font-bold text-brand-muted">Clinical Note: </span>
                {item.description}
              </p>
            )}

            {/* Response action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-coral-600 font-medium">
                {item.compatibility_reason}
              </span>

              {hasResponded ? (
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isAccepted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    You {isAccepted ? 'Accepted' : 'Declined'} this request
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    disabled={responding}
                    onClick={() => onRespond(item.request_id, 'DECLINED', selectedNotes[item.request_id] || '')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center space-x-1 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    disabled={responding}
                    onClick={() => onRespond(item.request_id, 'ACCEPTED', selectedNotes[item.request_id] || '')}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-coral-500 hover:bg-coral-600 text-white shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>I Can Donate</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
