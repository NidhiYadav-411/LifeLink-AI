import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { requestService } from '../modules/requests/requestService.js';
import { useAuth } from '../hooks/useAuth.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import UrgencyBadge from '../components/common/UrgencyBadge.jsx';
import RequestTimeline from '../modules/requests/RequestTimeline.jsx';
import VerificationModal from '../modules/requests/VerificationModal.jsx';
import { formatDateTime, formatDate } from '../utils/formatters.js';
import { ROLES } from '@shared/constants/roles.js';
import { REQUEST_STATUS } from '@shared/constants/requestStatus.js';
import {
  ArrowLeft,
  Building2,
  Droplet,
  Calendar,
  ShieldCheck,
  Search,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function RequestDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const [detailRes, histRes] = await Promise.all([
        requestService.getRequestById(id),
        requestService.getHistory(id)
      ]);

      if (detailRes && detailRes.request) {
        setRequest(detailRes.request);
        setMatches(detailRes.matches || []);
      }
      if (histRes && histRes.history) {
        setHistory(histRes.history);
      }
    } catch (err) {
      console.error('Failed to load request details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleVerify = async (requestId, actionType, notes) => {
    try {
      setActionLoading(true);
      await requestService.verifyRequest(requestId, actionType, notes);
      setMessage({ type: 'success', text: `Request #${requestId} has been verified!` });
      await loadDetails();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Verification failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!window.confirm(`Are you sure you want to mark this request as "${nextStatus}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await requestService.updateStatus(id, nextStatus);
      setMessage({ type: 'success', text: `Status successfully updated to ${nextStatus}.` });
      await loadDetails();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Status transition failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await requestService.cancelRequest(id, reason);
      setMessage({ type: 'success', text: 'Blood request was cancelled.' });
      await loadDetails();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Cancellation failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !request) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-brand-muted">Loading blood request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-surface-border text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-coral-500 mx-auto" />
        <h3 className="text-lg font-bold text-brand-text">Blood Request Not Found</h3>
        <p className="text-xs text-brand-muted">The requested blood emergency tracking record does not exist.</p>
        <Link to="/" className="px-5 py-2 rounded-xl bg-coral-500 text-white font-bold text-xs inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  const isHospitalStaff = user?.role === ROLES.HOSPITAL || user?.role === ROLES.ADMIN;
  const isVerified = request.verification_status === 'VERIFIED';
  const isFulfilled = request.request_status === REQUEST_STATUS.FULFILLED;
  const isCancelled = request.request_status === REQUEST_STATUS.CANCELLED;

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 text-xs font-bold text-coral-600 hover:text-coral-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadDetails}
            className="p-2 rounded-xl border border-surface-border text-brand-muted hover:text-brand-text bg-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isHospitalStaff && !isVerified && !isCancelled && (
            <button
              onClick={() => setVerifyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Authorize</span>
            </button>
          )}

          {isVerified && !isFulfilled && !isCancelled && (
            <Link
              to={`/requests/${request.id}/matching`}
              className="px-5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Matching Engine</span>
            </Link>
          )}

          {isHospitalStaff && isVerified && !isFulfilled && !isCancelled && (
            <button
              onClick={() => handleUpdateStatus(REQUEST_STATUS.FULFILLED)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Mark Fulfilled
            </button>
          )}

          {!isFulfilled && !isCancelled && (
            <button
              onClick={handleCancel}
              className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

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

      {/* Main Request Summary Card */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-mono font-bold text-sm text-coral-600 bg-coral-50 px-3 py-1 rounded-md border border-coral-200">
                {request.request_code}
              </span>
              <StatusBadge status={request.request_status} />
              <UrgencyBadge level={request.urgency_level} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-brand-text mt-3">
              {request.units_required} Unit(s) of {request.required_blood_group} ({request.blood_component})
            </h1>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-coral-500 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-coral-200 shrink-0">
            {request.required_blood_group}
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-b border-gray-100 text-xs">
          <div>
            <span className="text-brand-muted font-semibold block">Hospital / Facility</span>
            <div className="flex items-center space-x-1.5 font-bold text-brand-text mt-1 text-sm">
              <Building2 className="w-4 h-4 text-coral-500 shrink-0" />
              <span className="truncate">{request.hospital_name}</span>
            </div>
            {request.hospital_address && (
              <p className="text-[11px] text-brand-muted mt-0.5">{request.hospital_address}</p>
            )}
          </div>

          <div>
            <span className="text-brand-muted font-semibold block">Required By</span>
            <div className="flex items-center space-x-1.5 font-bold text-brand-text mt-1 text-sm">
              <Calendar className="w-4 h-4 text-coral-500 shrink-0" />
              <span>{formatDateTime(request.required_datetime)}</span>
            </div>
          </div>

          <div>
            <span className="text-brand-muted font-semibold block">Request Initiator</span>
            <div className="flex items-center space-x-1.5 font-bold text-brand-text mt-1 text-sm">
              <User className="w-4 h-4 text-coral-500 shrink-0" />
              <span>{request.creator_name}</span>
            </div>
            <p className="text-[11px] text-brand-muted mt-0.5">{request.creator_email}</p>
          </div>

          <div>
            <span className="text-brand-muted font-semibold block">Verification Status</span>
            <div className="mt-1">
              {isVerified ? (
                <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified by {request.verified_by_name || 'Hospital'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Pending Authorization</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Clinical Note description */}
        {request.description && (
          <div className="pt-6">
            <h4 className="text-xs font-bold text-brand-text mb-1">Clinical Context & Notes</h4>
            <p className="text-xs text-brand-muted bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              {request.description}
            </p>
          </div>
        )}
      </div>

      {/* Lifecycle Timeline */}
      <RequestTimeline
        currentStatus={request.request_status}
        history={history}
      />

      {/* Matching Donors Summary Table */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-brand-text">
              Matching Donor Candidates ({matches.length})
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Donors identified and contacted through precision compatibility and distance algorithms.
            </p>
          </div>

          {isVerified && !isFulfilled && !isCancelled && (
            <Link
              to={`/requests/${request.id}/matching`}
              className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-xs"
            >
              Manage Outreach & Radius &rarr;
            </Link>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center text-brand-muted text-xs bg-gray-50 rounded-2xl">
            {isVerified
              ? 'No donors contacted yet. Open the Matching Engine to trigger outreach.'
              : 'Medical verification required before matching candidate outreach can begin.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {matches.map((m) => (
              <div key={m.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-coral-100 text-coral-700 font-extrabold flex items-center justify-center text-xs">
                    {m.donor_blood_group || 'O-'}
                  </div>
                  <div>
                    <span className="font-bold text-brand-text">{m.donor_name}</span>
                    <p className="text-[11px] text-coral-600 font-medium">{m.compatibility_reason}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-brand-muted">{m.distance_km} km away</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    m.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : m.status === 'CONTACTED'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        request={request}
        onVerify={handleVerify}
      />

    </div>
  );
}
