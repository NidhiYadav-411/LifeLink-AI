import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, ShieldCheck, Heart } from 'lucide-react';

export default function InteractiveMap({
  center = { lat: 40.7527, lng: -73.9772, name: 'Hospital Location' },
  radiusKm = 10,
  candidates = [],
  onSelectCandidate = () => {}
}) {
  const [selectedPin, setSelectedPin] = useState(null);

  // Normalize candidate locations relative to center for visual representation
  // 1 degree lat is ~111km, 1 degree lon is ~85km in NYC
  return (
    <div className="bg-white rounded-2xl border border-surface-border overflow-hidden shadow-sm">
      {/* Map Control Header */}
      <div className="p-4 bg-coral-50/70 border-b border-surface-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-coral-600" />
          <span className="text-xs font-bold text-coral-800">
            Geographic Coverage Map &bull; Active Radius: <span className="underline">{radiusKm} km</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-brand-muted">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-coral-600 inline-block"></span>
            <span>Hospital</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Compatible Donor</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Contacted</span>
          </span>
        </div>
      </div>

      {/* Interactive Visual Canvas */}
      <div className="relative w-full h-80 bg-slate-50 overflow-hidden flex items-center justify-center select-none border-b border-gray-100">
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(#F2A099 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Search Radius Circle */}
        <div
          className="absolute rounded-full border-2 border-dashed border-coral-400/80 bg-coral-100/30 flex items-center justify-center transition-all duration-500"
          style={{
            width: radiusKm <= 5 ? '160px' : radiusKm <= 10 ? '240px' : '300px',
            height: radiusKm <= 5 ? '160px' : radiusKm <= 10 ? '240px' : '300px',
          }}
        >
          <span className="text-[10px] font-bold text-coral-500 bg-white/90 px-1.5 py-0.5 rounded shadow-xs mb-auto mt-2">
            {radiusKm} km Zone
          </span>
        </div>

        {/* Hospital Central Marker */}
        <div className="absolute z-20 flex flex-col items-center transform -translate-y-1/2">
          <div className="w-8 h-8 rounded-full bg-coral-600 text-white flex items-center justify-center shadow-lg ring-4 ring-coral-200 animate-pulse-subtle">
            <MapPin className="w-4 h-4 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-coral-900 bg-white/95 px-2 py-0.5 rounded-md shadow-xs mt-1 border border-coral-200">
            {center.name || 'Hospital'}
          </span>
        </div>

        {/* Render Donor Candidate Pins around center */}
        {candidates.map((c, i) => {
          // Compute pseudo-offsets based on distance and index angle
          const angle = (i * (360 / Math.max(1, candidates.length)) * Math.PI) / 180;
          const maxRadiusPx = 110;
          const distPx = Math.min(maxRadiusPx, (c.distanceKm / (radiusKm || 10)) * 100 + 30);
          const xOffset = Math.cos(angle) * distPx;
          const yOffset = Math.sin(angle) * distPx;

          const isContacted = c.status === 'CONTACTED';
          const isAccepted = c.status === 'ACCEPTED';

          return (
            <div
              key={c.donorId || i}
              onClick={() => {
                setSelectedPin(c);
                onSelectCandidate(c);
              }}
              className="absolute z-30 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `calc(50% + ${xOffset}px)`,
                top: `calc(50% + ${yOffset}px)`
              }}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shadow-md transition-all group-hover:scale-125 ${
                  isAccepted
                    ? 'bg-emerald-600 ring-2 ring-emerald-300'
                    : isContacted
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-emerald-500 ring-2 ring-white'
                }`}
              >
                {c.bloodGroup || 'O+'}
              </div>

              {/* Tooltip on hover or selection */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-40 whitespace-nowrap bg-brand-text text-white text-[10px] px-2 py-1 rounded shadow-lg">
                <p className="font-bold">{c.fullName} ({c.bloodGroup})</p>
                <p className="text-gray-300">{c.distanceKm} km &bull; {c.status}</p>
              </div>
            </div>
          );
        })}

        {/* Compass indicator */}
        <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-lg border border-surface-border text-brand-muted">
          <Compass className="w-4 h-4 text-coral-500" />
        </div>
      </div>

      {/* Selected pin detailed summary */}
      {selectedPin && (
        <div className="p-3.5 bg-coral-50 flex items-center justify-between border-t border-surface-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-coral-500 text-white font-bold flex items-center justify-center text-xs">
              {selectedPin.bloodGroup}
            </div>
            <div>
              <p className="text-xs font-bold text-brand-text">{selectedPin.fullName}</p>
              <p className="text-[11px] text-brand-muted">
                {selectedPin.distanceKm} km away &bull; {selectedPin.compatibilityReason}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-white border border-surface-border text-coral-700">
            Status: {selectedPin.status}
          </span>
        </div>
      )}
    </div>
  );
}
