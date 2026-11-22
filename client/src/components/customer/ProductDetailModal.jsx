import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../contexts/CartContext';

export const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  const { addToCart, items, updateQuantity } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants[0].label;
    }
    return 'default';
  });
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Calculate current price based on selected variant
  let currentPrice = Number(product.price);
  if (selectedVariant !== 'default' && product.variants) {
    const match = product.variants.find((v) => v.label === selectedVariant);
    if (match) {
      if (match.price) currentPrice = Number(match.price);
      else if (match.multiplier) currentPrice = Math.round(Number(product.price) * match.multiplier * 100) / 100;
    }
  }

  const isOutOfStock = product.availableStock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    const res = await addToCart(product.id, selectedVariant, qty);
    setIsAdding(false);
    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-float overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Image */}
        <div className="md:w-1/2 bg-slate-100 relative min-h-[260px] md:min-h-full">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="md:hidden absolute top-3 right-3 p-2 bg-slate-900/60 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Right Details */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                {product.category?.name || 'Grocery'}
              </span>
              <button
                onClick={onClose}
                className="hidden md:block p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mt-2 leading-snug">
              {product.name}
            </h2>

            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              {product.description || 'Freshly stocked high quality produce prepared for quick store collection.'}
            </p>

            {/* Price Box */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(currentPrice)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-xs text-slate-400 line-through ml-2">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
                <span className="text-xs text-slate-500 block mt-0.5">
                  Unit: {selectedVariant !== 'default' ? selectedVariant : product.defaultUnit}
                </span>
              </div>

              <div>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                    ✓ In Stock ({product.availableStock} available)
                  </span>
                )}
              </div>
            </div>

            {/* Weight / Pack Variant Selector */}
            {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Quantity / Weight Variant:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.label}
                      type="button"
                      onClick={() => setSelectedVariant(v.label)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left border transition ${
                        selectedVariant === v.label
                          ? 'border-brand-600 bg-brand-50/80 text-brand-900 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{v.label}</span>
                        {v.price && (
                          <span className="text-slate-900 font-extrabold">{formatCurrency(v.price)}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Freshness Promise */}
            <div className="mt-4 p-2.5 bg-brand-50/50 rounded-xl border border-brand-100 flex items-center gap-2 text-xs text-brand-800">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Checked for peak freshness by staff before packing</span>
            </div>
          </div>

          {/* Quantity and Add CTA */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="p-2 hover:bg-slate-100 text-slate-600 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-slate-900">{qty}</span>
              <button
                onClick={() => setQty((prev) => Math.min(product.availableStock, prev + 1))}
                disabled={qty >= product.availableStock}
                className="p-2 hover:bg-slate-100 text-slate-600 transition disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                addedSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {qty > 1 ? `(${qty})` : ''} to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
