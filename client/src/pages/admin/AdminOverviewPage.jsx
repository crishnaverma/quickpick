import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDateTime, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  PackageCheck,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Loader2,
} from 'lucide-react';

export const AdminOverviewPage = ({ onNavigateTab, onSelectOrder }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load overview:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-xs font-semibold">Loading store metrics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockAlerts = data?.lowStockAlerts || [];
  const salesTrend = data?.salesTrend || [];

  const maxSale = Math.max(...salesTrend.map((d) => d.sales), 100);

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Store Performance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time grocery orders, store revenue & inventory status
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Sales</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(metrics.todaySales || 0)}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
              Today's Confirmed Revenue
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {metrics.todayOrdersCount || 0}
            </h3>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded mt-1 inline-block">
              {metrics.pendingOrdersCount || 0} Pending Fulfillment
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ready for Pickup</p>
            <h3 className="text-2xl font-black text-brand-700 mt-1">
              {metrics.readyOrdersCount || 0}
            </h3>
            <span className="text-[10px] text-brand-700 font-bold bg-brand-50 px-1.5 py-0.2 rounded mt-1 inline-block">
              Waiting at Counter
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
            <h3 className={`text-2xl font-black mt-1 ${metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {metrics.lowStockCount || 0}
            </h3>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded mt-1 inline-block">
              Needs Warehouse Reorder
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">7-Day Sales Trend</h3>
              <p className="text-xs text-slate-500">Daily click-and-collect sales performance</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Daily Volume</span>
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-6">
            <div className="h-44 flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
              {salesTrend.map((d) => {
                const heightPercent = Math.max(8, Math.round((d.sales / maxSale) * 100));
                const shortDate = d.date.split('-').slice(1).join('/');

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none z-10 whitespace-nowrap shadow-md">
                      {formatCurrency(d.sales)} ({d.orders} orders)
                    </div>

                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden h-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-brand-400 group-hover:from-emerald-500 group-hover:to-brand-300 transition-all duration-300 rounded-t-md"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {shortDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts</span>
            </h3>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Manage Stock
            </button>
          </div>

          {lowStockAlerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">All products well-stocked!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No products currently below threshold.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100">
              {lowStockAlerts.map((item) => {
                const available = item.stockQuantity - (item.reservedStock || 0);
                return (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 truncate max-w-[150px]">{item.name}</h4>
                      <p className="text-[10px] text-slate-500">{item.category?.name || 'Produce'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                        {available} left
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Min: {item.minStockThreshold}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Incoming Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Live incoming click-and-collect orders</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View Full Order Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Order Number</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Pickup Type</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((ord) => {
                const statusCfg = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.PLACED;
                return (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{ord.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">{ord.user?.phone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-700">
                        {ord.pickupType === 'ASAP' ? '⚡ ASAP' : '📅 Scheduled'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onSelectOrder(ord.orderNumber)}
                        className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-[11px] transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
