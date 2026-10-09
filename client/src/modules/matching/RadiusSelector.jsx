import React from 'react';
import { Radio, ShieldAlert } from 'lucide-react';
import { SEARCH_RADIUS_STAGES } from '@shared/constants/urgencyLevels.js';

export default function RadiusSelector({ currentRadius, onExpand, loading = false }) {
  return (
    <div className="bg-coral-50/60 p-4 rounded-2xl border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-coral-600 animate-pulse" />
          <h4 className="text-xs font-bold text-coral-900 uppercase tracking-wider">
            Matching Radius Escalation
          </h4>
        </div>
        <p className="text-xs text-brand-muted mt-0.5">
          Current search zone: <span className="font-bold text-coral-600">{currentRadius} km</span>. Expand to reach more compatible donors.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {SEARCH_RADIUS_STAGES.map((r) => {
          const isCurrent = currentRadius === r;
          const isPassed = currentRadius > r;

          return (
            <button
              key={r}
              disabled={loading || isCurrent}
              onClick={() => onExpand(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isCurrent
                  ? 'bg-coral-500 text-white shadow-sm ring-2 ring-coral-300'
                  : isPassed
                  ? 'bg-white text-gray-400 border border-gray-200 cursor-default'
                  : 'bg-white text-coral-600 border border-surface-border hover:bg-coral-100/50'
              }`}
            >
              {r} km {isCurrent ? '(Active)' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
