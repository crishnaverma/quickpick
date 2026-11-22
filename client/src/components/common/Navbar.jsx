import React, { useState } from 'react';
import { ShoppingBag, Search, User, MapPin, Clock, LogOut, ShieldCheck, ChevronDown, PackageCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';

export const Navbar = ({ onSearch, currentSearch = '', onCategorySelect, currentCategory = '' }) => {
  const { user, isAuthenticated, isStaff, logout, openAuthModal } = useAuth();
  const { itemCount, subtotal, openCart } = useCart();
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      {/* Top Notification / Info Strip */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <strong className="text-white">Shop #4, Green Glen Plaza</strong> (Counter Pickup)
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Open Today: 7:00 AM – 10:00 PM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-700/60">
              ⚡ 15-Min Rapid Click & Collect
            </span>
            {isStaff && (
              <a
                href="#admin"
                className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded text-[11px] hover:bg-amber-300 transition flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                Staff Portal
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                QUICK<span className="text-brand-600">PICK</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-brand-100 text-brand-800 rounded">
                Click & Collect
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Fresh Grocery Store</p>
          </div>
        </a>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search fresh vegetables, fruits, dairy, snacks..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-xs font-semibold transition"
          >
            Search
          </button>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* My Orders (for logged-in customer) */}
          {isAuthenticated && (
            <a
              href="#orders"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
            >
              <PackageCheck className="w-4 h-4 text-brand-600" />
              <span>My Orders</span>
            </a>
          )}

          {/* User Account / Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[100px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <a
                    href="#orders"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <PackageCheck className="w-4 h-4 text-brand-600" />
                    Order History
                  </a>

                  {isStaff && (
                    <a
                      href="#admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 font-semibold hover:bg-amber-50 transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Admin Dashboard
                    </a>
                  )}

                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold transition"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Trigger Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-sm transition active:scale-95"
            aria-label="View Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">
              {itemCount > 0 ? formatCurrency(subtotal) : 'Cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search groceries..."
            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>
    </header>
  );
};
