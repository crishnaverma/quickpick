import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, CreditCard, Banknote, Loader2 } from 'lucide-react';

export const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/reports?period=${period}`);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Failed to load reports:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-xs font-semibold">Generating grocery sales reports...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const paymentMethods = data?.paymentMethods || {};
  const topProducts = data?.topSellingProducts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sales & Order Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store revenue performance, popular groceries, and payment distributions
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(summary.totalRevenue || 0)}
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Net Click & Collect sales</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fulfilled Orders</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {summary.totalOrders || 0}
          </h3>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Orders processed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Basket Value</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(summary.averageOrderValue || 0)}
          </h3>
          <p className="text-[11px] text-amber-600 font-bold mt-1">Per pickup collection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span>Best-Selling Grocery Items</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Ranked by volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Units Sold</th>
                  <th className="px-4 py-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((p, idx) => (
                  <tr key={p.productId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {p.productName}
                    </td>
                    <td className="px-4 py-3 font-black text-amber-700">
                      {p.totalQuantity} units
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">
                      {formatCurrency(p.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            Payment Breakdown
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Razorpay Online</p>
                  <p className="text-[10px] text-slate-400">
                    {paymentMethods.RAZORPAY?.count || 0} orders
                  </p>
                </div>
              </div>
              <span className="font-black text-slate-900 text-sm">
                {formatCurrency(paymentMethods.RAZORPAY?.amount || 0)}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Pay at Store Counter</p>
                  <p className="text-[10px] text-slate-400">
                    {paymentMethods.CASH_ON_PICKUP?.count || 0} orders
                  </p>
                </div>
              </div>
              <span className="font-black text-slate-900 text-sm">
                {formatCurrency(paymentMethods.CASH_ON_PICKUP?.amount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
