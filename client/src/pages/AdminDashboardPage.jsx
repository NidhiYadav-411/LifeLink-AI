import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api.js';
import { API_ENDPOINTS } from '@shared/api-contracts/endpoints.js';
import { formatDateTime } from '../utils/formatters.js';
import {
  Shield,
  Users,
  Building2,
  Activity,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  Search
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('hospitals'); // 'hospitals' | 'users' | 'audit' | 'stats'
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, hospRes, usersRes, auditRes] = await Promise.all([
        apiRequest(API_ENDPOINTS.ADMIN.STATS),
        apiRequest(API_ENDPOINTS.ADMIN.HOSPITALS),
        apiRequest(API_ENDPOINTS.ADMIN.USERS),
        apiRequest(API_ENDPOINTS.ADMIN.AUDIT_LOGS)
      ]);

      if (statsRes && statsRes.stats) setStats(statsRes.stats);
      if (hospRes && hospRes.hospitals) setHospitals(hospRes.hospitals);
      if (usersRes && usersRes.users) setUsers(usersRes.users);
      if (auditRes && auditRes.auditLogs) setAuditLogs(auditRes.auditLogs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyHospital = async (hospitalId, currentVerified) => {
    try {
      const nextVal = !currentVerified;
      await apiRequest(API_ENDPOINTS.ADMIN.VERIFY_HOSPITAL(hospitalId), {
        method: 'PATCH',
        body: { isVerified: nextVal }
      });
      setMessage({
        type: 'success',
        text: `Hospital status updated to ${nextVal ? 'VERIFIED' : 'UNVERIFIED'}.`
      });
      await loadAdminData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Verification update failed.' });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Admin Header */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-coral-600 uppercase tracking-widest bg-coral-50 px-3 py-1 rounded-full border border-surface-border">
              Super Admin Control
            </span>
          </div>
          <h1 className="text-2xl font-black text-brand-text mt-2 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-coral-500" />
            <span>Platform Governance & Hospital Verification</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1 max-w-xl">
            Monitor emergency network health, audit request transactions, and certify partner hospitals.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 bg-coral-50 hover:bg-coral-100 text-coral-700 rounded-xl text-xs font-bold border border-surface-border flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
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

      {/* High-level Platform Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-surface-border">
            <p className="text-[11px] text-brand-muted font-medium">Registered Donors</p>
            <p className="text-xl font-black text-coral-600 mt-1">{stats.totalDonors}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-surface-border">
            <p className="text-[11px] text-brand-muted font-medium">Available Donors</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{stats.activeDonors}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-surface-border">
            <p className="text-[11px] text-brand-muted font-medium">Certified Hospitals</p>
            <p className="text-xl font-black text-blue-600 mt-1">{stats.activeHospitals}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-surface-border">
            <p className="text-[11px] text-brand-muted font-medium">Total Requests</p>
            <p className="text-xl font-black text-purple-600 mt-1">{stats.totalRequests}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-surface-border">
            <p className="text-[11px] text-brand-muted font-medium">Fulfilled</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{stats.fulfilledRequests}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-surface-border">
            <p className="text-[11px] text-brand-muted font-medium">Units Transfused</p>
            <p className="text-xl font-black text-coral-600 mt-1">{stats.totalDonations}</p>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white rounded-3xl border border-surface-border overflow-hidden shadow-sm">
        
        <div className="flex border-b border-surface-border bg-coral-50/50 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'hospitals'
                ? 'border-coral-500 text-coral-600'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospitals & Verification ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'users'
                ? 'border-coral-500 text-coral-600'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'audit'
                ? 'border-coral-500 text-coral-600'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: Hospitals Verification */}
        {activeTab === 'hospitals' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-coral-50/70 text-coral-900 uppercase font-bold text-[10px] tracking-wider border-b border-surface-border">
                  <tr>
                    <th className="px-4 py-3">Facility Name</th>
                    <th className="px-4 py-3">License Number</th>
                    <th className="px-4 py-3">Location / Address</th>
                    <th className="px-4 py-3">Contact Officer</th>
                    <th className="px-4 py-3">Verification Status</th>
                    <th className="px-4 py-3 text-right">Certification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-brand-text">
                  {hospitals.map((hosp) => {
                    const isVer = hosp.is_verified === 1 || hosp.is_verified === true;
                    return (
                      <tr key={hosp.id} className="hover:bg-coral-50/20">
                        <td className="px-4 py-3 font-bold flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-coral-500 shrink-0" />
                          <span>{hosp.name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-brand-muted">{hosp.registration_number}</td>
                        <td className="px-4 py-3 text-brand-muted">{hosp.address}, {hosp.city}</td>
                        <td className="px-4 py-3">{hosp.contact_person} ({hosp.user_email})</td>
                        <td className="px-4 py-3">
                          {isVer ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified Certified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold text-[10px]">
                              <XCircle className="w-3 h-3" />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleVerifyHospital(hosp.id, isVer)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                              isVer
                                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {isVer ? 'Revoke License' : 'Certify Hospital'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-coral-50/70 text-coral-900 uppercase font-bold text-[10px] tracking-wider border-b border-surface-border">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Blood / Facility</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-brand-text">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-coral-50/20">
                      <td className="px-4 py-3 font-bold">{u.full_name}</td>
                      <td className="px-4 py-3 text-brand-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-[10px] text-gray-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-coral-600">
                        {u.blood_group ? `Donor (${u.blood_group})` : u.hospital_name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-600 font-bold">{u.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-[11px]">{formatDateTime(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Audit Trail */}
        {activeTab === 'audit' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-coral-50/70 text-coral-900 uppercase font-bold text-[10px] tracking-wider border-b border-surface-border">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-brand-text font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-coral-50/20">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                      <td className="px-4 py-3 font-sans font-bold">{log.user_name || 'SYSTEM'} ({log.user_role || '-'})</td>
                      <td className="px-4 py-3 font-bold text-coral-600">{log.action}</td>
                      <td className="px-4 py-3">{log.entity_type} #{log.entity_id || '-'}</td>
                      <td className="px-4 py-3 text-brand-muted max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
