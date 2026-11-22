import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';

export const CartDrawer = ({ onNavigateCheckout }) => {
  const {
    isCartOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    estimatedTax,
    estimatedTotal,
    hasStockIssues,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();

  if (!isCartOpen) return null;

  const minOrderAmount = 99;
  const remainingForMin = Math.max(0, minOrderAmount - subtotal);
  const minProgress = Math.min(100, Math.round((subtotal / minOrderAmount) * 100));

  const handleCheckoutClick = () => {
    closeCart();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (onNavigateCheckout) {
      onNavigateCheckout();
    } else {
      window.location.hash = '#checkout';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Your Grocery Cart</h3>
                <p className="text-xs text-slate-500">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} selected for click-and-collect
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimum Order Progress */}
          <div className="px-5 py-3 bg-brand-50/60 border-b border-brand-100/60 text-xs">
            {remainingForMin > 0 ? (
              <div>
                <p className="text-slate-700 font-medium mb-1.5 flex justify-between">
                  <span>Minimum order for store pickup: ₹99</span>
                  <span className="font-bold text-brand-700">Add {formatCurrency(remainingForMin)} more</span>
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full transition-all duration-300"
                    style={{ width: `${minProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-brand-800 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Minimum order reached! Eligible for express store pickup.</span>
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-slate-800 font-bold text-base mb-1">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Browse fresh fruits, vegetables, dairy, and household essentials to add to your order.
                </p>
                <button
                  onClick={closeCart}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="pt-3.5 first:pt-0 flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                  />

                  {/* Info & Quantity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-500 transition p-0.5"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-[11px] text-slate-600">
                        {item.unitVariant !== 'default' ? item.unitVariant : item.defaultUnit}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(item.unitPrice)}</span>
                    </div>

                    {/* Stock Alert */}
                    {(item.isOutOfStock || item.isExceedingStock) && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Only {item.availableStock} in stock</span>
                      </p>
                    )}

                    {/* Counter & Item Total */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {formatCurrency(item.itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-3">
              {/* Cost Summary */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (5%)</span>
                  <span>{formatCurrency(estimatedTax)}</span>
                </div>
                <div className="flex justify-between text-brand-700 font-medium">
                  <span>Store Click & Collect Pickup</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span className="text-brand-700">{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                disabled={remainingForMin > 0 || hasStockIssues}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <button
                  onClick={clearCart}
                  className="hover:text-rose-600 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Cart
                </button>
                <span>Express Counter Pickup</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
