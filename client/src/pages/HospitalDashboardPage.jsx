import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../modules/requests/requestService.js';
import RequestCard from '../modules/requests/RequestCard.jsx';
import VerificationModal from '../modules/requests/VerificationModal.jsx';
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { REQUEST_STATUS } from '@shared/constants/requestStatus.js';

export default function HospitalDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [selectedReqForVerification, setSelectedReqForVerification] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestService.getRequests({
        status: statusFilter,
        urgency: urgencyFilter
      });
      if (res && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error('Failed to load hospital requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter]);

  const handleVerify = async (requestId, actionType, notes) => {
    try {
      await requestService.verifyRequest(requestId, actionType, notes);
      setMessage({
        type: 'success',
        text: `Blood request #${requestId} successfully ${actionType.toLowerCase()}!`
      });
      await fetchRequests();
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Verification failed.' });
    }
  };

  const pendingVerificationList = requests.filter(
    r => r.request_status === REQUEST_STATUS.PENDING_VERIFICATION || r.request_status === REQUEST_STATUS.SUBMITTED
  );

  return (
    <div className="space-y-8">
      
      {/* Top Banner Message */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-sm font-black">&times;</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-coral-600 uppercase tracking-widest bg-coral-50 px-3 py-1 rounded-full border border-surface-border">
              Hospital Operations Command
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Facility</span>
            </span>
          </div>

          <h2 className="text-2xl font-black text-brand-text mt-2">
            Blood Emergency Command & Matching Center
          </h2>
          <p className="text-xs text-brand-muted mt-1 max-w-xl">
            Authorize patient submissions, trigger precision donor matching algorithms, and manage unit transfusions.
          </p>
        </div>

        <Link
          to="/requests/create"
          className="px-6 py-3 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 shrink-0 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Emergency Request</span>
        </Link>
      </div>

      {/* Pending Medical Verifications Queue */}
      {pendingVerificationList.length > 0 && (
        <div className="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900">
              Pending Medical Verifications ({pendingVerificationList.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingVerificationList.map((req) => (
              <div
                key={req.id}
                className="bg-white p-4 rounded-2xl border border-amber-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-coral-600 bg-coral-50 px-2 py-0.5 rounded">
                      {req.request_code}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Needs Verification
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-brand-text mt-2">
                    {req.units_required} Unit(s) {req.required_blood_group} ({req.blood_component})
                  </h4>
                  <p className="text-xs text-brand-muted mt-1">
                    Submitted by: <strong className="text-brand-text">{req.creator_name}</strong>
                  </p>
                  {req.description && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg mt-2 line-clamp-2">
                      {req.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to={`/requests/${req.id}`}
                    className="text-xs text-brand-muted hover:text-brand-text font-semibold"
                  >
                    View Details &rarr;
                  </Link>
                  <button
                    onClick={() => setSelectedReqForVerification(req)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Review & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-surface-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-coral-500" />
          <span className="text-xs font-bold text-brand-text">Filter Requests</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none bg-white"
          >
            <option value="">All Statuses</option>
            {Object.values(REQUEST_STATUS).map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-surface-border text-xs focus:ring-2 focus:ring-coral-400 focus:outline-none bg-white"
          >
            <option value="">All Urgency Levels</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Active Requests Grid */}
      <div>
        <h3 className="text-lg font-bold text-brand-text mb-4">
          All Hospital Blood Requests ({requests.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-brand-muted text-xs">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-surface-border p-12 text-center text-brand-muted">
            <Building2 className="w-10 h-10 text-coral-300 mx-auto mb-3" />
            <p className="text-base font-bold text-brand-text">No Matching Requests</p>
            <p className="text-xs mt-1 mb-6">Create an emergency blood request or clear the filters.</p>
            <Link
              to="/requests/create"
              className="px-6 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-xs"
            >
              + Create Blood Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {selectedReqForVerification && (
        <VerificationModal
          isOpen={Boolean(selectedReqForVerification)}
          onClose={() => setSelectedReqForVerification(null)}
          request={selectedReqForVerification}
          onVerify={handleVerify}
        />
      )}

    </div>
  );
}
