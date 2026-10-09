import React from 'react';
import { REQUEST_STATUS } from '@shared/constants/requestStatus.js';
import { Check, Clock, Search, UserCheck, Award, XCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters.js';

const STAGES = [
  { id: REQUEST_STATUS.SUBMITTED, label: 'Submitted', icon: Clock },
  { id: REQUEST_STATUS.PENDING_VERIFICATION, label: 'Pending Verification', icon: Clock },
  { id: REQUEST_STATUS.VERIFIED, label: 'Hospital Verified', icon: Check },
  { id: REQUEST_STATUS.SEARCHING, label: 'Outreach Active', icon: Search },
  { id: REQUEST_STATUS.RESPONSE_RECEIVED, label: 'Donor Accepted', icon: UserCheck },
  { id: REQUEST_STATUS.FULFILLED, label: 'Fulfilled', icon: Award }
];

export default function RequestTimeline({ currentStatus, history = [] }) {
  const isCancelled = currentStatus === REQUEST_STATUS.CANCELLED || currentStatus === REQUEST_STATUS.EXPIRED;

  // Determine active step index
  const getCurrentStepIndex = () => {
    switch (currentStatus) {
      case REQUEST_STATUS.SUBMITTED: return 0;
      case REQUEST_STATUS.PENDING_VERIFICATION: return 1;
      case REQUEST_STATUS.VERIFIED: return 2;
      case REQUEST_STATUS.SEARCHING: return 3;
      case REQUEST_STATUS.RESPONSE_RECEIVED: return 4;
      case REQUEST_STATUS.FULFILLED: return 5;
      default: return 1;
    }
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-sm">
      <h3 className="text-sm font-bold text-brand-text mb-6">Request Lifecycle Timeline</h3>

      {isCancelled ? (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-center space-x-3 text-red-700">
          <XCircle className="w-6 h-6 shrink-0" />
          <div>
            <p className="text-sm font-bold">This blood request was {currentStatus.toLowerCase()}</p>
            <p className="text-xs text-red-600">Active donor outreach has been stopped.</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Progress Bar Background */}
          <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-coral-100 -z-0">
            <div
              className="h-full bg-coral-500 transition-all duration-500"
              style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                      isCurrent
                        ? 'bg-coral-500 text-white ring-4 ring-coral-200 scale-110'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold leading-tight ${
                      isCurrent ? 'text-coral-600 font-bold' : isPast ? 'text-brand-text' : 'text-gray-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Log / Event Feed */}
      {history.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">Event Log</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((log) => (
              <div key={log.id} className="text-xs flex items-start space-x-2 text-brand-muted">
                <span className="text-coral-500 font-bold">&bull;</span>
                <div className="flex-1">
                  <span className="font-semibold text-brand-text">{log.action.replace(/_/g, ' ')}</span>
                  {log.user_name && <span> by {log.user_name} ({log.user_role})</span>}
                  <span className="text-gray-400 block text-[10px]">{formatDateTime(log.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
