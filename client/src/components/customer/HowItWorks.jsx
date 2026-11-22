import React from 'react';
import { Smartphone, Package, QrCode, Clock, CheckCircle } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      icon: Smartphone,
      title: 'Browse & Order Online',
      desc: 'Pick your fresh groceries, choose weight options (250g, 500g, 1kg), and select ASAP or your preferred 30-min pickup window.',
      tag: 'Pay Online or at Store',
    },
    {
      step: '02',
      icon: Package,
      title: 'Our Staff Packs Fresh',
      desc: 'Our experienced staff carefully handpicks crisp produce, checks expiration dates, and packs everything safely into chilled/dry bags.',
      tag: 'Real-time Tracking Updates',
    },
    {
      step: '03',
      icon: QrCode,
      title: 'Quick QR Pickup Handover',
      desc: 'Arrive at the dedicated QuickPick counter, show your secure digital QR token. Staff hands your bags over in under 60 seconds.',
      tag: 'Zero Billing Lines',
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2.5">
            How QuickPick Click & Collect Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Save 30–45 minutes every grocery run. Never wait in long supermarket billing lines again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-slate-50 rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 transition duration-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-300 font-mono">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-bold text-brand-700">
                  <CheckCircle className="w-4 h-4 text-brand-600" />
                  <span>{item.tag}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
