import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import {
  Archive,
  AlertTriangle,
  PlusCircle,
  History,
  Search,
  Filter,
  CheckCircle2,
  X,
  Loader2,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export const AdminInventoryPage = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'movements'
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Adjustment Modal
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('STOCK_IN');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (lowStockFilter) params.append('lowStockOnly', 'true');

      const res = await api.get(`/admin/inventory?${params.toString()}`);
      if (res.success) {
        setInventory(res.data);
      }
    } catch (err) {
      console.warn('Failed to load inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/inventory/movements?limit=50');
      if (res.success) {
        setMovements(res.data);
      }
    } catch (err) {
      console.warn('Failed to load movements:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchInventory();
    } else {
      fetchMovements();
    }
  }, [activeTab, search, lowStockFilter]);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustProduct) return;

    setSaving(true);
    try {
      const qty = parseInt(adjustQty, 10);
      const res = await api.post(`/admin/inventory/${adjustProduct.id}/adjust`, {
        quantityChange: qty,
        type: adjustType,
        notes: adjustNotes || 'Manual warehouse stock entry',
      });

      if (res.success) {
        setAdjustProduct(null);
        setAdjustQty('');
        setAdjustNotes('');
        fetchInventory();
      }
    } catch (err) {
      alert(err.message || 'Failed to adjust inventory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory & Warehouse Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock balance, customer reservations, and movement audit trails
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'stock'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Stock Levels</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inventory items..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Show Low Stock Only</span>
            </label>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
                <p className="text-xs font-semibold">Loading stock levels...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Total Physical</th>
                      <th className="px-5 py-3.5">Reserved (In Prep)</th>
                      <th className="px-5 py-3.5">Net Available</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Adjustment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">Unit: {item.defaultUnit}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600 font-medium">
                          {item.category?.name}
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-900">
                          {item.stockQuantity}
                        </td>
                        <td className="px-5 py-3 font-semibold text-amber-700">
                          {item.reservedStock || 0}
                        </td>
                        <td className="px-5 py-3 font-black text-brand-700">
                          {item.availableStock}
                        </td>
                        <td className="px-5 py-3">
                          {item.isLowStock ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Adequate
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => {
                              setAdjustProduct(item);
                              setAdjustQty('20');
                              setAdjustType('STOCK_IN');
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-[11px] transition"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Movement History Audit Trail */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Stock Movement Audit Log</h3>
            <button
              onClick={fetchMovements}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Quantity Change</th>
                  <th className="px-5 py-3.5">Balance After</th>
                  <th className="px-5 py-3.5">Staff / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-slate-500">{formatDateTime(m.createdAt)}</td>
                    <td className="px-5 py-3 font-sans font-bold text-slate-900">
                      {m.product?.name}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          m.type === 'STOCK_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.type === 'RESERVATION'
                            ? 'bg-blue-100 text-blue-800'
                            : m.type === 'RELEASE'
                            ? 'bg-purple-100 text-purple-800'
                            : m.type === 'SALE'
                            ? 'bg-brand-100 text-brand-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold">
                      <span className={m.quantity > 0 ? 'text-emerald-600' : 'text-slate-800'}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">{m.balanceAfter}</td>
                    <td className="px-5 py-3 font-sans text-slate-600">
                      {m.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-float">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Adjust Inventory: {adjustProduct.name}
              </h3>
              <button
                onClick={() => setAdjustProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="STOCK_IN">STOCK_IN (Restock / Goods Inward)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Cycle Count Correction)</option>
                  <option value="LOSS">LOSS / DAMAGE (Spoilage / Shrinkage)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantity Change (+ for addition, - for reduction)
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Received new shipment from mandi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustProduct(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl"
                >
                  {saving ? 'Recording...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
