import React from 'react';

/**
 * NsaLogoBadge — the signature logo treatment used across the whole system.
 * A slow-rotating gold ring + soft pulsing glow frame the real NSA emblem,
 * presenting it like an official seal rather than a dropped-in image.
 *
 * size: 'sm' (headers/nav) | 'md' (login/cards) | 'lg' (homepage hero)
 */
export default function NsaLogoBadge({ size = 'md', className = '' }) {
  const dims = {
    sm: { box: 'w-20 h-20', ring: 'w-20 h-20', logo: 'w-16 h-16' },
    md: { box: 'w-36 h-36', ring: 'w-36 h-36', logo: 'w-28 h-28' },
    lg: { box: 'w-52 h-52', ring: 'w-52 h-52', logo: 'w-40 h-40' },
  }[size];

  return (
    <div className={`relative flex items-center justify-center ${dims.box} ${className}`}>
      {/* Outer soft glow pulse */}
      <div className="absolute inset-0 rounded-full nsa-glow-pulse" style={{
        background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)'
      }}></div>

      {/* Rotating dashed gold ring */}
      <svg viewBox="0 0 100 100" className={`absolute ${dims.ring} nsa-ring-spin`}>
        <circle cx="50" cy="50" r="46" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 5" opacity="0.7" />
      </svg>

      {/* Static solid inner ring */}
      <svg viewBox="0 0 100 100" className={`absolute ${dims.ring}`}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.4" />
      </svg>

      {/* The logo itself, on a subtle dark disc so the transparent PNG has consistent contrast */}
      <div className={`relative ${dims.logo} rounded-full flex items-center justify-center nsa-logo-entrance`} style={{
        background: 'radial-gradient(circle, rgba(245,240,230,0.08) 0%, transparent 75%)'
      }}>
        <img
          src="/nsa-logo.png"
          alt="National Service Authority"
          className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
        />
      </div>

      <style>{`
        @keyframes nsaRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .nsa-ring-spin { animation: nsaRingSpin 40s linear infinite; }

        @keyframes nsaGlowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }
        .nsa-glow-pulse { animation: nsaGlowPulse 4s ease-in-out infinite; }

        @keyframes nsaLogoEntrance {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        .nsa-logo-entrance { animation: nsaLogoEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}
