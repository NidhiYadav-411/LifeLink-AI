import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { matchingService } from '../modules/matching/matchingService.js';
import { requestService } from '../modules/requests/requestService.js';
import RadiusSelector from '../modules/matching/RadiusSelector.jsx';
import MatchingCandidateList from '../modules/matching/MatchingCandidateList.jsx';
import OutreachActions from '../modules/matching/OutreachActions.jsx';
import InteractiveMap from '../components/map/InteractiveMap.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import UrgencyBadge from '../components/common/UrgencyBadge.jsx';
import {
  ArrowLeft,
  Sparkles,
  Users,
  ShieldCheck,
  Building2,
  Navigation,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function DonorMatchingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [currentRadius, setCurrentRadius] = useState(10);
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadMatchingData = async (radius = currentRadius) => {
    try {
      setLoading(true);
      const res = await matchingService.getCandidates(id, radius);
      if (res) {
        setRequest(res.request);
        setCandidates(res.candidates || []);
        setCurrentRadius(res.request?.currentRadiusKm || radius);
        // Pre-select all uncontacted candidates within radius by default
        const uncontacted = (res.candidates || [])
          .filter(c => c.isWithinRadius && c.status === 'IDENTIFIED')
          .map(c => c.donorId);
        setSelectedDonorIds(uncontacted);
      }
    } catch (err) {
      console.error('Failed to load matching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatchingData(currentRadius);
  }, [id]);

  const handleExpandRadius = async (nextRadius) => {
    try {
      setActionLoading(true);
      const res = await matchingService.expandRadius(id, nextRadius);
      setCurrentRadius(nextRadius);
      setCandidates(res.candidates || []);
      setMessage({
        type: 'success',
        text: `Radius expanded to ${nextRadius} km. Identified ${res.totalCompatible || 0} compatible candidates.`
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to expand radius.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSelect = (donorId) => {
    setSelectedDonorIds(prev =>
      prev.includes(donorId) ? prev.filter(x => x !== donorId) : [...prev, donorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDonorIds.length === candidates.length) {
      setSelectedDonorIds([]);
    } else {
      setSelectedDonorIds(candidates.map(c => c.donorId));
    }
  };

  const handleBroadcast = async () => {
    if (selectedDonorIds.length === 0) return;
    try {
      setActionLoading(true);
      await matchingService.initiateOutreach(id, selectedDonorIds);
      setMessage({
        type: 'success',
        text: `Targeted emergency alert dispatched to ${selectedDonorIds.length} candidate(s)!`
      });
      await loadMatchingData(currentRadius);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Outreach dispatch failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSingleOutreach = async (donorId) => {
    try {
      setActionLoading(true);
      await matchingService.initiateOutreach(id, [donorId]);
      setMessage({ type: 'success', text: 'Alert dispatched to donor.' });
      await loadMatchingData(currentRadius);
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Alert failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !request) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-brand-muted">Running compatibility matrix & ranking candidates...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-surface-border text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-coral-500 mx-auto" />
        <h3 className="text-lg font-bold text-brand-text">Request Not Found</h3>
        <Link to="/hospital/dashboard" className="px-5 py-2 rounded-xl bg-coral-500 text-white font-bold text-xs inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/requests/${request.id}`}
          className="inline-flex items-center space-x-1 text-xs font-bold text-coral-600 hover:text-coral-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Request Details</span>
        </Link>

        <button
          onClick={() => loadMatchingData(currentRadius)}
          className="p-2 rounded-xl border border-surface-border text-brand-muted hover:text-brand-text bg-white self-start sm:self-auto flex items-center space-x-1 text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-run Matching</span>
        </button>
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

      {/* Matching Overview Card */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-coral-600 bg-coral-50 px-2.5 py-1 rounded-md border border-coral-200">
                {request.requestCode}
              </span>
              <StatusBadge status={request.requestStatus} />
              <UrgencyBadge level={request.urgencyLevel} />
            </div>

            <h1 className="text-2xl font-black text-brand-text mt-2 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-coral-500" />
              <span>Precision Donor Matching Console</span>
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Target Requirement: <strong className="text-brand-text">{request.unitsRequired} Unit(s) {request.requiredBloodGroup} ({request.bloodComponent})</strong> &bull; {request.hospitalName}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-brand-muted block">Compatible Donors Identified</span>
            <span className="text-3xl font-black text-coral-600">{candidates.length}</span>
          </div>
        </div>

        {/* Radius escalation control bar */}
        <div className="pt-6">
          <RadiusSelector
            currentRadius={currentRadius}
            onExpand={handleExpandRadius}
            loading={actionLoading}
          />
        </div>
      </div>

      {/* Coverage Map & Geographic Layout */}
      <InteractiveMap
        center={{
          lat: 40.7527,
          lng: -73.9772,
          name: request.hospitalName
        }}
        radiusKm={currentRadius}
        candidates={candidates}
        onSelectCandidate={(c) => {
          if (!selectedDonorIds.includes(c.donorId)) {
            setSelectedDonorIds(prev => [...prev, c.donorId]);
          }
        }}
      />

      {/* Outreach Action Trigger */}
      <OutreachActions
        selectedCount={selectedDonorIds.length}
        onBroadcast={handleBroadcast}
        loading={actionLoading}
      />

      {/* Ranked Candidate List */}
      <div>
        <h3 className="text-lg font-bold text-brand-text mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-coral-600" />
          <span>Ranked Candidate Donors ({candidates.length})</span>
        </h3>

        <MatchingCandidateList
          candidates={candidates}
          selectedDonorIds={selectedDonorIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onSingleOutreach={handleSingleOutreach}
        />
      </div>

    </div>
  );
}
