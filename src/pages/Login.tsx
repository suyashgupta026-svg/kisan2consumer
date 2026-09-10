import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sprout, ShoppingBasket, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, UserCheck, Lock, Mail, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import BackendStatusBadge from '../components/BackendStatusBadge';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, register, quickLoginAs } = useAuth();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialRole = (searchParams.get('role') as UserRole) || 'consumer';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (user) {
      navigate(user.role === 'farmer' ? '/farmer' : '/consumer', { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const loggedUser = await login(email, password);
        navigate(loggedUser.role === 'farmer' ? '/farmer' : '/consumer');
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        const registeredUser = await register({
          name,
          email,
          password,
          role,
          location,
          phone,
        });
        navigate(registeredUser.role === 'farmer' ? '/farmer' : '/consumer');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemoLogin(selectedRole: 'farmer' | 'consumer') {
    setError(null);
    setSubmitting(true);
    try {
      const u = await quickLoginAs(selectedRole);
      navigate(u.role === 'farmer' ? '/farmer' : '/consumer');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50/40 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-emerald-100 bg-white/70 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-emerald-950 text-base">Kisan2Consumer</span>
        </Link>

        <BackendStatusBadge />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-emerald-950">
                {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="text-xs text-emerald-700/70 mt-1">
                {mode === 'signin'
                  ? 'Sign in to access your direct produce portal'
                  : 'Join the direct farmer-to-consumer agricultural network'}
              </p>
            </div>

            {/* Demo Quick Logins */}
            <div className="mb-6 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <p className="text-[11px] font-bold text-emerald-900/80 uppercase tracking-wider mb-2 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Instant Demo Sign-In
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="demo-farmer-btn"
                  onClick={() => handleDemoLogin('farmer')}
                  disabled={submitting}
                  className="p-2 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200/80 text-left transition-colors text-xs disabled:opacity-50"
                >
                  <p className="font-bold text-emerald-950 flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Raj Kumar
                  </p>
                  <p className="text-[10px] text-emerald-600/80">Farmer (Gorakhpur)</p>
                </button>

                <button
                  type="button"
                  id="demo-consumer-btn"
                  onClick={() => handleDemoLogin('consumer')}
                  disabled={submitting}
                  className="p-2 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200/80 text-left transition-colors text-xs disabled:opacity-50"
                >
                  <p className="font-bold text-emerald-950 flex items-center gap-1">
                    <ShoppingBasket className="w-3.5 h-3.5 text-amber-600" /> Priya Sharma
                  </p>
                  <p className="text-[10px] text-emerald-600/80">Consumer (Lucknow)</p>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Role selector for signup */}
            {mode === 'signup' && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-emerald-900 mb-1.5">I am registering as:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('consumer')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      role === 'consumer'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingBasket className="w-3.5 h-3.5" /> Consumer
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      role === 'farmer'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" /> Farmer (Kisan)
                  </button>
                </div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="name-input"
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="password-input"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">City / Village Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="location-input"
                        type="text"
                        placeholder="e.g. Gorakhpur, UP"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">Phone Number (Optional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="phone-input"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                id="submit-auth-btn"
                disabled={submitting}
                className="w-full mt-2 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : mode === 'signin' ? (
                  <>
                    Sign In <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Register as {role === 'farmer' ? 'Farmer' : 'Consumer'} <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
              {mode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Sign In instead
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-emerald-800/60 mt-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            FastAPI token authentication with Bcrypt password hashing
          </p>
        </div>
      </main>

      <footer className="p-4 text-center text-[11px] text-emerald-700/60">
        Kisan2Consumer Direct Platform · SIH 2026
      </footer>
    </div>
  );
}
