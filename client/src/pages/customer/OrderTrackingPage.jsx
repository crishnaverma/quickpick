import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency, formatDateTime, formatTime, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import api from '../../services/api';
import {
  QrCode,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ShoppingBag,
  RotateCcw,
  Ban,
  Loader2,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const OrderTrackingPage = ({ orderNumber, onBackToOrders, onReorderSuccess }) => {
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();
  const { addToCart, openCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');

  // Fetch initial order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderNumber}`);
      if (res.success) {
        setOrder(res.data);
      } else {
        setErrorMsg(res.message || 'Order not found');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
      joinOrderRoom(orderNumber);
    }

    return () => {
      if (orderNumber) {
        leaveOrderRoom(orderNumber);
      }
    };
  }, [orderNumber]);

  // Live Socket.IO listener for real-time order updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      if (data.orderNumber === orderNumber) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: data.status,
            estimatedPickupTime: data.estimatedPickupTime || prev.estimatedPickupTime,
            pickup: data.order?.pickup || prev.pickup,
          };
        });
      }
    };

    const handleReady = (data) => {
      if (data.orderNumber === orderNumber) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'READY',
            pickup: {
              ...prev.pickup,
              status: 'READY',
              readyAt: new Date().toISOString(),
              qrCodeDataUrl: data.qrCodeDataUrl || prev.pickup?.qrCodeDataUrl,
            },
          };
        });
      }
    };

    const handleCollected = (data) => {
      if (data.orderNumber === orderNumber) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'COLLECTED',
            pickup: {
              ...prev.pickup,
              status: 'COLLECTED',
              collectedAt: data.collectedAt || new Date().toISOString(),
            },
          };
        });
      }
    };

    socket.on('order:status_updated', handleStatusUpdate);
    socket.on('order:ready', handleReady);
    socket.on('order:collected', handleCollected);

    return () => {
      socket.off('order:status_updated', handleStatusUpdate);
      socket.off('order:ready', handleReady);
      socket.off('order:collected', handleCollected);
    };
  }, [socket, orderNumber]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const res = await api.post(`/orders/${orderNumber}/cancel`, {
        reason: cancelReason,
      });
      if (res.success) {
        setOrder(res.data);
        setShowCancelModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order || !order.items) return;
    for (const item of order.items) {
      await addToCart(item.productId, item.unitVariant, item.quantity);
    }
    openCart();
    if (onReorderSuccess) onReorderSuccess();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
        <p className="text-xs font-semibold">Loading live order status...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {errorMsg || 'We could not find an order with this reference number.'}
        </p>
        <button
          onClick={onBackToOrders}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
        >
          View Order History
        </button>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PLACED;
  const isTerminal = order.status === 'COLLECTED' || order.status === 'CANCELLED' || order.status === 'REJECTED';
  const isReady = order.status === 'READY';
  const canCancel = order.status === 'PLACED';

  // Order timeline steps
  const steps = [
    { key: 'PLACED', label: 'Placed' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready for Pickup' },
    { key: 'COLLECTED', label: 'Collected' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation & Order Ref */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={onBackToOrders}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All My Orders</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Order Placed:</span>
            <span className="text-xs font-bold text-slate-800">{formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Live Status Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {order.orderNumber}
                </h1>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${statusConfig.color}`}>
                  <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {statusConfig.description}
              </p>
            </div>

            {/* Estimated Collection Readiness */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left sm:text-right shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isReady ? 'Available for Collection Now' : 'Estimated Collection Time'}
              </p>
              <p className="text-lg font-black text-brand-700 flex items-center sm:justify-end gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>
                  {order.estimatedPickupTime
                    ? formatDateTime(order.estimatedPickupTime)
                    : order.pickup?.scheduledSlot || '15–20 minutes'}
                </span>
              </p>
            </div>
          </div>

          {/* Interactive Status Stepper */}
          {order.status !== 'CANCELLED' && order.status !== 'REJECTED' ? (
            <div className="pt-6">
              <div className="grid grid-cols-5 gap-2 relative">
                {/* Connecting background line */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-6 h-1 bg-brand-600 transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 92)}%`,
                  }}
                />

                {steps.map((st, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={st.key} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-transform duration-300 ${
                          isDone
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-brand-100 scale-110' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
                          isCurrent
                            ? 'text-brand-700'
                            : isDone
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="pt-4 p-4 bg-rose-50 rounded-2xl border border-rose-200 mt-4 flex items-center gap-3">
              <Ban className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  Order {order.status}
                </h4>
                <p className="text-xs text-rose-700">
                  {order.cancellationReason || order.rejectionReason || 'Order was not fulfilled.'} Reserved inventory has been released.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Pickup Section */}
        {order.status !== 'CANCELLED' && order.status !== 'REJECTED' && (
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-card mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-md text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5 text-brand-300" />
                  <span>Express Store Counter Pass</span>
                </div>

                <h3 className="text-2xl font-extrabold text-white leading-tight">
                  Present this QR at the QuickPick Collection Counter
                </h3>

                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Walk straight to the front collection desk at{' '}
                  <strong className="text-white">Shop #4, Green Glen Plaza</strong>.
                  Our staff will scan this token and hand over your ready package without any queue.
                </p>

                {/* Token string display */}
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 inline-block">
                  <p className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">
                    Pickup Verification Token
                  </p>
                  <p className="text-xl font-black font-mono tracking-widest text-white mt-0.5">
                    {order.pickup?.pickupToken || 'PENDING'}
                  </p>
                </div>

                <p className="text-[11px] text-emerald-300/80 flex items-center justify-center md:justify-start gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Encrypted token — does not expose private contact or bank information.</span>
                </p>
              </div>

              {/* QR Image Box */}
              <div className="bg-white p-4 rounded-3xl shadow-2xl shrink-0 flex flex-col items-center">
                {order.pickup?.qrCodeDataUrl ? (
                  <img
                    src={order.pickup.qrCodeDataUrl}
                    alt={`Pickup QR for Order #${order.orderNumber}`}
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <QrCode className="w-12 h-12" />
                  </div>
                )}
                <span className="text-[10px] font-mono font-bold text-slate-800 mt-2">
                  ORDER: {order.orderNumber}
                </span>
                <span className="text-[10px] font-semibold text-brand-700">
                  {order.pickup?.status === 'COLLECTED' ? '✓ COLLECTED' : 'READY TO SCAN'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Details & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Items Checklist */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Items ({order.items?.length || 0})</span>
              <span className="text-xs text-brand-700 font-bold bg-brand-50 px-2.5 py-0.5 rounded-full">
                Handpicked Fresh
              </span>
            </h3>

            <div className="divide-y divide-slate-100 space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        item.product?.images?.[0] ||
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {item.unitVariant !== 'default' ? item.unitVariant : item.productUnit} •{' '}
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-700 text-xs">Qty: {item.quantity}</p>
                    <p className="font-extrabold text-slate-900 text-sm">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Customer Notes:
                </p>
                <p className="text-xs text-slate-700 italic mt-0.5">"{order.notes}"</p>
              </div>
            )}
          </div>

          {/* Receipt & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                Payment & Total
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>{formatCurrency(order.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-brand-700 font-semibold">
                  <span>Click & Collect Service</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-brand-700">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Status Pill */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Payment:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    order.payment?.status === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.payment?.method === 'RAZORPAY' ? 'Razorpay Online' : 'Pay at Counter'}{' '}
                  ({order.payment?.status})
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleReorder}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reorder These Items</span>
                </button>

                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Store Help Support Pill */}
            <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Need help with your pickup?</p>
              <p>Call our counter directly at <strong>+91 98765 43210</strong></p>
              <p className="text-[11px] text-slate-500">Mention Order #{order.orderNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancel Order #{order.orderNumber}?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel? Any reserved grocery inventory will be immediately released back to store stock.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand-500"
              >
                <option value="Change of plans">Change of plans / unable to pick up</option>
                <option value="Ordered wrong items">Ordered wrong items or quantities</option>
                <option value="Delivery preference changed">Will shop in person instead</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
