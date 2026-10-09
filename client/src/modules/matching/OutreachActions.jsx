import React from 'react';
import { Send, ShieldAlert } from 'lucide-react';

export default function OutreachActions({ selectedCount, onBroadcast, loading = false }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-border p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center shrink-0">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-brand-text">Targeted Emergency Outreach</h4>
          <p className="text-xs text-brand-muted">
            Send real-time alerts only to selected compatible donors. No indiscriminate spamming.
          </p>
        </div>
      </div>

      <button
        disabled={selectedCount === 0 || loading}
        onClick={onBroadcast}
        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center space-x-2 ${
          selectedCount === 0 || loading
            ? 'bg-gray-300 cursor-not-allowed shadow-none'
            : 'bg-coral-500 hover:bg-coral-600 hover:shadow-coral-500/20 active:scale-95'
        }`}
      >
        <Send className="w-4 h-4" />
        <span>
          {loading
            ? 'Broadcasting...'
            : `Dispatch Alerts to (${selectedCount}) Candidate${selectedCount === 1 ? '' : 's'}`}
        </span>
      </button>
    </div>
  );
}
