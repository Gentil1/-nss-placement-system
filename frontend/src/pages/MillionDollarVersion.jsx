import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, GraduationCap, BookOpen, Award } from 'lucide-react';
import NsaLogoBadge from '../components/NsaLogoBadge';
import { API_BASE_URL } from '../config';

// Fixed node positions so the constellation reads as deliberate, not random
const NODES = [
  { x: 12, y: 18, icon: 'cap' },
  { x: 28, y: 8, icon: 'book' },
  { x: 46, y: 22, icon: 'quill' },
  { x: 62, y: 10, icon: 'cap' },
  { x: 80, y: 20, icon: 'book' },
  { x: 90, y: 40, icon: 'quill' },
  { x: 75, y: 55, icon: 'cap' },
  { x: 55, y: 62, icon: 'book' },
  { x: 35, y: 68, icon: 'quill' },
  { x: 18, y: 52, icon: 'cap' },
  { x: 8, y: 72, icon: 'book' },
  { x: 50, y: 40, icon: 'quill' },
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [6, 7], [7, 8], [8, 9], [9, 0], [2, 11], [7, 11],
  [1, 11], [4, 5], [9, 10],
];

function NodeIcon({ type }) {
  if (type === 'cap') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 3L1 8l11 5 9-4.09V17h2V8L12 3z" fill="currentColor" />
        <path d="M5 10.5V15c0 1.66 3.13 3 7 3s7-1.34 7-3v-4.5l-7 3.18-7-3.18z" fill="currentColor" opacity="0.7" />
      </svg>
    );
  }
  if (type === 'book') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z" fill="currentColor" opacity="0.85" />
        <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M20 2 4 14l3 3L20 2z" fill="currentColor" opacity="0.85" />
      <path d="M7 17 4 20l1.5.5L7 22l1-3-1-2z" fill="currentColor" />
    </svg>
  );
}


export default function MillionDollarVersion() {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState({ applicants: 0, organizations: 0, matched: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [appRes, orgRes] = await Promise.all([
          fetch(`${API_BASE_URL}/applicants`),
          fetch(`${API_BASE_URL}/organizations`),
        ]);
        const appData = await appRes.json();
        const orgData = await orgRes.json();
        if (appData.success && orgData.success) {
          const matchedCount = appData.data.filter(a => a.status === 'Matched').length;
          setStats({
            applicants: appData.data.length,
            organizations: orgData.data.length,
            matched: matchedCount,
          });
        }
      } catch (err) {
        console.error('Could not load stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0B1739' }}>

      {/* ===== SIGNATURE: KNOWLEDGE CONSTELLATION ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Deep radial glow, academia navy to near-black */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 30%, #14245C 0%, #0B1739 55%, #060D24 100%)'
        }}></div>

        {/* Paper-grain texture for warmth, not sterile tech */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }}></div>

        {/* Constellation lines */}
        <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a].x} y1={NODES[a].y}
              x2={NODES[b].x} y2={NODES[b].y}
              stroke="#D4AF37"
              strokeWidth="0.12"
              className="constellation-line"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          ))}
        </svg>

        {/* Floating node icons (cap / book / quill) */}
        {NODES.map((node, i) => (
          <div
            key={i}
            className="absolute constellation-node"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <div className="w-6 h-6 md:w-8 md:h-8 text-[#D4AF37] drop-shadow-[0_0_6px_rgba(212,175,55,0.6)] opacity-70">
              <NodeIcon type={node.icon} />
            </div>
          </div>
        ))}

        {/* Chalk-dust drifting particles */}
        {[...Array(16)].map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-1 h-1 rounded-full bg-[#F5F0E6] chalk-dust"
            style={{
              left: `${(i * 6.3) % 100}%`,
              top: `${(i * 11) % 100}%`,
              animationDelay: `${i * 0.9}s`,
              animationDuration: `${9 + (i % 5)}s`,
              opacity: 0.15,
            }}
          ></div>
        ))}

        {/* Glowing seal, top right — the one "diploma" flourish */}
        <div className="absolute top-10 right-10 w-24 h-24 md:w-32 md:h-32 opacity-20 seal-pulse">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2 3" />
            <polygon points="50,20 61,38 98,38 68,60 79,95 50,73 21,95 32,60 2,38 39,38"
              fill="#D4AF37" opacity="0.3" transform="scale(0.55) translate(40,40)" />
          </svg>
        </div>

        {/* Vignette so text stays crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1739]/40 via-transparent to-[#0B1739]/70"></div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 py-8">

        <NsaLogoBadge size="md" className="mb-3" />

        <div className="mb-4 px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/5 backdrop-blur-sm">
          <span className="text-[#D4AF37] text-xs font-semibold tracking-wide flex items-center gap-2">
            <Award size={14} />
            National Service Placement
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#F5F0E6] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Every Student,<br />
          <span className="text-[#D4AF37]">A Place in the World</span>
        </h1>

        <p className="text-[#F5F0E6]/70 text-base max-w-xl mb-6">
          National Service Placement System connecting graduates to the organizations
          where their education finally goes to work.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/apply" className="group px-7 py-3 bg-[#D4AF37] text-[#0B1739] font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#e5c04f] transition-all shadow-lg shadow-[#D4AF37]/20">
            <GraduationCap size={18} />
            Begin Your Placement
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/admin" className="px-7 py-3 border border-[#F5F0E6]/30 text-[#F5F0E6] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#F5F0E6]/5 transition-all">
            <BookOpen size={18} />
            Admin Portal
          </a>
        </div>

        {/* Small credibility detail */}
        <p className="mt-5 text-[#F5F0E6]/40 text-xs tracking-widest uppercase">
          National Service Secretariat
        </p>

        {/* Feature highlights, carried over and restyled for this theme */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            { icon: GraduationCap, title: 'Smart Matching', desc: 'Precision scoring for accurate placement recommendations' },
            { icon: Award, title: 'Best Fit', desc: 'Matched on skills, interests & qualifications' },
            { icon: BookOpen, title: 'Fast & Simple', desc: 'Apply in minutes, get matched instantly' },
          ].map((feature, idx) => (
            <div key={idx} className="backdrop-blur-sm bg-[#F5F0E6]/5 border border-[#D4AF37]/20 rounded-xl p-4 text-center hover:border-[#D4AF37]/40 transition">
              <feature.icon size={20} className="text-[#D4AF37] mx-auto mb-2" />
              <h3 className="text-[#F5F0E6] font-bold text-sm mb-1">{feature.title}</h3>
              <p className="text-[#F5F0E6]/50 text-xs">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== LIVE STATS STRIP ===== */}
      <div className="relative z-10 border-t border-[#D4AF37]/10 py-12 mt-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 px-6">
          {[
            { label: 'Applicants Registered', value: stats.applicants },
            { label: 'Partner Organizations', value: stats.organizations },
            { label: 'Successfully Placed', value: stats.matched },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-[#D4AF37]" style={{ fontFamily: 'Georgia, serif' }}>{stat.value}</p>
              <p className="text-[#F5F0E6]/50 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#F5F0E6] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          How It Works
        </h2>
        <p className="text-center text-[#F5F0E6]/50 mb-12 max-w-xl mx-auto">
          A straightforward path from eligibility to placement, mirroring the official National Service process.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>

          {[
            { step: '01', title: 'Verify Eligibility', desc: 'Confirm your index number and details against your university\'s submitted graduate list.' },
            { step: '02', title: 'Submit Your Application', desc: 'Provide your academic background, skills, interests, and preferred region.' },
            { step: '03', title: 'Receive Your Posting', desc: 'Get matched to a suitable organization and download your official posting letter.' },
          ].map((item, idx) => (
            <div key={idx} className="relative text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0B1739] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-lg relative z-10 mb-5">
                {item.step}
              </div>
              <h3 className="text-[#F5F0E6] font-bold text-lg mb-2" style={{ fontFamily: 'Georgia, serif' }}>{item.title}</h3>
              <p className="text-[#F5F0E6]/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-[#D4AF37]/10 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/nsa-logo.png" alt="National Service Authority" className="h-8 w-auto object-contain" />
            <p className="text-[#F5F0E6]/40 text-xs">National Service Authority · Republic of Ghana</p>
          </div>
          <p className="text-[#F5F0E6]/30 text-xs">© {new Date().getFullYear()} National Service Placement System</p>
        </div>
      </footer>

      <style>{`
        .constellation-line {
          stroke-dasharray: 4;
          stroke-dashoffset: 4;
          animation: drawLine 3s ease-out forwards, glowLine 6s ease-in-out infinite 3s;
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes glowLine {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }

        .constellation-node {
          animation: nodeFadeIn 1s ease-out forwards, nodeFloat 6s ease-in-out infinite 1s;
          opacity: 0;
        }
        @keyframes nodeFadeIn {
          to { opacity: 1; }
        }
        @keyframes nodeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .chalk-dust {
          animation: dustDrift linear infinite;
        }
        @keyframes dustDrift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.25; }
          85% { opacity: 0.25; }
          100% { transform: translateY(-100px) translateX(15px); opacity: 0; }
        }

        .seal-pulse {
          animation: sealPulse 5s ease-in-out infinite;
        }
        @keyframes sealPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.28; transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
