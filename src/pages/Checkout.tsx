import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, ArrowLeft, CheckCircle2, ShieldCheck, MapPin, CreditCard,
  QrCode, Banknote, AlertCircle, ShoppingBasket, Truck, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CartItem, Order } from '../types';
import { api } from '../lib/api';
import BackendStatusBadge from '../components/BackendStatusBadge';

export default function Checkout() {
  const { user, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('k2c_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [address, setAddress] = useState(user?.location || 'Flat 402, Green Valley Apartments, Gomti Nagar, Lucknow');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = subtotal > 0 ? 20.0 : 0;
  const grandTotal = subtotal + deliveryFee;

  async function handleAutoLoginConsumer() {
    await quickLoginAs('consumer');
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError('Please sign in as a consumer to place your order.');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setError('Please provide a complete delivery address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await api.placeOrder({
        delivery_address: address.trim(),
        payment_method: paymentMethod,
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.qty,
        })),
      });

      // Clear local cart
      localStorage.removeItem('k2c_cart');
      setCart([]);
      setPlacedOrder(order);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  }

  // If order was successfully placed, render Order Confirmation Receipt
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl p-8 max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ACID Transaction Completed
            </span>
            <h1 className="text-2xl font-extrabold text-emerald-950 mt-2">Order Confirmed!</h1>
            <p className="text-xs text-slate-500 mt-1">
              Your order has been recorded in the SQLite database and sent directly to the farmers.
            </p>
          </div>

          {/* Receipt Box */}
          <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100/70 text-left text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
              <div>
                <p className="text-[10px] text-emerald-800/70 font-bold uppercase">Order Reference</p>
                <p className="font-mono font-extrabold text-sm text-emerald-950">{placedOrder.order_number}</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-700 text-white">
                {placedOrder.status}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] text-emerald-900/80 font-bold">Ordered Crops:</p>
              {placedOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between text-[11px] text-slate-700">
                  <span>
                    {it.product_name} × {it.quantity} {it.unit}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{it.total_price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-emerald-200/60 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">₹{placedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Direct Delivery:</span>
                <span className="font-mono font-bold">₹{placedOrder.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-950 font-extrabold text-sm pt-1">
                <span>Total Paid ({placedOrder.payment_method}):</span>
                <span className="font-mono text-emerald-800">₹{placedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 border-t border-emerald-200/60 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Delivering to: {placedOrder.delivery_address}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              to="/consumer"
              className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate('/consumer')}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
            >
              Track in My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-emerald-100 px-6 h-16 flex items-center justify-between shadow-xs">
        <Link to="/consumer" className="flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <BackendStatusBadge />
      </header>

      {/* Main Checkout Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Checkout & Direct Fulfillment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your payment goes 100% directly to the farmers whose crops are in your basket.
          </p>
        </div>

        {/* Empty cart warning */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <ShoppingBasket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Your basket is empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Please browse our fresh farmer produce catalog and add crops to your cart before proceeding to checkout.
            </p>
            <Link
              to="/consumer"
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 shadow"
            >
              Explore Fresh Produce →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="md:col-span-2 space-y-5">
              {/* User Account Banner if not signed in */}
              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-amber-900">Sign in to complete your order</p>
                    <p className="text-amber-700/80 text-[11px]">You can login with 1-click as demo consumer Priya Sharma.</p>
                  </div>
                  <button
                    onClick={handleAutoLoginConsumer}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 text-xs shadow-xs"
                  >
                    Quick Sign-In (Priya)
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePlaceOrder} id="checkout-form" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                {/* Delivery Address */}
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    Delivery Address
                  </h3>
                  <textarea
                    id="delivery-address-input"
                    rows={3}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Apartment number, street, landmark, city, postal code..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
                  <input
                    id="contact-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'upi'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                      <p className="text-xs">UPI Direct</p>
                      <span className="text-[10px] text-slate-400">GPay / PhonePe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                      <p className="text-xs">Debit / Card</p>
                      <span className="text-[10px] text-slate-400">Visa / RuPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'cod'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                      <p className="text-xs">Cash on Delivery</p>
                      <span className="text-[10px] text-slate-400">Pay at Doorstep</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="place-order-button"
                    disabled={submitting || !user}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-lime-600 hover:from-emerald-800 hover:to-lime-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all"
                  >
                    {submitting ? (
                      'Securing Order in Database...'
                    ) : (
                      <>
                        Confirm & Place Direct Order (₹{grandTotal.toFixed(2)})
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Order Summary ({cart.reduce((s, i) => s + i.qty, 0)} items)
                </h3>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.qty} {item.unit} · {item.farmer_name}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Produce Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Doorstep Fulfillment:</span>
                    <span className="font-mono font-bold text-slate-900">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-2 border-t border-slate-100">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Zero broker margin. 100% of the produce value is allocated to the grower upon delivery.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
