import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDateTime, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Package, QrCode, RotateCcw, ChevronRight, Loader2, ShoppingBag, Clock } from 'lucide-react';

export const OrderHistoryPage = ({ onSelectOrder, onStartShopping }) => {
  const { addToCart, openCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        if (res.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.warn('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const handleReorder = async (e, order) => {
    e.stopPropagation();
    for (const item of order.items) {
      await addToCart(item.productId, item.unitVariant, item.quantity);
    }
    openCart();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Grocery Orders
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track active click-and-collect orders or reorder past items
            </p>
          </div>

          <button
            onClick={onStartShopping}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop Fresh Groceries</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
            <p className="text-xs font-medium">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-subtle max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">No orders placed yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              When you order fresh groceries online, you can track their preparation and access your pickup QR pass here.
            </p>
            <button
              onClick={onStartShopping}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
            >
              Start Your First Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PLACED;
              const isReady = order.status === 'READY';
              const isCollected = order.status === 'COLLECTED';

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.orderNumber)}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-brand-300 transition duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {order.orderNumber}
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${statusCfg.color}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</span>
                    </div>

                    {/* Items thumbnail preview strip */}
                    <div className="flex items-center gap-2 overflow-hidden py-1">
                      {order.items?.slice(0, 4).map((it) => (
                        <div key={it.id} className="relative group shrink-0">
                          <img
                            src={
                              it.product?.images?.[0] ||
                              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={it.productName}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-100 bg-slate-50"
                            title={`${it.productName} (${it.quantity}x)`}
                          />
                          <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            {it.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <span className="text-xs text-slate-400 font-semibold pl-1">
                          +{order.items.length - 4} more
                        </span>
                      )}
                      <span className="text-xs text-slate-600 font-medium ml-2">
                        {order.items?.length} items ({order.pickupType === 'ASAP' ? 'ASAP' : order.pickup?.scheduledSlot || 'Slot'})
                      </span>
                    </div>
                  </div>

                  {/* Right side: Amount & QR / Reorder buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-2 shrink-0">
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleReorder(e, order)}
                        className="p-2 text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition"
                        title="Reorder items"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSelectOrder(order.orderNumber)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                          isReady
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce'
                            : 'bg-brand-50 text-brand-800 hover:bg-brand-100'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{isReady ? 'Show Pickup QR' : 'Track Order'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
