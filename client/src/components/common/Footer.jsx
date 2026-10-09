import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-surface-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-coral-500 text-white flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-extrabold text-coral-500">
                LifeLink <span className="text-brand-text font-semibold">AI</span>
              </span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Real-time emergency blood donation network connecting patients, verified hospitals, and voluntary life-saving donors through intelligent matching.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex">
              <Shield className="w-3.5 h-3.5" />
              <span>HIPAA Compliant Protocol</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-brand-text mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li><Link to="/" className="hover:text-coral-500">Home Landing</Link></li>
              <li><Link to="/register/donor" className="hover:text-coral-500">Register as Donor</Link></li>
              <li><Link to="/register/patient" className="hover:text-coral-500">Patient & Family Registration</Link></li>
              <li><Link to="/register/hospital" className="hover:text-coral-500">Hospital Portal Registration</Link></li>
              <li><Link to="/login" className="hover:text-coral-500">Portal Login</Link></li>
            </ul>
          </div>

          {/* Blood Info */}
          <div>
            <h4 className="text-sm font-bold text-brand-text mb-4">Compatible Groups</h4>
            <ul className="space-y-1.5 text-xs text-brand-muted">
              <li><span className="font-bold text-coral-600">O Negative:</span> Universal RBC Donor</li>
              <li><span className="font-bold text-coral-600">AB Positive:</span> Universal RBC Recipient</li>
              <li><span className="font-bold text-coral-600">AB Negative:</span> Universal Plasma Donor</li>
              <li><span className="font-bold text-coral-600">Platelets:</span> Critical for Oncology</li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="text-sm font-bold text-brand-text mb-4">24/7 Emergency Support</h4>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-coral-500" />
                <span className="font-semibold text-brand-text">1-800-LIFELINK (Toll Free)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-coral-500" />
                <span>emergency@lifelink.ai</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-coral-500" />
                <span>Central Medical Hub & Network</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} LifeLink AI Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for rapid healthcare emergency response.</p>
        </div>
      </div>
    </footer>
  );
}
