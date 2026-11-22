import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../contexts/CartContext';

export const ProductCard = ({ product, onOpenDetail }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants[0].label;
    }
    return 'default';
  });
  const [isAdding, setIsAdding] = useState(false);

  // Calculate current price based on selected variant
  let currentPrice = Number(product.price);
  if (selectedVariant !== 'default' && product.variants) {
    const match = product.variants.find((v) => v.label === selectedVariant);
    if (match) {
      if (match.price) currentPrice = Number(match.price);
      else if (match.multiplier) currentPrice = Math.round(Number(product.price) * match.multiplier * 100) / 100;
    }
  }

  // Check if item is already in cart for selected variant
  const cartItem = items.find(
    (it) => it.productId === product.id && it.unitVariant === selectedVariant
  );
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = !isOutOfStock && product.availableStock <= product.minStockThreshold;

  // Discount percentage
  let discountPercent = 0;
  if (product.compareAtPrice && product.compareAtPrice > currentPrice) {
    discountPercent = Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100);
  }

  const handleAddClick = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    await addToCart(product.id, selectedVariant, 1);
    setIsAdding(false);
  };

  const handleIncrement = async (e) => {
    e.stopPropagation();
    if (cartItem && cartItem.quantity < product.availableStock) {
      await updateQuantity(cartItem.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = async (e) => {
    e.stopPropagation();
    if (cartItem) {
      await updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(product)}
      className="group bg-white rounded-2xl border border-slate-100 shadow-subtle hover:shadow-card hover:border-brand-200 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
              Only {product.availableStock} left
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1">
            {product.category?.name || 'Fresh Grocery'}
          </p>

          {/* Product Name */}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition line-clamp-2">
            {product.name}
          </h3>

          {/* Unit / Weight Options (e.g. 500g, 1kg) */}
          {product.variants && Array.isArray(product.variants) && product.variants.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2.5" onClick={(e) => e.stopPropagation()}>
              {product.variants.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => setSelectedVariant(v.label)}
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border transition ${
                    selectedVariant === v.label
                      ? 'bg-brand-50 border-brand-500 text-brand-800 ring-1 ring-brand-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-1 font-medium">{product.defaultUnit}</p>
          )}
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(currentPrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block">
              per {selectedVariant !== 'default' ? selectedVariant : product.defaultUnit}
            </span>
          </div>

          {/* Add / Quantity Button */}
          {inCartQty > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center border border-brand-600 bg-brand-50 rounded-xl overflow-hidden shadow-xs"
            >
              <button
                onClick={handleDecrement}
                className="px-2.5 py-1.5 text-brand-700 hover:bg-brand-100 transition"
                aria-label="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold text-brand-900">{inCartQty}</span>
              <button
                onClick={handleIncrement}
                disabled={inCartQty >= product.availableStock}
                className="px-2.5 py-1.5 text-brand-700 hover:bg-brand-100 transition disabled:opacity-30"
                aria-label="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              disabled={isOutOfStock || isAdding}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
