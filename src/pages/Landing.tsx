import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, Users, TrendingUp, ShieldCheck, MapPin, Star, Menu, X,
  ArrowRight, ShoppingBasket, Handshake, BarChart3, Leaf, Server, Database
} from 'lucide-react';
import BackendStatusBadge from '../components/BackendStatusBadge';
import ApiDocsModal from '../components/ApiDocsModal';
import { api } from '../lib/api';
import { PlatformStats } from '../types';
import { useAuth } from '../context/AuthContext';

function Navbar({ onOpenDocs }: { onOpenDocs: () => void }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = ['How it Works', 'For Farmers', 'For Consumers', 'Impact'];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-emerald-950 text-lg tracking-tight block leading-tight">
              Kisan2Consumer
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold tracking-wide uppercase block -mt-0.5">
              Direct Agri Marketplace
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-emerald-800/70">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, '-')}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        {/* Right CTA and Status */}
        <div className="hidden md:flex items-center gap-3">
          <BackendStatusBadge onOpenDocs={onOpenDocs} />
          
          <button
            id="open-docs-btn-nav"
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 transition-colors"
          >
            <Server className="w-3.5 h-3.5" /> API Architecture
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'farmer' ? '/farmer' : '/consumer'}
                className="text-xs font-bold bg-emerald-800 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors"
              >
                Dashboard ({user.name.split(' ')[0]})
              </Link>
              <button
                onClick={logout}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-emerald-800 hover:text-emerald-950 font-semibold text-sm px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login?mode=signup"
                className="bg-gradient-to-r from-emerald-600 to-lime-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-shadow"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-emerald-900 p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Navigation"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-emerald-100 px-5 py-4 flex flex-col gap-3 text-emerald-800 font-semibold bg-white">
          <BackendStatusBadge onOpenDocs={onOpenDocs} />
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setOpen(false)}
              className="py-1"
            >
              {l}
            </a>
          ))}
          <button
            onClick={() => { setOpen(false); onOpenDocs(); }}
            className="flex items-center gap-1.5 py-1 text-xs text-emerald-700 font-bold"
          >
            <Server className="w-4 h-4" /> View FastAPI Endpoints & Docs
          </button>
          <div className="pt-2 border-t border-emerald-100 flex gap-2">
            <Link
              to="/login"
              className="flex-1 text-center py-2 text-sm text-emerald-800 font-bold bg-emerald-50 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/login?mode=signup"
              className="flex-1 text-center py-2 text-sm text-white font-bold bg-emerald-600 rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero({ onOpenDocs }: { onOpenDocs: () => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-lime-600">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-lime-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl" />
      <Leaf
        className="absolute -right-8 bottom-0 w-[380px] h-[380px] text-white/[0.06] rotate-[-10deg] pointer-events-none hidden lg:block"
        strokeWidth={1}
      />

      <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full mb-6 border border-white/20">
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> SIH 2026 · SIH26033 · FastAPI Backend Ready
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            From farm gate to
            <span className="block text-amber-300">your table — directly.</span>
          </h1>
          <p className="text-emerald-100 mt-5 text-base md:text-lg leading-relaxed max-w-md">
            Kisan2Consumer connects farmers directly to consumers — eliminating
            unnecessary middlemen, ensuring price transparency, and guaranteeing fresh harvest delivery.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link
              to="/farmer"
              className="bg-amber-400 text-emerald-950 font-bold px-6 py-3.5 rounded-full flex items-center gap-2 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/30 text-sm"
            >
              Sell as a Farmer <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/consumer"
              className="bg-white/15 backdrop-blur-sm text-white font-bold px-6 py-3.5 rounded-full border border-white/25 hover:bg-white/25 transition-colors text-sm flex items-center gap-2"
            >
              <ShoppingBasket className="w-4 h-4" /> Shop as a Consumer
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-4 text-xs text-emerald-100/80">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-lime-300" /> Bcrypt + JWT Secured
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-lime-300" /> SQLite Persistent DB
            </span>
            <button
              onClick={onOpenDocs}
              className="underline hover:text-white font-semibold flex items-center gap-1"
            >
              Interactive API Specs →
            </button>
          </div>
        </div>

        {/* Live Fresh Produce Showcase */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-emerald-700/70 uppercase tracking-wide">
              Fresh produce near you (Live DB)
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Direct Pricing
            </span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Tomatoes', farmer: 'Raj Kumar · Gorakhpur', price: '₹30/kg', tag: '2.4 km', stock: '120 kg' },
              { name: 'Basmati Rice', farmer: 'Meena Devi · Bareilly', price: '₹65/kg', tag: '5.1 km', stock: '350 kg' },
              { name: 'Organic Wheat', farmer: 'Suresh Yadav · Gorakhpur', price: '₹28/kg', tag: '3.8 km', stock: '500 kg' },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center text-white shadow-sm">
                    <ShoppingBasket className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-950 text-sm">{p.name}</p>
                    <p className="text-emerald-700/60 text-[11px]">{p.farmer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-extrabold text-emerald-800 text-sm">{p.price}</p>
                  <p className="text-[10px] text-emerald-600/70 flex items-center gap-0.5 justify-end">
                    <MapPin className="w-2.5 h-2.5" /> {p.tag} · {p.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600/70">Verified Farmers</span>
            <Link to="/consumer" className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
              Explore All 8+ Products →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getPlatformStats();
        setStats(data);
      } catch (err) {
        console.warn('Could not fetch stats:', err);
      }
    }
    loadStats();
  }, []);

  const statItems = [
    { value: '0% Middlemen', label: 'Direct farmer-to-consumer links' },
    { value: `${stats?.products_count ?? 8}+ Listed`, label: 'Fresh seasonal farm products' },
    { value: '₹20 Delivery', label: 'Flat local doorstep fulfillment' },
    { value: '100% Direct', label: 'Fair earnings directly to farmers' },
  ];

  return (
    <section className="bg-white border-b border-emerald-100">
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {statItems.map((s) => (
          <div key={s.label} className="text-center p-2">
            <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent">
              {s.value}
            </p>
            <p className="text-xs md:text-sm text-emerald-900/60 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Sprout,
      title: 'Farmer lists produce',
      desc: 'Set quantity, category, price, and location with responsive FastAPI CRUD endpoints in seconds.',
    },
    {
      icon: Handshake,
      title: 'Consumer discovers & orders',
      desc: 'Real-time search, category filters, distance metrics, and one-click checkout with secure order management.',
    },
    {
      icon: TrendingUp,
      title: 'Fair value, both sides',
      desc: 'Farmers earn 30–40% higher margins, consumers receive fresher produce at honest transparent prices.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-emerald-50/50 py-20">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-wide">How it works</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 mt-2">
            A shorter path from farm to table
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-7 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center mb-5 text-white shadow">
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-emerald-950 text-lg">{s.title}</h3>
              <p className="text-emerald-900/60 text-sm mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForFarmersConsumers() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-8">
        <div id="for-farmers" className="bg-gradient-to-br from-emerald-800 to-emerald-700 rounded-3xl p-8 text-white shadow-xl">
          <Sprout className="w-8 h-8 text-lime-300 mb-4" />
          <h3 className="text-2xl font-extrabold mb-3">For Farmers</h3>
          <p className="text-emerald-100 text-sm leading-relaxed mb-5">
            List your crops, set your own fair prices, track orders live, and review real earnings dashboards
            without giving away 20–30% in middleman commissions.
          </p>
          <ul className="space-y-2 text-sm mb-6">
            {['Direct market access', 'Real-time stock control', 'Digital order tracking', 'Automated earnings analytics'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-300" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/farmer"
            className="inline-flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-lime-300 transition-colors"
          >
            Launch Farmer Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div id="for-consumers" className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-3xl p-8 text-white shadow-xl">
          <ShoppingBasket className="w-8 h-8 text-white mb-4" />
          <h3 className="text-2xl font-extrabold mb-3">For Consumers</h3>
          <p className="text-amber-50 text-sm leading-relaxed mb-5">
            Buy farm-fresh, pesticide-free harvest directly from farmers in your district.
            Know the harvest source, farmer identity, and exact distance from your home.
          </p>
          <ul className="space-y-2 text-sm mb-6">
            {['Honest transparent prices', 'Fresh morning harvests', 'Direct farmer transparency', 'UPI, Card & COD Payment'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/consumer"
            className="inline-flex items-center gap-2 bg-white text-orange-900 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-amber-100 transition-colors"
          >
            Browse Consumer Store <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  const items = [
    { icon: Users, label: 'Farmers & FPOs', desc: 'Direct market discovery without predatory broker commissions.' },
    { icon: BarChart3, label: 'Consumers', desc: 'Verified farm-fresh produce with guaranteed weight and origin.' },
    { icon: ShieldCheck, label: 'Digital Agri Economy', desc: 'FastAPI REST architecture with ACID SQLite transactions and audit logs.' },
  ];

  return (
    <section id="impact" className="bg-emerald-50/50 py-20">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-wide">Impact</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 mt-2">
            Who this empowers, and how
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.label} className="bg-white rounded-2xl p-6 border border-emerald-100 text-center shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center mx-auto mb-4 text-white">
                <it.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-emerald-950">{it.label}</h3>
              <p className="text-emerald-900/60 text-sm mt-1">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-gradient-to-br from-emerald-800 to-lime-600 text-white py-16">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">Join the direct agri marketplace</h2>
        <p className="text-emerald-100 mt-3">Whether you harvest crops or feed a family — start today.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <Link
            to="/farmer"
            className="bg-amber-400 text-emerald-950 font-bold px-6 py-3.5 rounded-full flex items-center gap-2 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/30 text-sm"
          >
            Sell as a Farmer <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/consumer"
            className="bg-white/10 backdrop-blur-sm text-white font-bold px-6 py-3.5 rounded-full border border-white/25 hover:bg-white/20 transition-colors text-sm"
          >
            Shop as a Consumer
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-200/60 py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center text-white">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white text-sm">Kisan2Consumer</span>
        </div>
        <p className="text-xs">
          SIH 2026 · SIH26033 · Responsive FastAPI Backend & Database Integration
        </p>
      </div>
    </footer>
  );
}

export default function Landing() {
  const [docsOpen, setDocsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onOpenDocs={() => setDocsOpen(true)} />
      <Hero onOpenDocs={() => setDocsOpen(true)} />
      <StatsSection />
      <HowItWorks />
      <ForFarmersConsumers />
      <ImpactSection />
      <CTA />
      <Footer />
      <ApiDocsModal isOpen={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
