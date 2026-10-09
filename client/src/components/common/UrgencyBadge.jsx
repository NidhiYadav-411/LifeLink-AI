import React from 'react';
import { AlertCircle, Flame, ShieldAlert } from 'lucide-react';

export default function UrgencyBadge({ level }) {
  const getStyle = () => {
    switch (level) {
      case 'Critical':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
          icon: ShieldAlert,
          pulse: true
        };
      case 'Urgent':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: Flame,
          pulse: false
        };
      case 'Normal':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: AlertCircle,
          pulse: false
        };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.bg} ${
        style.pulse ? 'animate-pulse-subtle ring-2 ring-red-300' : ''
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{level || 'Normal'}</span>
    </span>
  );
}
