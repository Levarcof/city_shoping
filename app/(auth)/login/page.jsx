"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Invalid email or password');

      localStorage.setItem('User', JSON.stringify({
        id:    data.user.id,
        name:  data.user.name,
        email: data.user.email,
        role:  data.user.role,
        phone : data.user.phone,
        pincode : data.user.pincode,
        addresses : data.user.addresses,
        savedShops : data.user.savedShops,
        image: data.user.image || '',
      }));
      router.replace('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFA] text-gray-900 flex selection:bg-green-100">

      {/* ══════════════════════════════════
          LEFT BRAND PANEL — desktop only
      ══════════════════════════════════ */}
      <aside className="hidden lg:flex lg:w-1/2 relative bg-[#00B259] overflow-hidden flex-col justify-between p-12">
        {/* Decorative background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-3xl bg-white/5 rotate-12" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00B259" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-white">LocalMart</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-black text-white leading-tight tracking-tight mb-3">
            Your neighbourhood, delivered.
          </h2>
          <p className="text-white/80 text-sm font-medium leading-relaxed">
            Sign in to order fresh groceries, medicines and daily essentials from local shops near you — fast and reliable.
          </p>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 flex items-center gap-8">
          {[
            { value: "200+", label: "Local shops" },
            { value: "28 min", label: "Avg delivery" },
            { value: "50K+", label: "Happy customers" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white font-black text-xl leading-none">{s.value}</p>
              <p className="text-white/60 text-[11px] mt-1 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ══════════════════════════════════
          RIGHT FORM PANEL
      ══════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">

          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#00B259] flex items-center justify-center shadow-sm flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900">LocalMart</span>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm shadow-gray-900/[0.03]">
            <div className="mb-7 text-center sm:text-left">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h1>
              <p className="text-sm text-gray-400 font-medium mt-1.5">Log in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold rounded-xl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1">Email address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:border-[#00B259] focus:bg-white focus:ring-2 focus:ring-green-100 placeholder:text-gray-400"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-xl pl-4 pr-12 py-3 outline-none transition-all duration-200 focus:border-[#00B259] focus:bg-white focus:ring-2 focus:ring-green-100 placeholder:text-gray-400"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B259] transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00B259] hover:bg-[#009c4c] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 shadow-sm shadow-green-900/10"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Logging in…
                  </>
                ) : 'Log in'}
              </button>

              <div className="text-center mt-6">
                <span className="text-gray-400 text-sm">Don't have an account? </span>
                <Link href="/register" className="text-[#00B259] hover:text-[#009c4c] text-sm font-bold transition-colors">
                  Register
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}