import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../modules/requests/requestService.js';
import RequestCard from '../modules/requests/RequestCard.jsx';
import { PlusCircle, Activity, Heart, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PatientDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatientRequests() {
      try {
        setLoading(true);
        const res = await requestService.getRequests();
        if (res && res.requests) {
          setRequests(res.requests);
        }
      } catch (err) {
        console.error('Failed to load patient requests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatientRequests();
  }, []);

  const activeCount = requests.filter(r => !['Fulfilled', 'Cancelled', 'Expired'].includes(r.request_status)).length;
  const fulfilledCount = requests.filter(r => r.request_status === 'Fulfilled').length;

  return (
    <div className="space-y-8">
      
      {/* Welcome & Create CTA Banner */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-coral-600 uppercase tracking-widest bg-coral-50 px-3 py-1 rounded-full border border-surface-border">
            Patient / Family Command Center
          </span>
          <h2 className="text-2xl font-black text-brand-text mt-2">
            Emergency Blood Request Tracking
          </h2>
          <p className="text-xs text-brand-muted mt-1 max-w-xl">
            Monitor real-time hospital verification, matching candidate outreach, and donor responses for all your active requests.
          </p>
        </div>

        <Link
          to="/requests/create"
          className="px-6 py-3 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 shrink-0 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Request</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="font-semibold">Total Requests Logged</span>
            <Activity className="w-4 h-4 text-coral-500" />
          </div>
          <p className="text-2xl font-black text-brand-text mt-2">{requests.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="font-semibold">Active & In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{activeCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="font-semibold">Fulfilled Requests</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{fulfilledCount}</p>
        </div>
      </div>

      {/* Requests Listing */}
      <div>
        <h3 className="text-lg font-bold text-brand-text mb-4">
          Your Blood Requests ({requests.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-brand-muted text-xs">Loading your blood requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-surface-border p-12 text-center text-brand-muted">
            <Heart className="w-10 h-10 text-coral-300 mx-auto mb-3" />
            <p className="text-base font-bold text-brand-text">No Blood Requests Created Yet</p>
            <p className="text-xs mt-1 mb-6">
              When a family member or patient requires urgent blood, submit a request to start hospital verification and donor matching.
            </p>
            <Link
              to="/requests/create"
              className="px-6 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-xs"
            >
              + Submit Blood Request
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

    </div>
  );
}
