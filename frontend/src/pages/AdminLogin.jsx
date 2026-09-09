import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader, ShieldCheck } from 'lucide-react';
import NsaLogoBadge from '../components/NsaLogoBadge';
import { API_BASE_URL } from '../config';


export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Real server-side check: the backend independently verifies the
    // password hash and, only on success, issues a genuine session token.
    // Nothing about "being logged in" is decided in the browser.
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', data.email);
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.message || 'Invalid email or password');
        setLoading(false);
      }
    } catch (err) {
      setError(`Could not reach the server. Make sure the backend is running on ${API_BASE_URL}.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ backgroundColor: '#0B1739' }}>

      {/* Calm background — glow only, no constellation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 35%, #14245C 0%, #0B1739 55%, #060D24 100%)'
        }}></div>
        <div className="absolute top-[-15%] left-[-10%] w-[30rem] h-[30rem] bg-[#D4AF37] rounded-full mix-blend-screen filter blur-[130px] opacity-[0.06] animate-loginGlow1"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[28rem] h-[28rem] bg-[#3B5FE0] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.08] animate-loginGlow2"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <NsaLogoBadge size="md" />
          </div>
          <h1 className="text-4xl font-bold text-[#F5F0E6] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Admin Portal</h1>
          <p className="text-[#F5F0E6]/50 text-base">Sign in to manage NSS placements</p>
        </div>

        <div className="backdrop-blur-xl bg-[#0B1739]/60 border border-[#F5F0E6]/10 rounded-3xl p-10 md:p-14 shadow-2xl">

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-400/40 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#F5F0E6]/70 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F5F0E6]/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nss.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/25 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#F5F0E6]/70 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F5F0E6]/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/25 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5F0E6]/30 hover:text-[#F5F0E6]/60 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-[#e5c04f] text-[#0B1739] font-bold py-3 rounded-lg transition shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

        </div>

        <p className="text-center text-[#F5F0E6]/30 text-xs mt-6">
          <a href="/" className="hover:text-[#D4AF37] transition">← Back to home</a>
        </p>
      </div>

      <style>{`
        @keyframes loginGlow1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.1); }
        }
        @keyframes loginGlow2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -30px) scale(1.1); }
        }
        .animate-loginGlow1 { animation: loginGlow1 12s ease-in-out infinite; }
        .animate-loginGlow2 { animation: loginGlow2 14s ease-in-out infinite; }
      `}</style>
    </div>
  );
}