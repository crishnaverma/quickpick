import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../../components/customer/HeroBanner';
import { CategoryPill } from '../../components/customer/CategoryPill';
import { ProductCard } from '../../components/customer/ProductCard';
import { HowItWorks } from '../../components/customer/HowItWorks';
import { ProductDetailModal } from '../../components/customer/ProductDetailModal';
import api from '../../services/api';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Loader2, MapPin, Clock, Phone, AlertCircle } from 'lucide-react';

export const HomePage = ({ currentSearch = '', currentCategory = '', onCategoryChange, onClearSearch }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      await api.post('/seed');
      // Refetch categories and products
      const catsRes = await api.get('/products/categories');
      if (catsRes.success) setCategories(catsRes.data);
      const prodsRes = await api.get('/products');
      if (prodsRes.success) setProducts(prodsRes.data.products);
    } catch (err) {
      alert('Seeding failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  // Sync category with parent prop if provided
  useEffect(() => {
    if (currentCategory !== undefined) {
      setSelectedCategory(currentCategory);
    }
  }, [currentCategory]);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/products/categories');
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on filters
  useEffect(() => {
    const fetchProds = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (currentSearch) params.append('search', currentSearch);
        if (selectedSort) params.append('sort', selectedSort);
        if (inStockOnly) params.append('inStock', 'true');

        const res = await api.get(`/products?${params.toString()}`);
        if (res.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.warn('Failed to load products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProds();
  }, [selectedCategory, currentSearch, selectedSort, inStockOnly]);

  const handleCategoryClick = (slug) => {
    const next = selectedCategory === slug ? '' : slug;
    setSelectedCategory(next);
    if (onCategoryChange) onCategoryChange(next);
  };

  const handleScrollToCatalogue = () => {
    const el = document.getElementById('catalogue-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        {!currentSearch && <HeroBanner onExploreClick={handleScrollToCatalogue} />}

        {/* Categories Horizontal Strip */}
        <div className="py-4 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 border ${
              !selectedCategory
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              category={cat}
              isSelected={selectedCategory === cat.slug}
              onClick={handleCategoryClick}
            />
          ))}
        </div>

        {/* Search Results Notice Banner if Search is active */}
        {currentSearch && (
          <div className="my-4 p-4 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-800 font-semibold">Search Results</p>
              <h3 className="text-base font-bold text-slate-900">
                Showing items matching "{currentSearch}"
              </h3>
            </div>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="px-3 py-1.5 bg-white border border-brand-300 rounded-lg text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Products Section */}
        <section id="catalogue-section" className="py-8">
          {/* Controls Bar: Sort & In-Stock filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>
                  {selectedCategory
                    ? categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
                    : 'Fresh Groceries for Pickup'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                  {products.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Handpicked at our store upon your order placement
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* In-stock toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>In Stock Only</span>
              </label>

              {/* Sort Selector */}
              <div className="relative flex items-center">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none pr-8 cursor-pointer"
                >
                  <option value="popular">Popular Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
              <p className="text-xs font-medium">Loading grocery catalogue...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto shadow-sm">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-base">
                {categories.length === 0 ? 'No Products Found in Store Database' : 'No products match your criteria'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {categories.length === 0
                  ? 'Your database has been created, but product data has not been seeded yet.'
                  : 'Try selecting a different category or clearing search filters.'}
              </p>
              
              {categories.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-xs text-emerald-800 font-medium mb-3">
                    Click below to populate the store with 22 grocery products, 9 categories, pickup slots, and demo accounts:
                  </p>
                  <button
                    onClick={handleSeedDatabase}
                    disabled={seeding}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mx-auto shadow-md"
                  >
                    {seeding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Seeding Database...</span>
                      </>
                    ) : (
                      <>
                        <span>🌱 Seed Demo Grocery Catalogue</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    if (onClearSearch) onClearSearch();
                  }}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetail={(p) => setActiveModalProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* How Click & Collect Works */}
        {!currentSearch && <HowItWorks />}

        {/* Store Location & Collection Desk Info Card */}
        <div className="my-10 bg-gradient-to-r from-brand-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Store Pickup Counter
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              QuickPick Fresh Market Collection Desk
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200 flex items-center justify-center md:justify-start gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              Shop #4, Green Glen Plaza, 100 Feet Road, Bangalore, KA 560103
            </p>
            <p className="text-xs text-emerald-300/80 flex items-center justify-center md:justify-start gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              Pickup desk active 7:00 AM – 10:00 PM every day
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0">
            <p className="text-xs text-emerald-200">Order online & walk in</p>
            <p className="text-xl font-extrabold text-white mt-1">Ready in ~15 mins</p>
            <p className="text-[11px] text-brand-300 mt-1">No packaging fees • No delivery charges</p>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      )}
    </div>
  );
};
