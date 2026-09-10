import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, ShoppingCart, Search, MapPin, Star, Plus, Minus, Trash2,
  X, CheckCircle, Clock, PackageCheck, Truck, ArrowRight, User as UserIcon,
  LogOut, RefreshCw, AlertCircle, Eye, ChevronRight
} from 'lucide-react';
import { Product, CartItem, Order } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import BackendStatusBadge from '../components/BackendStatusBadge';
import ApiDocsModal from '../components/ApiDocsModal';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy', 'Spices'];

export default function ConsumerHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('k2c_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('k2c_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch products from backend
  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts({
        category: selectedCategory,
        search: search.trim() || undefined,
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products from backend');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  // Handle search submit or debounce
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadProducts();
  }

  // Fetch orders for consumer
  async function loadMyOrders() {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await api.getConsumerOrders();
      setMyOrders(data);
    } catch (err) {
      console.warn('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }

  function handleOpenOrders() {
    setIsOrdersOpen(true);
    loadMyOrders();
  }

  // Cart Operations
  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.quantity) return prev; // max available stock
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function updateCartQty(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: Math.min(newQty, item.quantity) } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  const cartTotalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = cartSubtotal > 0 ? 20.0 : 0;
  const orderGrandTotal = cartSubtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-emerald-950 text-base leading-tight block">
                Kisan2Consumer
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block -mt-0.5">
                Consumer Store
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="consumer-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search farm tomatoes, rice, wheat, location..."
                className="w-full pl-9 pr-20 py-2 text-xs rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <BackendStatusBadge onOpenDocs={() => setDocsOpen(true)} />

            {/* My Orders Button */}
            {user && (
              <button
                id="view-my-orders-btn"
                onClick={handleOpenOrders}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>My Orders</span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              id="open-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors flex items-center justify-center"
              aria-label="Open Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-scale">
                  {cartTotalItems}
                </span>
              )}
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1">
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold text-emerald-950 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-emerald-600/80 font-medium">Consumer Account</p>
                </div>
                <button
                  id="consumer-logout-btn"
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login?role=consumer"
                className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-full transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner with district selector */}
      <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-lime-600 text-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold mb-2 border border-white/20">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Direct from Verified Local Farms
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Fresh Morning Harvest at Transparent Prices
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              100% of your payment directly supports farmers in your district. Zero middleman commission.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
            <MapPin className="w-4 h-4 text-amber-300" />
            <div>
              <p className="text-[10px] text-emerald-200">Delivery Location</p>
              <p className="font-bold">{user?.location || 'Lucknow / Gorakhpur, UP'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Categories Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={loadProducts}
            title="Refresh Produce"
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Status or Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadProducts}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && products.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="h-32 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No produce found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No products found in category "{selectedCategory}". Try clearing your search or switching categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearch('');
              }}
              className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-full hover:bg-emerald-800"
            >
              Show All Produce
            </button>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => {
            const inCart = cart.find((item) => item.id === p.id);
            const isOutOfStock = p.quantity <= 0;

            return (
              <div
                key={p.id}
                id={`product-card-${p.id}`}
                className="bg-white rounded-2xl border border-emerald-100/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Top image placeholder with category color */}
                  <div className="h-36 bg-gradient-to-br from-emerald-100/60 to-lime-100/40 p-4 flex flex-col justify-between relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-emerald-800 shadow-sm">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/80 text-white flex items-center gap-1 backdrop-blur-sm">
                        <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                        {p.rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-center my-auto">
                      <Sprout className="w-14 h-14 text-emerald-600/40 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium text-emerald-900/80 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        {p.location}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold shrink-0">{p.distance} km</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="font-extrabold text-slate-900 text-sm">{p.name}</h3>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-emerald-700 text-sm">
                          ₹{p.price}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">/{p.unit}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px] mt-1">
                      {p.description || 'Farm-fresh harvest picked and packed with care.'}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        Farmer: <strong className="text-slate-800">{p.farmer_name}</strong>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : p.quantity < 20
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOutOfStock ? 'Sold Out' : `${p.quantity} ${p.unit} left`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-0">
                  {inCart ? (
                    <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-1 border border-emerald-200">
                      <button
                        onClick={() => updateCartQty(p.id, -1)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-xs text-emerald-950">
                        {inCart.qty} {p.unit}
                      </span>
                      <button
                        onClick={() => updateCartQty(p.id, 1)}
                        disabled={inCart.qty >= p.quantity}
                        className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white font-bold flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`add-to-cart-${p.id}`}
                      onClick={() => addToCart(p)}
                      disabled={isOutOfStock}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {isOutOfStock ? 'Unavailable' : 'Add to Basket'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="font-extrabold text-base">Your Fresh Basket ({cartTotalItems})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-sm">Your basket is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Add fresh crops from local farmers!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {item.farmer_name} · ₹{item.price}/{item.unit}
                      </p>
                      <p className="font-mono font-bold text-xs text-emerald-800 mt-0.5">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono font-bold text-xs">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          disabled={item.qty >= item.quantity}
                          className="w-6 h-6 rounded bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 disabled:bg-slate-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Subtotal & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Harvest Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Local Direct Delivery:</span>
                  <span className="font-mono font-bold text-slate-900">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-700">₹{orderGrandTotal.toFixed(2)}</span>
                </div>

                <button
                  id="proceed-to-checkout-btn"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consumer Orders Modal */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5" />
                <h3 className="font-extrabold text-base">My Direct Orders & Delivery Tracking</h3>
              </div>
              <button
                onClick={() => setIsOrdersOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading your orders...</div>
              ) : myOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No orders yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When you order fresh crops, your order status and receipts will show here.
                  </p>
                </div>
              ) : (
                myOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-extrabold text-xs text-slate-900">{ord.order_number}</span>
                        <span className="text-[11px] text-slate-500 ml-2">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Out for Delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'Confirmed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200/60 text-xs">
                      {ord.items.map((it) => (
                        <div key={it.id} className="py-1.5 flex justify-between">
                          <span className="text-slate-700">
                            {it.product_name} × {it.quantity} {it.unit}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            ₹{it.total_price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Payment: {ord.payment_method} ({ord.payment_status})</span>
                      <span className="font-extrabold text-emerald-950">
                        Total: <span className="font-mono text-emerald-700">₹{ord.total.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsOrdersOpen(false)}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Docs Modal */}
      <ApiDocsModal isOpen={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
