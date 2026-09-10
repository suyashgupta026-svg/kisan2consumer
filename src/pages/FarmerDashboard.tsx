import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, PlusCircle, Package, ShoppingBag, TrendingUp, LogOut, CheckCircle,
  AlertCircle, Trash2, Edit3, Eye, EyeOff, RefreshCw, Clock, Truck,
  MapPin, Check, X, Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Product, Order, FarmerEarnings } from '../types';
import BackendStatusBadge from '../components/BackendStatusBadge';
import ApiDocsModal from '../components/ApiDocsModal';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy', 'Spices'];
const UNITS = ['kg', 'quintal', 'liter', 'dozen', 'bunch'];

export default function FarmerDashboard() {
  const { user, logout, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'add' | 'products' | 'orders' | 'earnings'>('products');
  const [docsOpen, setDocsOpen] = useState(false);

  // Add Product Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    price: '',
    location: user?.location || 'Gorakhpur, UP',
    description: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Earnings state
  const [earnings, setEarnings] = useState<FarmerEarnings | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);

  // Editing product inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');

  // Auto-login helper if visiting /farmer directly without logging in
  async function handleAutoFarmerLogin() {
    await quickLoginAs('farmer');
  }

  // Load data for active tab
  async function loadProducts() {
    if (!user) return;
    setProductsLoading(true);
    try {
      const data = await api.getProducts({ farmer_id: user.id });
      setProducts(data);
    } catch (err) {
      console.warn('Could not load products:', err);
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadOrders() {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const data = await api.getFarmerOrders();
      setOrders(data);
    } catch (err) {
      console.warn('Could not load farmer orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadEarnings() {
    if (!user) return;
    setEarningsLoading(true);
    try {
      const data = await api.getFarmerEarnings();
      setEarnings(data);
    } catch (err) {
      console.warn('Could not load earnings:', err);
    } finally {
      setEarningsLoading(false);
    }
  }

  useEffect(() => {
    if (user && user.role === 'farmer') {
      if (activeTab === 'products') loadProducts();
      if (activeTab === 'orders') loadOrders();
      if (activeTab === 'earnings') loadEarnings();
    }
  }, [user, activeTab]);

  // Handle Add Product submit
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);
    setAddLoading(true);

    try {
      if (!formData.name.trim() || !formData.quantity || !formData.price) {
        throw new Error('Please fill in crop name, quantity, and price');
      }

      const created = await api.createProduct({
        name: formData.name.trim(),
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price: parseFloat(formData.price),
        location: formData.location.trim() || user?.location || 'Farm Direct',
        description: formData.description.trim(),
      });

      setAddSuccess(`"${created.name}" listed successfully in the live database!`);
      setFormData({
        name: '',
        category: 'Vegetables',
        quantity: '',
        unit: 'kg',
        price: '',
        location: user?.location || 'Gorakhpur, UP',
        description: '',
      });
      loadProducts();
    } catch (err: any) {
      setAddError(err.message || 'Failed to list product');
    } finally {
      setAddLoading(false);
    }
  }

  // Handle Product Visibility Toggle
  async function handleToggleActive(p: Product) {
    try {
      await api.updateProduct(p.id, { is_active: !p.is_active });
      loadProducts();
    } catch (err) {
      console.error('Failed to toggle product status:', err);
    }
  }

  // Handle Save Edit
  async function handleSaveEdit(productId: number) {
    try {
      const updates: any = {};
      if (editPrice) updates.price = parseFloat(editPrice);
      if (editQty) updates.quantity = parseFloat(editQty);
      await api.updateProduct(productId, updates);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  }

  // Handle Delete Product
  async function handleDeleteProduct(productId: number, productName: string) {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from your listings?`)) {
      return;
    }
    try {
      await api.deleteProduct(productId);
      loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  }

  // Handle Order Status Update
  async function handleUpdateOrderStatus(orderId: number, newStatus: string) {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }

  // If not logged in as farmer, show helpful quick login prompt
  if (!user || user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-emerald-950">Farmer Portal Authentication</h2>
          <p className="text-xs text-slate-600">
            You need a verified Farmer account to manage crop inventory, process direct orders, and review earnings.
          </p>
          <div className="pt-2 space-y-2">
            <button
              id="instant-demo-farmer-login"
              onClick={handleAutoFarmerLogin}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition-colors"
            >
              Sign In as Demo Farmer (Raj Kumar)
            </button>
            <Link
              to="/login?role=farmer"
              className="block w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Sign In with Custom Farmer Credentials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-emerald-100 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-emerald-950 text-base leading-tight block">
                Kisan2Consumer
              </span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block -mt-0.5">
                Farmer Portal
              </span>
            </div>
          </Link>

          {/* Farmer Profile Card */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
            <p className="text-xs font-bold text-emerald-950">{user.name}</p>
            <p className="text-[11px] text-emerald-700/80 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-600" />
              {user.location || 'Gorakhpur, UP'}
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full">
              Verified Farmer
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              id="tab-my-products"
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                activeTab === 'products'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Produce Listings</span>
            </button>

            <button
              id="tab-add-product"
              onClick={() => setActiveTab('add')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                activeTab === 'add'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Crop</span>
            </button>

            <button
              id="tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                activeTab === 'orders'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Incoming Orders</span>
            </button>

            <button
              id="tab-earnings"
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                activeTab === 'earnings'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Earnings & Payouts</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-100 space-y-2">
          <button
            onClick={() => setDocsOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            <Server className="w-3.5 h-3.5" /> FastAPI Swagger Docs
          </button>

          <button
            id="farmer-logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-emerald-100 px-6 flex items-center justify-between">
          <h1 className="text-base font-extrabold text-slate-900 capitalize">
            {activeTab === 'products' && 'My Produce Inventory'}
            {activeTab === 'add' && 'List New Farm Harvest'}
            {activeTab === 'orders' && 'Consumer Orders & Fulfillment'}
            {activeTab === 'earnings' && 'Direct Farmer Earnings'}
          </h1>

          <div className="flex items-center gap-3">
            <BackendStatusBadge onOpenDocs={() => setDocsOpen(true)} />
            <Link
              to="/consumer"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              Preview Consumer Store →
            </Link>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: ADD PRODUCT */}
          {activeTab === 'add' && (
            <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-slate-900">List Produce Direct to Consumers</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your crops will instantly appear on the consumer marketplace with transparent pricing.
                </p>
              </div>

              {addSuccess && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{addSuccess}</span>
                </div>
              )}

              {addError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Crop / Produce Name *</label>
                    <input
                      id="crop-name-input"
                      type="text"
                      required
                      placeholder="e.g. Organic Tomatoes, Sharbati Wheat"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      id="crop-category-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Available Quantity *</label>
                    <input
                      id="crop-quantity-input"
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      placeholder="e.g. 150"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Measurement Unit *</label>
                    <select
                      id="crop-unit-select"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price per Unit (₹) *</label>
                    <input
                      id="crop-price-input"
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="e.g. 35"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm / Village Location</label>
                  <input
                    id="crop-location-input"
                    type="text"
                    placeholder="e.g. Rampur Village, Gorakhpur, UP"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Notes / Organic Practices (Optional)</label>
                  <textarea
                    id="crop-description-input"
                    rows={3}
                    placeholder="Tell consumers how it was grown, harvest freshness, cultivar type..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="submit-create-product-btn"
                    disabled={addLoading}
                    className="py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {addLoading ? 'Saving to Database...' : 'Publish Produce Listing'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MY PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Listed Produce Items</h2>
                  <p className="text-xs text-slate-500">Live crops linked directly to your farmer profile.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadProducts}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${productsLoading ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Produce
                  </button>
                </div>
              </div>

              {productsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading inventory from SQLite database...</div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No produce listed yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Publish your first harvest to start receiving orders directly from consumers.
                  </p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
                  >
                    Add Your First Crop
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => {
                    const isEditing = editingId === p.id;

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {p.category}
                              </span>
                              <h3 className="font-extrabold text-sm text-slate-900 mt-1">{p.name}</h3>
                            </div>
                            <button
                              onClick={() => handleToggleActive(p)}
                              title={p.is_active ? 'Click to pause listing' : 'Click to make active'}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                                p.is_active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {p.is_active ? 'Active' : 'Hidden'}
                            </button>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                            {p.description || 'Direct farm harvest'}
                          </p>

                          {/* Price & Stock Edit State */}
                          {isEditing ? (
                            <div className="p-3 bg-slate-50 rounded-xl space-y-2 mb-3 text-xs">
                              <div>
                                <label className="text-[10px] font-bold text-slate-600">Price (₹/{p.unit})</label>
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-600">Stock ({p.unit})</label>
                                <input
                                  type="number"
                                  value={editQty}
                                  onChange={(e) => setEditQty(e.target.value)}
                                  className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                                />
                              </div>
                              <div className="flex gap-1.5 pt-1">
                                <button
                                  onClick={() => handleSaveEdit(p.id)}
                                  className="flex-1 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold hover:bg-emerald-800"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="flex-1 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-bold hover:bg-slate-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mb-3">
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Rate</p>
                                <p className="font-mono font-extrabold text-sm text-emerald-800">
                                  ₹{p.price} <span className="text-[10px] text-slate-500 font-normal">/{p.unit}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Remaining Stock</p>
                                <p className="font-mono font-bold text-xs text-slate-800">
                                  {p.quantity} {p.unit}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setEditPrice(String(p.price));
                              setEditQty(String(p.quantity));
                            }}
                            className="text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Quick Edit
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Direct Customer Orders</h2>
                  <p className="text-xs text-slate-500">Orders placed by consumers for your farm produce.</p>
                </div>
                <button
                  onClick={loadOrders}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {ordersLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading orders from backend...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No consumer orders yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When customers buy your produce through the app, orders will appear here for packing and dispatch.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-slate-900">{ord.order_number}</span>
                            <span className="text-xs text-slate-500 font-medium">
                              · Placed on {new Date(ord.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Customer: <strong className="text-slate-900">{ord.consumer_name}</strong> ({ord.consumer_email})
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {ord.delivery_address}
                          </p>
                        </div>

                        {/* Status dropdown */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-600">Status:</label>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ord.status === 'Out for Delivery'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : ord.status === 'Confirmed'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-50 text-slate-800 border-slate-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-slate-50 rounded-xl p-3 divide-y divide-slate-200/60 text-xs">
                        {ord.items.map((it) => (
                          <div key={it.id} className="py-1.5 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-800">{it.product_name}</span>
                              <span className="text-slate-500 ml-2">
                                {it.quantity} {it.unit} @ ₹{it.unit_price}/{it.unit}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              ₹{it.total_price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500">Payment: {ord.payment_method} · Status: {ord.payment_status}</span>
                        <div className="text-right">
                          <span className="text-slate-500 text-xs">Your Harvest Revenue: </span>
                          <span className="font-mono font-extrabold text-emerald-800 text-sm">
                            ₹{ord.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Farmer Direct Payouts & Analytics</h2>
                <p className="text-xs text-slate-500">Calculated in real-time from completed and pending consumer orders.</p>
              </div>

              {earningsLoading || !earnings ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading analytics from FastAPI...</div>
              ) : (
                <>
                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Sales Volume</p>
                      <p className="text-3xl font-extrabold font-mono text-emerald-950 mt-2">
                        ₹{earnings.total_revenue.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-emerald-600/70 mt-1">Across {earnings.total_orders_count} consumer orders</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivered & Settled</p>
                      <p className="text-3xl font-extrabold font-mono text-emerald-700 mt-2">
                        ₹{earnings.delivered_revenue.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-emerald-600/70 mt-1">{earnings.delivered_orders_count} orders successfully delivered</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Payouts</p>
                      <p className="text-3xl font-extrabold font-mono text-amber-700 mt-2">
                        ₹{earnings.pending_revenue.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-amber-600/70 mt-1">{earnings.pending_orders_count} orders in fulfillment</p>
                    </div>
                  </div>

                  {/* Produce Breakdown Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <h3 className="font-extrabold text-xs text-slate-800">Crop-wise Revenue Breakdown</h3>
                      <span className="text-[11px] text-slate-500 font-semibold">Zero Commission Deducted</span>
                    </div>

                    {earnings.products_breakdown.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No crop sales recorded yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {earnings.products_breakdown.map((item) => (
                          <div key={item.product_name} className="p-4 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{item.product_name}</p>
                              <p className="text-[11px] text-slate-500">
                                Quantity Sold: {item.quantity_sold} {item.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-extrabold text-sm text-emerald-800">
                                ₹{item.revenue.toFixed(2)}
                              </p>
                              <p className="text-[10px] text-slate-400">100% Direct to Farmer</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      <ApiDocsModal isOpen={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
