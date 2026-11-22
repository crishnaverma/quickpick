import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/settings');
        if (res.success) {
          setSettings(res.data);
        }
      } catch (err) {
        console.warn('Failed to load settings:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        shopName: settings.shopName,
        tagline: settings.tagline,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
        slotDurationMinutes: parseInt(settings.slotDurationMinutes, 10),
        maxOrdersPerSlot: parseInt(settings.maxOrdersPerSlot, 10),
        isShopOpen: settings.isShopOpen,
        acceptAsap: settings.acceptAsap,
        taxRate: parseFloat(settings.taxRate),
        minOrderAmount: parseFloat(settings.minOrderAmount),
        razorpayKeyId: settings.razorpayKeyId,
      };

      const res = await api.put('/admin/settings', payload);
      if (res.success) {
        setSettings(res.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-xs font-semibold">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Store & Operating Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure operating hours, pickup capacity limits, emergency toggles, and payment gateways
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully! Customer storefront updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Master Toggles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
            Emergency Master Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                name="isShopOpen"
                checked={settings.isShopOpen}
                onChange={handleChange}
                className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <div>
                <p className="font-bold text-xs text-slate-900">Accept Online Orders</p>
                <p className="text-[11px] text-slate-500">Uncheck to temporarily pause incoming customer orders</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                name="acceptAsap"
                checked={settings.acceptAsap}
                onChange={handleChange}
                className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <div>
                <p className="font-bold text-xs text-slate-900">Allow ASAP Rapid Pickup</p>
                <p className="text-[11px] text-slate-500">Enable 15–20 min urgent packing requests</p>
              </div>
            </label>
          </div>
        </div>

        {/* Store Profile */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
            Store Profile & Pickup Desk Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                name="shopName"
                value={settings.shopName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Store Pickup Counter Address</label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Capacity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
            Operating Hours & Slot Capacity
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Opening Time</label>
              <input
                type="text"
                name="openingTime"
                value={settings.openingTime}
                onChange={handleChange}
                placeholder="07:00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Closing Time</label>
              <input
                type="text"
                name="closingTime"
                value={settings.closingTime}
                onChange={handleChange}
                placeholder="22:00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Orders / Slot</label>
              <input
                type="number"
                name="maxOrdersPerSlot"
                value={settings.maxOrdersPerSlot}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                name="minOrderAmount"
                value={settings.minOrderAmount}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">GST Tax Rate (e.g. 0.05 for 5%)</label>
              <input
                type="number"
                step="0.01"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Razorpay Key ID (Test Mode)</label>
              <input
                type="text"
                name="razorpayKeyId"
                value={settings.razorpayKeyId || ''}
                onChange={handleChange}
                placeholder="rzp_test_..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Configuration...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Apply Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
