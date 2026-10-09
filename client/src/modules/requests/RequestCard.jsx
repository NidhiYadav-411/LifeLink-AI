import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import UrgencyBadge from '../../components/common/UrgencyBadge.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { Building2, Droplet, Users, Calendar, ArrowRight } from 'lucide-react';

export default function RequestCard({ request }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-mono font-bold text-coral-600 bg-coral-50 px-2 py-0.5 rounded border border-coral-200">
              {request.request_code}
            </span>
            <h3 className="text-base font-bold text-brand-text mt-1.5 flex items-center space-x-2">
              <span>{request.units_required} Unit(s) &bull; {request.required_blood_group}</span>
            </h3>
          </div>
          <UrgencyBadge level={request.urgency_level} />
        </div>

        {/* Component & Hospital Info */}
        <div className="space-y-2 text-xs text-brand-muted mb-4">
          <div className="flex items-center space-x-2">
            <Droplet className="w-4 h-4 text-coral-500 shrink-0" />
            <span className="font-semibold text-brand-text">{request.blood_component}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-brand-muted shrink-0" />
            <span className="truncate">{request.hospital_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-brand-muted shrink-0" />
            <span>Needed by: {formatDateTime(request.required_datetime)}</span>
          </div>
          {request.match_count !== undefined && (
            <div className="flex items-center space-x-2 text-coral-700 bg-coral-50 px-2 py-1 rounded-md">
              <Users className="w-3.5 h-3.5" />
              <span className="font-bold">{request.match_count} Donors Matched ({request.accepted_count || 0} Accepted)</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer & Action */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <StatusBadge status={request.request_status} />
        <Link
          to={`/requests/${request.id}`}
          className="inline-flex items-center space-x-1 text-xs font-bold text-coral-600 hover:text-coral-800 transition-colors"
        >
          <span>Track Request</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
