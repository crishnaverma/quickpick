import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  User,
  Phone,
  ShieldCheck,
  Check,
  Loader2,
  DollarSign,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminPickupScanPage = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [confirmingHandover, setConfirmingHandover] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState(null);

  // Ready orders list waiting for pickup
  const [readyOrders, setReadyOrders] = useState([]);
  const [loadingReady, setLoadingReady] = useState(false);

  const fetchReadyOrders = async () => {
    try {
      setLoadingReady(true);
      const res = await api.get('/admin/orders?status=READY');
      if (res.success) {
        setReadyOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Failed to load ready orders:', err.message);
    } finally {
      setLoadingReady(false);
    }
  };

  useEffect(() => {
    fetchReadyOrders();
  }, []);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    setVerifying(true);
    setVerificationResult(null);
    setVerificationError(null);
    setHandoverSuccess(null);

    try {
      const res = await api.post('/pickups/verify', {
        pickupToken: tokenInput.trim().toUpperCase(),
        orderNumber: orderNumberInput.trim() || undefined,
      });

      if (res.success) {
        setVerificationResult(res.data);
      } else {
        setVerificationError(res.message || 'Token verification failed');
      }
    } catch (err) {
      setVerificationError(err.message || 'Invalid token or order not ready.');
      if (err.errors?.isAlreadyCollected) {
        setVerificationError(`⚠️ FRAUD / DUPLICATE WARNING: Order was ALREADY COLLECTED on ${new Date(err.errors.collectedAt).toLocaleString()}`);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmHandover = async () => {
    if (!verificationResult) return;

    setConfirmingHandover(true);
    try {
      const res = await api.post('/pickups/confirm', {
        pickupToken: tokenInput.trim().toUpperCase(),
        notes: 'Groceries handed over at express counter',
      });

      if (res.success) {
        setHandoverSuccess(res.data);
        setVerificationResult(null);
        setTokenInput('');
        setOrderNumberInput('');
        fetchReadyOrders();
      }
    } catch (err) {
      alert(err.message || 'Handover confirmation failed');
    } finally {
      setConfirmingHandover(false);
    }
  };

  // Quick autofill token from ready list
  const handleSelectReadyOrder = (order) => {
    if (order.pickup?.pickupToken) {
      setTokenInput(order.pickup.pickupToken);
      setOrderNumberInput(order.orderNumber);
      // Auto verify
      setVerifying(true);
      setVerificationResult(null);
      setVerificationError(null);
      setHandoverSuccess(null);

      api.post('/pickups/verify', {
        pickupToken: order.pickup.pickupToken,
        orderNumber: order.orderNumber,
      })
        .then((res) => {
          if (res.success) setVerificationResult(res.data);
          else setVerificationError(res.message);
        })
        .catch((err) => {
          setVerificationError(err.message || 'Verification failed');
        })
        .finally(() => setVerifying(false));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Express Pickup Counter & QR Scanner
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan customer digital QR pass or enter pickup token to verify items and finalize handover
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scanner & Verification Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Token Input / QR Barcode Reader Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Scan Customer QR / Enter Token
                </h3>
                <p className="text-xs text-slate-500">
                  Point barcode scanner or type 16-character token from customer's phone
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pickup Token (from QR scan)
                  </label>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 6FDC885ABEBB13EC"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-base font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Order # (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    placeholder="QP-..."
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-3 text-sm font-mono text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying || !tokenInput.trim()}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Cryptographic Token with Backend...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Token & Fetch Order Checklist</span>
                  </>
                )}
              </button>
            </form>

            {/* Error / Alert Display */}
            {verificationError && (
              <div className="mt-5 p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Token Verification Failed</p>
                  <p className="mt-0.5 text-rose-700">{verificationError}</p>
                </div>
              </div>
            )}

            {/* Successful Handover Confirmation Banner */}
            {handoverSuccess && (
              <div className="mt-5 p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <h4 className="text-base font-extrabold">Handover Confirmed Successfully!</h4>
                </div>
                <p className="text-xs text-emerald-800">
                  Order <strong>#{handoverSuccess.orderNumber}</strong> has been marked as <strong>COLLECTED</strong>. Stock reservation was converted to finalized sale.
                </p>
                <div className="text-[11px] font-mono text-emerald-700 pt-1">
                  Recorded collection at: {new Date().toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Verification Result Inspection Card */}
          {verificationResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-500 shadow-card space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    ✓ Valid Customer Pass
                  </span>
                  <h3 className="text-xl font-black font-mono text-slate-900 mt-1">
                    {verificationResult.order.orderNumber}
                  </h3>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">Customer Name</p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {verificationResult.order.user?.name}
                  </p>
                  <p className="text-xs text-slate-500">{verificationResult.order.user?.phone}</p>
                </div>
              </div>

              {/* Amount Due Pill */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Payment Status:</p>
                  <p className="text-sm font-bold text-slate-800">
                    {verificationResult.paymentMethod === 'RAZORPAY' ? 'Paid Online via Razorpay' : 'Pay at Counter (Cash/Card/UPI)'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 font-semibold">Amount to Collect:</p>
                  <p className="text-xl font-black text-brand-700">
                    {verificationResult.amountDue > 0
                      ? formatCurrency(verificationResult.amountDue)
                      : '₹0.00 (PAID)'}
                  </p>
                </div>
              </div>

              {/* Checklist for Staff */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Verify Bag Contents Before Handover ({verificationResult.order.items?.length || 0} items):
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {verificationResult.order.items?.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.unitVariant !== 'default' ? item.unitVariant : item.productUnit}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {item.quantity}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Handover CTA */}
              <button
                type="button"
                onClick={handleConfirmHandover}
                disabled={confirmingHandover}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 active:scale-95"
              >
                {confirmingHandover ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Recording Collection & Finalizing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Handover & Mark Order Collected</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Waiting Ready Orders list */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Ready at Counter ({readyOrders.length})
              </h3>
              <p className="text-[11px] text-slate-500">Packed and waiting for customer arrival</p>
            </div>
            <button
              onClick={fetchReadyOrders}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingReady ? (
            <div className="py-12 flex items-center justify-center text-slate-400 gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>Checking counter orders...</span>
            </div>
          ) : readyOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-700">No orders currently waiting</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Orders marked as READY on the order board will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => handleSelectReadyOrder(ord)}
                  className="p-3 bg-slate-50 hover:bg-brand-50/60 border border-slate-200/70 hover:border-brand-300 rounded-2xl transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                      {ord.user?.name}
                    </span>
                    <span className="font-black text-slate-900">
                      {formatCurrency(ord.totalAmount)}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-200/40">
                    <span>Token: {ord.pickup?.pickupToken}</span>
                    <span className="text-brand-700 font-bold flex items-center gap-0.5">
                      Verify <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
