import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { Bell, CheckCircle2, AlertTriangle, QrCode, X } from 'lucide-react';

export const ToastNotification = () => {
  const { latestNotification } = useSocket();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (latestNotification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  if (!visible || !latestNotification) return null;

  const isReady = latestNotification.type === 'ready';
  const isWarning = latestNotification.type === 'warning';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-2xl shadow-float border flex items-start gap-3 backdrop-blur-md ${
          isReady
            ? 'bg-emerald-950/95 text-white border-emerald-500'
            : isWarning
            ? 'bg-amber-950/95 text-white border-amber-500'
            : 'bg-slate-900/95 text-white border-slate-700'
        }`}
      >
        <div className="mt-0.5">
          {isReady ? (
            <QrCode className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <Bell className="w-5 h-5 text-brand-400 shrink-0" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold leading-tight">{latestNotification.title}</h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            {latestNotification.message}
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-white p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
