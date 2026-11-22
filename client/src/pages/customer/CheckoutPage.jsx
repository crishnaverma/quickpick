import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatTime, formatDate } from '../../utils/formatters';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Clock,
  Calendar,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  MapPin,
  ChevronLeft,
} from 'lucide-react';

export const CheckoutPage = ({ onOrderPlaced, onBackToShopping }) => {
  const { items, itemCount, subtotal, estimatedTax, estimatedTotal, refreshCart, clearCart } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [pickupType, setPickupType] = useState('ASAP'); // 'ASAP' or 'SCHEDULED'
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_PICKUP'); // 'RAZORPAY' or 'CASH_ON_PICKUP'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Require authentication for checkout
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
    }
  }, [isAuthenticated]);

  // Fetch available pickup slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        const res = await api.get('/pickups/slots');
        if (res.success) {
          setAvailableSlots(res.data);
          // Set initial slot
          const firstAvailable = res.data.find((s) => s.isAvailable);
          if (firstAvailable) {
            setSelectedSlotId(firstAvailable.id);
          }
        }
      } catch (err) {
        console.warn('Failed to load pickup slots:', err.message);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, []);

  const handlePlaceOrder = async () => {
    setErrorMsg('');

    if (!items || items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (pickupType === 'SCHEDULED' && !selectedSlotId) {
      setErrorMsg('Please select a pickup time slot for scheduled collection.');
      return;
    }

    setLoading(true);

    try {
      // 1. Send Order to Backend (Prices and stock will be verified server-side!)
      const orderPayload = {
        items: items.map((it) => ({
          productId: it.productId,
          unitVariant: it.unitVariant || 'default',
          quantity: it.quantity,
        })),
        pickupType,
        pickupSlotId: pickupType === 'SCHEDULED' ? selectedSlotId : null,
        paymentMethod,
        notes: notes.trim() || null,
        idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };

      const res = await api.post('/orders', orderPayload);

      if (!res.success) {
        throw new Error(res.message || 'Failed to place order');
      }

      const createdOrder = res.data;

      // 2. If Razorpay Online Payment selected:
      if (paymentMethod === 'RAZORPAY') {
        try {
          // Initialize Razorpay Order via Backend
          const rzpInit = await api.post('/payments/create-order', {
            orderNumber: createdOrder.orderNumber,
          });

          if (rzpInit.success && window.Razorpay) {
            // Launch Razorpay Checkout Modal
            const options = {
              key: rzpInit.data.keyId || 'rzp_test_quickpick2026',
              amount: rzpInit.data.amount,
              currency: rzpInit.data.currency,
              name: 'QuickPick Fresh Market',
              description: `Click & Collect Order #${createdOrder.orderNumber}`,
              order_id: rzpInit.data.razorpayOrderId,
              prefill: {
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
              },
              theme: {
                color: '#16a34a',
              },
              handler: async (response) => {
                // Verify signature on backend
                try {
                  await api.post('/payments/verify', {
                    orderNumber: createdOrder.orderNumber,
                    razorpayOrderId: response.razorpay_order_id || rzpInit.data.razorpayOrderId,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  });
                } catch (vErr) {
                  console.warn('Payment verification notice:', vErr.message);
                }
                finishOrder(createdOrder.orderNumber);
              },
              modal: {
                ondismiss: () => {
                  // User closed Razorpay modal: order remains in PLACED state with PENDING payment
                  finishOrder(createdOrder.orderNumber);
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            return;
          } else {
            // In headless/test mode where Razorpay script simulated
            await api.post('/payments/verify', {
              orderNumber: createdOrder.orderNumber,
              razorpayOrderId: `order_test_${Date.now()}`,
              razorpayPaymentId: `pay_test_${Date.now()}`,
              razorpaySignature: 'simulated_test_signature',
            });
            finishOrder(createdOrder.orderNumber);
            return;
          }
        } catch (payErr) {
          console.warn('Payment handling notice:', payErr.message);
          finishOrder(createdOrder.orderNumber);
          return;
        }
      }

      // 3. For Cash-on-Pickup or direct completion
      finishOrder(createdOrder.orderNumber);
    } catch (err) {
      setErrorMsg(err.message || 'Error processing your order. Please check item availability.');
    } finally {
      setLoading(false);
    }
  };

  const finishOrder = (orderNum) => {
    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#f59e0b', '#3b82f6'],
      });
    } catch {}

    refreshCart();

    if (onOrderPlaced) {
      onOrderPlaced(orderNum);
    } else {
      window.location.hash = `#order/${orderNum}`;
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Add fresh groceries to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onBackToShopping}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition"
        >
          Return to Store
        </button>
      </div>
    );
  }

  // Group slots by date for clean picker
  const slotsByDate = {};
  availableSlots.forEach((slot) => {
    if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
    slotsByDate[slot.date].push(slot);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <button
          onClick={onBackToShopping}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Click & Collect Express Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-8">
          Review your items, choose your pickup time, and confirm your order.
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Unable to place order</p>
              <p className="text-xs mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Form: Pickup Option & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Store Pickup Location Confirmation */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Collection Location</h3>
                  <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    Counter Pickup Only
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>QuickPick Fresh Market</strong> — Shop #4, Green Glen Plaza, 100 Feet Road, Bangalore, KA 560103
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Express pickup counter is located at the front entrance. Show your digital QR code upon arrival.
                </p>
              </div>
            </div>

            {/* 2. Pickup Timing Preference */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">Pickup Timing</h3>
              </div>

              {/* Toggle ASAP vs Scheduled */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPickupType('ASAP')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    pickupType === 'ASAP'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupType"
                    checked={pickupType === 'ASAP'}
                    onChange={() => setPickupType('ASAP')}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <p className="text-sm font-bold flex items-center gap-1.5">
                      <span>ASAP Rapid Pickup</span>
                      <span className="text-[10px] bg-brand-200/80 text-brand-900 px-1.5 py-0.2 rounded font-bold">
                        Fastest
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Groceries prepared immediately. Ready in approx. 15–20 minutes.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setPickupType('SCHEDULED')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    pickupType === 'SCHEDULED'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupType"
                    checked={pickupType === 'SCHEDULED'}
                    onChange={() => setPickupType('SCHEDULED')}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <p className="text-sm font-bold">Scheduled Collection Slot</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose a convenient 30-minute collection window today or tomorrow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Slots Selector (if SCHEDULED) */}
              {pickupType === 'SCHEDULED' && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Available Collection Windows:
                  </label>

                  {loadingSlots ? (
                    <div className="py-6 flex items-center justify-center text-slate-400 gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                      <span>Loading store capacity slots...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(slotsByDate).map((dateKey) => (
                        <div key={dateKey}>
                          <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-brand-600" />
                            <span>{formatDate(dateKey)}</span>
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {slotsByDate[dateKey].map((slot) => {
                              const isSelected = selectedSlotId === slot.id;
                              const isFull = !slot.isAvailable;
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  disabled={isFull}
                                  onClick={() => setSelectedSlotId(slot.id)}
                                  className={`p-2.5 rounded-xl text-left border text-xs transition ${
                                    isSelected
                                      ? 'bg-brand-600 text-white border-brand-600 font-bold shadow-sm'
                                      : isFull
                                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                                  }`}
                                >
                                  <div className="font-bold">
                                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                  </div>
                                  <div
                                    className={`text-[10px] mt-0.5 ${
                                      isSelected
                                        ? 'text-brand-100'
                                        : isFull
                                        ? 'text-rose-500'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {isFull ? 'Full' : `${slot.remainingCapacity} slots left`}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle space-y-4">
              <h3 className="text-base font-bold text-slate-900">Payment Option</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <CreditCard className="w-4 h-4 text-brand-600" />
                      <span>Razorpay Online</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      UPI (GPay/PhonePe), Credit/Debit Cards, NetBanking.
                    </p>
                    <span className="text-[10px] text-brand-700 font-semibold bg-brand-100/70 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                      Instant Confirmation
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('CASH_ON_PICKUP')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    paymentMethod === 'CASH_ON_PICKUP'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CASH_ON_PICKUP'}
                    onChange={() => setPaymentMethod('CASH_ON_PICKUP')}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Pay at Store Counter</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Pay with Cash, UPI, or Card directly when collecting groceries.
                    </p>
                    <span className="text-[10px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                      Zero Advance Payment
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Special Order Instructions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Packing Instructions or Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please select ripe bananas, keep dairy in a cold pouch, or handle bread loaf gently..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card sticky top-24 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold text-slate-500">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </h3>

              {/* Items Preview List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2.5">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded text-[11px]">
                        {item.quantity}x
                      </span>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.unitVariant !== 'default' ? item.unitVariant : item.defaultUnit}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatCurrency(item.itemTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>{formatCurrency(estimatedTax)}</span>
                </div>
                <div className="flex justify-between text-brand-700 font-semibold">
                  <span>Store Click & Collect Pickup</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-brand-700">{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-extrabold text-sm shadow-md shadow-brand-600/25 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving Stock & Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Pickup Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center space-y-1">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  <span>Real-time inventory reservation protected</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Unique secure pickup QR token will be generated upon order placement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
