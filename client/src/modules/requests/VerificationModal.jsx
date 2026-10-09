import React, { useState } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function VerificationModal({ isOpen, onClose, request, onVerify }) {
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState('VERIFIED');
  const [loading, setLoading] = useState(false);

  if (!request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onVerify(request.id, actionType, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Verify Blood Request #${request.request_code}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div className="bg-coral-50 p-4 rounded-xl border border-surface-border">
          <p className="font-bold text-coral-900">Hospital Medical Verification Protocol</p>
          <p className="text-xs text-brand-muted mt-1">
            Verifying this request will confirm blood requirement authenticity and authorize immediate donor matching broadcast.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div><span className="font-semibold">Blood Group:</span> {request.required_blood_group}</div>
            <div><span className="font-semibold">Units:</span> {request.units_required}</div>
            <div><span className="font-semibold">Component:</span> {request.blood_component}</div>
            <div><span className="font-semibold">Urgency:</span> {request.urgency_level}</div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-text mb-1">
            Verification Decision
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActionType('VERIFIED')}
              className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold transition-all ${
                actionType === 'VERIFIED'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Approve & Verify</span>
            </button>
            <button
              type="button"
              onClick={() => setActionType('REJECTED')}
              className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold transition-all ${
                actionType === 'REJECTED'
                  ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Reject Request</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-text mb-1">
            Clinical Notes / Physician Verification Reference
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Crossmatch preliminary checked; approved for trauma unit."
            className="w-full px-3 py-2 border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all flex items-center space-x-1.5 ${
              actionType === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : actionType === 'VERIFIED' ? 'Authorize & Verify' : 'Confirm Rejection'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
