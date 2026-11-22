import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatTime, formatDate } from '../../utils/formatters';
import { Calendar, Clock, ToggleLeft, ToggleRight, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export const AdminSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/slots?date=${selectedDate}`);
      if (res.success) {
        setSlots(res.data);
      }
    } catch (err) {
      console.warn('Failed to load slots:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate]);

  const handleToggle = async (slotId) => {
    try {
      const res = await api.patch(`/admin/slots/${slotId}/toggle`);
      if (res.success) {
        setSlots((prev) =>
          prev.map((s) => (s.id === slotId ? { ...s, isClosed: res.data.isClosed } : s))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle slot');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pickup Time Slots Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor capacity, manage 30-minute collection windows, and close slots during store rushes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          />
          <button
            onClick={fetchSlots}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
          <p className="text-xs font-semibold">Loading time slots...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No slots for {formatDate(selectedDate)}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => {
            const isFull = slot.bookedCount >= slot.maxOrders;
            const progress = Math.min(100, Math.round((slot.bookedCount / slot.maxOrders) * 100));

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition bg-white shadow-subtle ${
                  slot.isClosed
                    ? 'border-slate-200 bg-slate-50/60 opacity-60'
                    : isFull
                    ? 'border-amber-300'
                    : 'border-slate-200 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</span>
                  </div>

                  <button
                    onClick={() => handleToggle(slot.id)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                      slot.isClosed
                        ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {slot.isClosed ? 'Closed' : 'Open'}
                  </button>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Booked Capacity</span>
                    <span className="font-bold text-slate-900">
                      {slot.bookedCount} / {slot.maxOrders} orders
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull
                          ? 'bg-rose-500'
                          : progress > 70
                          ? 'bg-amber-500'
                          : 'bg-brand-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px]">
                    <span className={slot.isClosed ? 'text-rose-600' : isFull ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                      {slot.isClosed ? 'Staff closed this slot' : isFull ? 'Capacity full' : `${slot.maxOrders - slot.bookedCount} spots available`}
                    </span>
                    <button
                      onClick={() => handleToggle(slot.id)}
                      className="text-amber-700 font-bold hover:underline"
                    >
                      {slot.isClosed ? 'Reopen' : 'Close Slot'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
