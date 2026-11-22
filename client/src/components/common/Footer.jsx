import React from 'react';
import { ShoppingBag, MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Footer = () => {
  const { openAuthModal } = useAuth();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Shop Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                QUICK<span className="text-brand-400">PICK</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your neighborhood grocery click-and-collect service. Order fresh farm produce, dairy, and daily essentials online, then pick up in under a minute without queues.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 bg-brand-950/60 p-2.5 rounded-lg border border-brand-800/50">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Dedicated Express Collection Counter</span>
            </div>
          </div>

          {/* Click & Collect Benefits */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Click & Collect</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Zero billing line waiting</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Ready in 15-20 min or pick a slot</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Secure QR verification token</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Free store collection (No fees)</span>
              </li>
            </ul>
          </div>

          {/* Store Location & Timings */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Store Location</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Shop #4, Green Glen Plaza, 100 Feet Road, Bangalore, KA 560103</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Open Mon–Sun: 7:00 AM – 10:00 PM</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@quickpickgrocery.com</span>
              </p>
            </div>
          </div>

          {/* Quick Demo Access & Roles */}
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/80">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Quick Test Accounts</span>
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              One-click access to test Customer, Staff and Admin interfaces:
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-700">
              <p>👤 <strong>Admin:</strong> admin@quickpick.com</p>
              <p>🧑‍💼 <strong>Staff:</strong> staff@quickpick.com</p>
              <p>🛒 <strong>Customer:</strong> customer@example.com</p>
              <p className="text-amber-300">🔑 <strong>Pass:</strong> Admin@12345 / Staff@12345</p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="mt-3 w-full py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold transition text-center"
            >
              Switch Role / Sign In
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} QUICKPICK Grocery Click & Collect. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#admin" className="text-slate-400 hover:text-white transition">Staff Management</a>
            <span>•</span>
            <span>Local Single-Shop Platform</span>
            <span>•</span>
            <span>Razorpay Secure Test Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
