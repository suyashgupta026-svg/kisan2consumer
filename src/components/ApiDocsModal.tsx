import React from 'react';
import { X, ExternalLink, ShieldCheck, Database, Key, ShoppingCart, Server, Code } from 'lucide-react';

export default function ApiDocsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const endpoints = [
    { method: 'POST', path: '/api/auth/register', desc: 'Secure user registration with bcrypt password hash & JWT generation', auth: false },
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticates user, returns signed JWT access token and profile', auth: false },
    { method: 'GET', path: '/api/auth/me', desc: 'Fetches verified session info from JWT Bearer token', auth: true },
    { method: 'GET', path: '/api/products', desc: 'Lists farm produce with category, search query, and farmer filters', auth: false },
    { method: 'POST', path: '/api/products', desc: 'Farmers list new inventory with quantity, unit, price, and location', auth: true },
    { method: 'PATCH', path: '/api/products/{id}', desc: 'Farmer updates stock quantity, pricing, or toggles visibility', auth: true },
    { method: 'DELETE', path: '/api/products/{id}', desc: 'Farmer deletes listed produce item from SQLite database', auth: true },
    { method: 'POST', path: '/api/orders', desc: 'Consumers place orders with transactional inventory decrement', auth: true },
    { method: 'GET', path: '/api/orders/my-orders', desc: 'Retrieves order history and live delivery tracking for consumer', auth: true },
    { method: 'GET', path: '/api/orders/farmer-orders', desc: 'Farmers view orders containing their produce and delivery addresses', auth: true },
    { method: 'PATCH', path: '/api/orders/{id}/status', desc: 'Updates order status (Pending -> Confirmed -> Out for Delivery -> Delivered)', auth: true },
    { method: 'GET', path: '/api/farmer/earnings', desc: 'Calculates real-time farmer revenue, pending payouts, & produce breakdown', auth: true },
    { method: 'GET', path: '/api/stats/platform', desc: 'Aggregated marketplace metrics (trade volume, farmers, consumers)', auth: false },
    { method: 'GET', path: '/api/health', desc: 'Service health check, database status, and security specifications', auth: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Server className="w-5 h-5 text-lime-300" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                FastAPI Responsive Backend Architecture
              </h2>
              <p className="text-xs text-emerald-200">
                Production REST API with SQLite database, Bcrypt encryption, and JWT Auth
              </p>
            </div>
          </div>
          <button
            id="close-api-docs-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-emerald-950">
          {/* Tech Stack Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
              <Server className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">FastAPI 0.110+</p>
                <p className="text-[11px] text-emerald-600/70">Python 3.11 Async</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">SQLite Database</p>
                <p className="text-[11px] text-emerald-600/70">ACID Transactions</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
              <Key className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">JWT + Bcrypt</p>
                <p className="text-[11px] text-emerald-600/70">Salted Passwords</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">RBAC Security</p>
                <p className="text-[11px] text-emerald-600/70">Farmer & Consumer</p>
              </div>
            </div>
          </div>

          {/* Direct Interactive Docs Link */}
          <div className="flex items-center justify-between p-4 bg-emerald-900 text-white rounded-2xl">
            <div>
              <p className="font-bold text-sm">Interactive Swagger UI / OpenAPI</p>
              <p className="text-xs text-emerald-300">Test live requests, inspect schemas, and execute API calls</p>
            </div>
            <a
              id="view-full-swagger-btn"
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              Open /docs <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Endpoints Table */}
          <div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-600" />
              Registered FastAPI Endpoints
            </h3>
            <div className="border border-emerald-100 rounded-2xl overflow-hidden divide-y divide-emerald-100">
              {endpoints.map((ep) => (
                <div key={ep.path + ep.method} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-emerald-50/40">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                      ep.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      ep.method === 'PATCH' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono font-semibold text-emerald-950">{ep.path}</span>
                    {ep.auth && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                        <Key className="w-2.5 h-2.5" /> Bearer
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-700/70 text-[11px] sm:max-w-xs text-right sm:truncate">{ep.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
