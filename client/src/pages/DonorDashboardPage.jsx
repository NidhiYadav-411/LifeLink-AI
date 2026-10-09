import React, { useState, useEffect } from 'react';
import { donorService } from '../modules/donors/donorService.js';
import DonorCard from '../modules/donors/DonorCard.jsx';
import IncomingRequestsList from '../modules/donors/IncomingRequestsList.jsx';
import DonationHistoryTable from '../modules/donors/DonationHistoryTable.jsx';
import { Heart, Activity, Award, BellRing, RefreshCw } from 'lucide-react';

export default function DonorDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState(null);

  const loadDonorData = async () => {
    try {
      setLoading(true);
      const [profRes, reqRes, histRes] = await Promise.all([
        donorService.getProfile(),
        donorService.getIncomingRequests(),
        donorService.getDonationHistory()
      ]);

      if (profRes && profRes.profile) setProfile(profRes.profile);
      if (reqRes && reqRes.incomingRequests) setIncomingRequests(reqRes.incomingRequests);
      if (histRes && histRes.history) setHistory(histRes.history);
    } catch (err) {
      console.error('Error loading donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonorData();
  }, []);

  const handleToggleAvailability = async (newVal) => {
    try {
      setToggling(true);
      await donorService.updateAvailability(newVal);
      setProfile(prev => ({ ...prev, is_available: newVal ? 1 : 0 }));
      setMessage({ type: 'success', text: `Availability updated to ${newVal ? 'AVAILABLE' : 'UNAVAILABLE'}.` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update availability.' });
    } finally {
      setToggling(false);
    }
  };

  const handleRespond = async (requestId, response, notes) => {
    try {
      setResponding(true);
      await donorService.respondToRequest(requestId, response, notes);
      setMessage({
        type: 'success',
        text: `Response "${response}" successfully recorded! Hospital has been notified.`
      });
      await loadDonorData();
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to record response.' });
    } finally {
      setResponding(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-brand-muted">Loading donor records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Banner Alert */}
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

      {/* Donor Overview Profile & Availability */}
      <DonorCard
        profile={profile}
        onToggleAvailability={handleToggleAvailability}
        toggling={toggling}
      />

      {/* Incoming Matching Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-coral-600" />
            <h3 className="text-lg font-bold text-brand-text">
              Incoming Compatible Blood Requests ({incomingRequests.length})
            </h3>
          </div>
          <button
            onClick={loadDonorData}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-coral-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <IncomingRequestsList
          requests={incomingRequests}
          onRespond={handleRespond}
          responding={responding}
        />
      </div>

      {/* Donation History & Certificates */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-coral-600" />
          <h3 className="text-lg font-bold text-brand-text">
            Verified Donation History & Certificates ({history.length})
          </h3>
        </div>

        <DonationHistoryTable history={history} />
      </div>

    </div>
  );
}
