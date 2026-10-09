import React, { useState } from 'react';
import { formatDistance, formatDate } from '../../utils/formatters.js';
import { ShieldCheck, Heart, MapPin, CheckCircle2, Clock, Send, CheckSquare, Square } from 'lucide-react';

export default function MatchingCandidateList({
  candidates = [],
  selectedDonorIds = [],
  onToggleSelect = () => {},
  onSelectAll = () => {},
  onSingleOutreach = () => {}
}) {
  const allSelected = candidates.length > 0 && selectedDonorIds.length === candidates.length;

  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-surface-border p-8 text-center text-brand-muted">
        <Heart className="w-8 h-8 text-coral-300 mx-auto mb-2" />
        <p className="text-sm font-bold text-brand-text">No Compatible Donors in Selected Radius</p>
        <p className="text-xs mt-1">Try expanding the search radius or check donor availability filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 bg-coral-50/70 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onSelectAll}
            className="flex items-center space-x-1.5 text-xs font-bold text-coral-700 hover:text-coral-900"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-coral-600" />
            ) : (
              <Square className="w-4 h-4 text-coral-400" />
            )}
            <span>Select All ({candidates.length})</span>
          </button>
        </div>
        <span className="text-xs text-brand-muted">
          Selected for outreach: <span className="font-bold text-coral-600">{selectedDonorIds.length}</span>
        </span>
      </div>

      {/* Candidate Rows */}
      <div className="divide-y divide-gray-100">
        {candidates.map((c) => {
          const isSelected = selectedDonorIds.includes(c.donorId);
          const isContacted = c.status === 'CONTACTED';
          const isAccepted = c.status === 'ACCEPTED';
          const isDeclined = c.status === 'DECLINED';

          return (
            <div
              key={c.donorId}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                isSelected ? 'bg-coral-50/40' : 'hover:bg-gray-50'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start space-x-3">
                <button
                  type="button"
                  onClick={() => onToggleSelect(c.donorId)}
                  className="mt-1 text-coral-600"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-300" />
                  )}
                </button>

                <div className="w-9 h-9 rounded-full bg-coral-100 text-coral-700 font-extrabold flex items-center justify-center text-xs shrink-0 border border-coral-200">
                  {c.bloodGroup}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-brand-text">{c.fullName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{c.medicalEligibility}</span>
                    </span>
                  </div>

                  <p className="text-xs text-coral-600 font-medium mt-0.5">
                    {c.compatibilityReason}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-muted mt-1">
                    <span className="flex items-center space-x-1 font-semibold text-brand-text">
                      <MapPin className="w-3 h-3 text-coral-500" />
                      <span>{formatDistance(c.distanceKm)} ({c.city})</span>
                    </span>
                    <span>&bull;</span>
                    <span>Donations: <strong className="text-brand-text">{c.donationCount}</strong></span>
                    <span>&bull;</span>
                    <span>Last Donated: {formatDate(c.lastDonationDate)}</span>
                  </div>
                </div>
              </div>

              {/* Right Status & Action */}
              <div className="flex items-center space-x-2 sm:self-center pl-7 sm:pl-0">
                {isAccepted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accepted</span>
                  </span>
                ) : isDeclined ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-300">
                    Declined
                  </span>
                ) : isContacted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Contacted (Pending)</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onSingleOutreach(c.donorId)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-coral-500 hover:bg-coral-600 text-white shadow-xs flex items-center space-x-1 transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Alert</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
