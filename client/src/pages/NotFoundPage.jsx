import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-surface-border shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-coral-100 text-coral-500 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-brand-text">404</h1>
        <h2 className="text-lg font-bold text-brand-text">Page Not Found</h2>
        <p className="text-xs text-brand-muted">
          The healthcare portal route you are attempting to visit does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Safe Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
