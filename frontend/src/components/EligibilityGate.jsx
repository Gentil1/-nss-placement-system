import React, { useState } from 'react';
import { GraduationCap, AlertCircle, Loader, ShieldCheck, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';


const NODES = [
  { x: 10, y: 14 }, { x: 26, y: 6 }, { x: 44, y: 16 }, { x: 62, y: 6 },
  { x: 80, y: 16 }, { x: 90, y: 38 }, { x: 74, y: 54 }, { x: 54, y: 60 },
];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]];

function Background() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 30%, #14245C 0%, #0B1739 55%, #060D24 100%)' }}></div>
      <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
            stroke="#D4AF37" strokeWidth="0.12" style={{ opacity: 0.4 }} />
        ))}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1739]/30 via-transparent to-[#0B1739]/70"></div>
    </div>
  );
}

export default function EligibilityGate({ onVerified }) {
  const [indexNumber, setIndexNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!indexNumber.trim() || !dateOfBirth) {
      setError('Please enter both your index number and date of birth');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/eligible-graduates/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index_number: indexNumber.trim(), date_of_birth: dateOfBirth })
      });
      const data = await response.json();

      if (data.success) {
        onVerified(data.data);
      } else {
        setError(data.message || 'Verification failed. Please check your details.');
      }
    } catch (err) {
      setError(`Error: ${err.message}. Make sure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ backgroundColor: '#0B1739' }}>
      <Background />

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-bold text-[#F5F0E6] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Verify Your Eligibility</h1>
          <p className="text-[#F5F0E6]/50 text-base">Enter the details submitted by your university to continue</p>
        </div>

        <div className="backdrop-blur-xl bg-[#0B1739]/60 border border-[#F5F0E6]/10 rounded-3xl p-10 md:p-14 shadow-2xl">

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-400/40 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#F5F0E6]/70 mb-2">Index Number</label>
              <input
                type="text"
                value={indexNumber}
                onChange={(e) => setIndexNumber(e.target.value)}
                placeholder="e.g. 01232099D"
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/25 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#F5F0E6]/70 mb-2">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-[#e5c04f] text-[#0B1739] font-bold py-3 rounded-lg transition shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={18} className="animate-spin" /> Verifying...</> : <>Verify & Continue <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#F5F0E6]/10 text-center">
            <p className="text-[#F5F0E6]/30 text-xs">
              Your details are checked against the list submitted by your university.<br />
              If you believe there is an error, please contact your institution.
            </p>
          </div>
        </div>

        <p className="text-center text-[#F5F0E6]/30 text-xs mt-6">
          <a href="/" className="hover:text-[#D4AF37] transition">← Back to home</a>
        </p>
      </div>
    </div>
  );
}
