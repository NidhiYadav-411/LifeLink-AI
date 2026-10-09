import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../modules/requests/requestService.js';
import RequestCard from '../modules/requests/RequestCard.jsx';
import {
  Heart,
  Search,
  ShieldCheck,
  Activity,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Droplet,
  CheckCircle2,
  Building2,
  PhoneCall
} from 'lucide-react';

export default function LandingPage() {
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSampleRequests() {
      try {
        setLoading(true);
        const res = await requestService.getRequests();
        if (res && res.requests) {
          setActiveRequests(res.requests.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load public emergency requests preview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSampleRequests();
  }, []);

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-coral-50/50 via-white to-white pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center space-x-2 bg-coral-100 text-coral-800 px-3.5 py-1.5 rounded-full border border-surface-border text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-coral-500 animate-ping"></span>
                <span>Real-Time AI Matching & Emergency Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-text tracking-tight leading-[1.1]">
                Save Lives, <br />
                <span className="text-coral-500">Donate Blood.</span>
              </h1>

              <p className="text-base sm:text-lg text-brand-muted max-w-2xl leading-relaxed">
                LifeLink AI instantly bridges the gap between voluntary donors, patients in critical need, and verified medical hospitals through precision component matching and geo-radius dispatch.
              </p>

              {/* Calls To Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link
                  to="/register/donor"
                  className="px-8 py-3.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-coral-500/25 transition-all text-center flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  <span>Donate Now</span>
                </Link>

                <Link
                  to="/requests/create"
                  className="px-8 py-3.5 rounded-xl bg-white hover:bg-coral-50 text-coral-600 font-bold text-sm sm:text-base border-2 border-surface-border shadow-xs transition-all text-center flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Find Blood</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-100 max-w-lg">
                <div>
                  <p className="text-2xl font-black text-coral-500">100%</p>
                  <p className="text-xs font-semibold text-brand-muted">Hospital Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-coral-500">&lt; 15 min</p>
                  <p className="text-xs font-semibold text-brand-muted">Emergency Dispatch</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-coral-500">0$ Fee</p>
                  <p className="text-xs font-semibold text-brand-muted">Free Community Tool</p>
                </div>
              </div>

            </div>

            {/* Hero Right Visual Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-surface-border">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-xl bg-coral-500 text-white flex items-center justify-center font-bold shadow-sm">
                      <Droplet className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-text">Active Emergency Broadcast</h4>
                      <p className="text-[10px] text-coral-600 font-semibold">Scanning 10km radius for O- Donors</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                {/* Visual Interactive Pulse Area */}
                <div className="my-6 p-6 rounded-2xl bg-coral-50/50 border border-surface-border text-center relative overflow-hidden">
                  <div className="w-20 h-20 mx-auto rounded-full bg-coral-500 text-white flex items-center justify-center text-3xl font-black shadow-lg animate-pulse-subtle border-4 border-white">
                    O-
                  </div>
                  <p className="mt-3 text-xs font-bold text-coral-900">Universal Red Blood Cell Match</p>
                  <p className="text-[11px] text-brand-muted">Apex Multi-Speciality Trauma Unit</p>

                  <div className="mt-4 pt-3 border-t border-coral-200/60 flex items-center justify-between text-[11px] font-semibold text-coral-700">
                    <span>Target: 2 Units PRBC</span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-surface-border">Critical Urgency</span>
                  </div>
                </div>

                {/* Quick Registration Pills */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <span className="font-semibold text-brand-text flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Voluntary Donor Network</span>
                    </span>
                    <Link to="/register/donor" className="text-coral-600 font-bold hover:underline">
                      Join &rarr;
                    </Link>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <span className="font-semibold text-brand-text flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Hospital Authorization Portal</span>
                    </span>
                    <Link to="/register/hospital" className="text-coral-600 font-bold hover:underline">
                      Portal &rarr;
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW LIFELINK AI WORKS */}
      <section className="py-16 sm:py-24 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-coral-600 uppercase tracking-widest bg-coral-50 px-3 py-1 rounded-full border border-surface-border">
              Standardized Healthcare Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text mt-3">
              How LifeLink AI Operates
            </h2>
            <p className="text-sm sm:text-base text-brand-muted mt-2">
              A rapid 4-step verified workflow designed to prevent critical blood shortages and save emergency patients without delay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-coral-50/40 p-6 rounded-2xl border border-surface-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-coral-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm">
                  1
                </div>
                <h3 className="text-base font-bold text-brand-text mb-2">Patient or Staff Request</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  The requirement for specific blood components (Whole Blood, Platelets, Plasma) is logged with urgency level and required units.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-coral-200/50 text-[11px] font-semibold text-coral-700">
                Validated Input
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-coral-50/40 p-6 rounded-2xl border border-surface-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-coral-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm">
                  2
                </div>
                <h3 className="text-base font-bold text-brand-text mb-2">Hospital Verification</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Authorized medical personnel review and clinically verify the blood request before any donor broadcast can be initiated.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-coral-200/50 text-[11px] font-semibold text-coral-700">
                Zero Spam / Certified
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-coral-50/40 p-6 rounded-2xl border border-surface-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-coral-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm">
                  3
                </div>
                <h3 className="text-base font-bold text-brand-text mb-2">Precision Geo-Matching</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  The algorithm filters donors by biological component compatibility, active availability, and proximity in 5km, 10km, or 25km zones.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-coral-200/50 text-[11px] font-semibold text-coral-700">
                Targeted Outreach
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-coral-50/40 p-6 rounded-2xl border border-surface-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-coral-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm">
                  4
                </div>
                <h3 className="text-base font-bold text-brand-text mb-2">Response & Fulfillment</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Donors accept in-app, the hospital tracking dashboard updates in real-time, and verified donation certificates are issued.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-coral-200/50 text-[11px] font-semibold text-coral-700">
                Live Timeline Tracking
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE LIVE EMERGENCY REQUESTS PREVIEW */}
      <section className="py-16 sm:py-20 bg-coral-50/30 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
                  Active Emergency Blood Requests
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-brand-muted mt-1">
                Verified real-time emergency cases requiring donor match support right now.
              </p>
            </div>
            <Link
              to="/requests/create"
              className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-sm transition-all"
            >
              + Post New Emergency Need
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-brand-muted text-xs">Loading requests...</div>
          ) : activeRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-surface-border text-center text-brand-muted text-xs">
              No active emergency requests in this zone.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. DEMO ACCOUNTS QUICK-START CALLOUT FOR EVALUATION */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-coral-50 p-6 sm:p-8 rounded-3xl border-2 border-surface-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-coral-600">
                Evaluation & Prototype Testing
              </span>
              <h3 className="text-xl font-extrabold text-brand-text">
                Explore LifeLink AI with Pre-Seeded Roles
              </h3>
              <p className="text-xs text-brand-muted max-w-xl leading-relaxed">
                Test the end-to-end workflow instantly using pre-configured Donor, Patient, Hospital Staff, or Admin accounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Sign In to Demo
              </Link>
              <Link
                to="/register/donor"
                className="px-4 py-2 bg-white hover:bg-coral-50 text-coral-700 border border-surface-border rounded-xl text-xs font-bold"
              >
                Create Donor
              </Link>
              <Link
                to="/register/hospital"
                className="px-4 py-2 bg-white hover:bg-coral-50 text-coral-700 border border-surface-border rounded-xl text-xs font-bold"
              >
                Register Hospital
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
