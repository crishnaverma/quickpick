import React from 'react';
import { ShoppingBag, Zap, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const HeroBanner = ({ onExploreClick }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-brand-950 text-white shadow-card my-4 sm:my-6">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="max-w-xl space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Local Neighborhood Express Click-and-Collect</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-[1.15]">
            Skip the billing queue.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-200">
              Collect fresh groceries in 60 seconds.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Order fresh farm fruits, crisp vegetables, cold dairy, and daily essentials online. We handpick and bag your order so it’s ready when you walk into our store.
          </p>

          {/* Value Highlights */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-emerald-200 font-medium">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>15–20 Min Ready or Scheduled Slots</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-brand-300" />
              <span>Zero Wait at Counter</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Zero Pickup Convenience Fees</span>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-emerald-950 font-extrabold rounded-xl text-sm shadow-lg shadow-brand-500/25 transition active:scale-95 flex items-center gap-2"
            >
              <span>Explore Fresh Groceries</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm transition"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Right Feature Card: Click & Collect Showcase */}
        <div className="w-full md:w-auto shrink-0 max-w-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Store Counter Live
                </span>
              </div>
              <span className="text-xs text-white/80 font-mono bg-white/10 px-2 py-0.5 rounded">
                Avg. Prep: 14 mins
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white">Order Online</h4>
                  <p className="text-emerald-100/70 text-[11px]">Select items & choose ASAP or 30-min time slot</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white">We Handpick & Pack</h4>
                  <p className="text-emerald-100/70 text-[11px]">Staff packs fresh harvest in sanitized bags</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white">Express Pickup</h4>
                  <p className="text-emerald-100/70 text-[11px]">Scan QR at counter & walk out in under a minute</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] text-emerald-200/80 font-medium">
              📍 Collection Desk at Shop #4, Green Glen Plaza
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
