import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDateTime, formatTime, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import { useSocket } from '../../contexts/SocketContext';
import {
  Search,
  Filter,
  Check,
  Package,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  CreditCard,
  Banknote,
  AlertCircle,
  Loader2,
  ChevronRight,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const AdminOrdersPage = ({ onOpenPickupScan }) => {
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [rejectionModalOrder, setRejectionModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') params.append('status', activeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      if (res.success) {
        setOrders(res.data.orders);
        if (selectedOrder) {
          const updatedSelected = res.data.orders.find((o) => o.id === selectedOrder.id);
          if (updatedSelected) setSelectedOrder(updatedSelected);
        }
      }
    } catch (err) {
      console.warn('Failed to load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeFilter, searchQuery]);

  // Live Socket.IO listener for real-time order updates
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      // Prepend newly placed order immediately with highlight!
      setOrders((prev) => [data.order, ...prev]);
    };

    const handleStatusUpdate = (data) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === data.orderNumber ? { ...o, ...data.order, status: data.status } : o))
      );
      if (selectedOrder && selectedOrder.orderNumber === data.orderNumber) {
        setSelectedOrder((prev) => ({ ...prev, ...data.order, status: data.status }));
      }
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:status_updated', handleStatusUpdate);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status_updated', handleStatusUpdate);
    };
  }, [socket, selectedOrder]);

  const handleUpdateStatus = async (orderId, newStatus, reason = null) => {
    setStatusUpdating(true);
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        rejectionReason: reason,
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...res.data, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, ...res.data, status: newStatus }));
        }
        setRejectionModalOrder(null);
        setRejectionReason('');
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'PLACED', label: 'Placed (New)' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'PREPARING', label: 'Preparing' },
    { id: 'READY', label: 'Ready for Pickup' },
    { id: 'COLLECTED', label: 'Collected' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Order Fulfillment Board
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live queue for grocery preparation and counter pickups
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPickupScan && (
            <button
              onClick={onOpenPickupScan}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span>Counter QR Scanner</span>
            </button>
          )}

          <button
            onClick={fetchOrders}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition shadow-xs"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer Name, or Phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Main Grid: Orders List & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order Cards */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
              <p className="text-xs font-semibold">Loading live orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No orders in this view</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming click-and-collect orders will appear here automatically.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const statusCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PLACED;
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-subtle'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {order.orderNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {order.pickupType === 'ASAP' ? '⚡ ASAP Collection' : `📅 Slot: ${order.pickup?.scheduledSlot || 'Scheduled'}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {order.user?.name || 'Customer'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {order.user?.phone}
                      </span>
                      <span>•</span>
                      <span>{order.items?.length || 0} items</span>
                    </div>
                  </div>

                  {/* Right side: Amount & Fast Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-base font-black text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <span className="text-[10px] font-bold text-slate-500">
                        {order.payment?.method === 'RAZORPAY' ? 'Paid Online' : 'Pay at Store'}
                      </span>
                    </div>

                    {/* Quick Status Action Controls */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {order.status === 'PLACED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                          disabled={statusUpdating}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                      )}

                      {order.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          disabled={statusUpdating}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Package className="w-3 h-3" />
                          <span>Pack Groceries</span>
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'READY')}
                          disabled={statusUpdating}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Mark Ready</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 1 Column: Selected Order Itemized Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card sticky top-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Order Details
                  </span>
                  <h3 className="text-lg font-black font-mono text-slate-900">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${ORDER_STATUS_CONFIG[selectedOrder.status]?.color}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Customer Contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <p className="font-bold text-slate-900">{selectedOrder.user?.name}</p>
                <p className="text-slate-500">{selectedOrder.user?.phone} • {selectedOrder.user?.email}</p>
                <p className="text-slate-600 font-medium">
                  {selectedOrder.pickupType === 'ASAP'
                    ? '⚡ ASAP Rapid Collection'
                    : `📅 Scheduled Slot: ${selectedOrder.pickup?.scheduledSlot}`}
                </p>
              </div>

              {/* Items Packing Checklist */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Items to Handpick ({selectedOrder.items?.length || 0}):
                </p>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
                  {selectedOrder.items?.map((it) => (
                    <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{it.productName}</p>
                        <p className="text-[11px] text-slate-500">
                          {it.unitVariant !== 'default' ? it.unitVariant : it.productUnit} •{' '}
                          {formatCurrency(it.unitPrice)} each
                        </p>
                      </div>
                      <span className="font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded text-xs">
                        {it.quantity}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.notes && (
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                  <strong>Notes:</strong> {selectedOrder.notes}
                </div>
              )}

              {/* Total & Payment */}
              <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Total Due:</span>
                  <span className="text-emerald-700">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Payment:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedOrder.payment?.method} ({selectedOrder.payment?.status})
                  </span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 space-y-2">
                {selectedOrder.status === 'PLACED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'ACCEPTED')}
                    disabled={statusUpdating}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Order</span>
                  </button>
                )}

                {selectedOrder.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                    disabled={statusUpdating}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Package className="w-4 h-4" />
                    <span>Start Bagging Groceries</span>
                  </button>
                )}

                {selectedOrder.status === 'PREPARING' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'READY')}
                    disabled={statusUpdating}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                )}

                {selectedOrder.status === 'READY' && (
                  <button
                    onClick={() => onOpenPickupScan && onOpenPickupScan()}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Go to QR Handover Terminal</span>
                  </button>
                )}

                {/* Rejection / Cancellation */}
                {selectedOrder.status !== 'COLLECTED' && selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'REJECTED' && (
                  <button
                    onClick={() => setRejectionModalOrder(selectedOrder)}
                    className="w-full py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition"
                  >
                    Reject Order (Release Stock)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-slate-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">Select an order on the left to inspect items and advance status.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Order Modal */}
      {rejectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reject Order #{rejectionModalOrder.orderNumber}?
            </h3>
            <p className="text-xs text-slate-500">
              Rejecting this order will release all reserved inventory items back into available stock.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection:</label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Produce damaged during packing, stock discrepancy"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectionModalOrder(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Back
              </button>
              <button
                onClick={() => handleUpdateStatus(rejectionModalOrder.id, 'REJECTED', rejectionReason || 'Store stock unavailable')}
                disabled={statusUpdating}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
