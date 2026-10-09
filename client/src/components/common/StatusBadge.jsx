import React from 'react';
import { REQUEST_STATUS } from '@shared/constants/requestStatus.js';
import { Clock, CheckCircle2, Search, AlertCircle, XCircle, UserCheck } from 'lucide-react';

export default function StatusBadge({ status }) {
  const getStyle = () => {
    switch (status) {
      case REQUEST_STATUS.SUBMITTED:
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Clock
        };
      case REQUEST_STATUS.PENDING_VERIFICATION:
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertCircle
        };
      case REQUEST_STATUS.VERIFIED:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2
        };
      case REQUEST_STATUS.SEARCHING:
        return {
          bg: 'bg-coral-50 text-coral-700 border-coral-200',
          icon: Search,
          pulse: true
        };
      case REQUEST_STATUS.RESPONSE_RECEIVED:
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: UserCheck
        };
      case REQUEST_STATUS.FULFILLED:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2
        };
      case REQUEST_STATUS.CANCELLED:
      case REQUEST_STATUS.EXPIRED:
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: XCircle
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: Clock
        };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${
        style.pulse ? 'animate-pulse' : ''
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
