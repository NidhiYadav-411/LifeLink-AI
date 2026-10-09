import React from 'react';
import { formatDate } from '../../utils/formatters.js';
import { Award, CheckCircle2, Building2, Droplet } from 'lucide-react';

export default function DonationHistoryTable({ history = [] }) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-surface-border p-8 text-center text-brand-muted">
        <Award className="w-8 h-8 text-coral-300 mx-auto mb-2" />
        <p className="text-sm font-bold text-brand-text">No Past Donations Recorded Yet</p>
        <p className="text-xs mt-1">Once a hospital confirms your completed donation, your certificate will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-coral-50/70 text-coral-900 border-b border-surface-border uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Hospital / Facility</th>
              <th className="px-5 py-3.5">Component</th>
              <th className="px-5 py-3.5">Units</th>
              <th className="px-5 py-3.5">Certificate #</th>
              <th className="px-5 py-3.5">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-brand-text">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-coral-50/30 transition-colors">
                <td className="px-5 py-3.5 font-bold">{formatDate(record.donation_date)}</td>
                <td className="px-5 py-3.5 font-medium flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-coral-500" />
                  <span>{record.hospital_name || 'Partner Blood Center'}</span>
                </td>
                <td className="px-5 py-3.5">{record.blood_component} ({record.blood_group})</td>
                <td className="px-5 py-3.5 font-bold text-coral-600">{record.units_donated} Unit(s)</td>
                <td className="px-5 py-3.5 font-mono text-[11px] text-brand-muted">{record.certificate_number}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Hospital Verified</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
