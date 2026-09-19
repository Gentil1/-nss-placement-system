import React, { useState } from 'react';
import { Zap, Award, ChevronDown } from 'lucide-react';

const NAVY = '#0B1739';
const GOLD = '#D4AF37';
const CREAM = '#F5F0E6';

export default function MatchCard({ match, rank, isConfirmed = false, applicantIsMatched = false }) {
  const [expanded, setExpanded] = useState(false);

  const tier = (score) => {
    if (score >= 80) return { label: 'Excellent Match', ring: GOLD, fill: GOLD, text: NAVY };
    if (score >= 60) return { label: 'Good Match', ring: GOLD, fill: 'transparent', text: CREAM };
    if (score >= 40) return { label: 'Moderate Match', ring: `${CREAM}60`, fill: 'transparent', text: CREAM };
    return { label: 'Fair Match', ring: `${CREAM}35`, fill: 'transparent', text: CREAM };
  };

  const t = tier(match.match_score);

  return (
    <div
      className="rounded-3xl p-6 backdrop-blur-xl transition-all"
      style={{ backgroundColor: 'rgba(11,23,57,0.6)', border: '1px solid rgba(245,240,230,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: GOLD, border: '1px solid rgba(212,175,55,0.3)' }}
          >
            #{rank}
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>
              {match.organization.name}
            </h3>
            <p className="text-sm" style={{ color: `${CREAM}70` }}>
              {match.organization.industry} · {match.organization.location}
            </p>
          </div>
        </div>

        {/* Score Circle */}
        <div className="flex-shrink-0 text-right">
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: t.fill, border: `2px solid ${t.ring}` }}
          >
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: t.text }}>{match.match_score}%</p>
            </div>
          </div>
          <p className="text-xs font-semibold mt-2" style={{ color: t.ring }}>
            {t.label}
          </p>
        </div>
      </div>

      {/* Why This Match */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ backgroundColor: 'rgba(245,240,230,0.04)', border: '1px solid rgba(245,240,230,0.08)' }}
      >
        <div className="flex items-start gap-2">
          <Zap size={16} className="flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
          <p className="text-sm leading-relaxed" style={{ color: `${CREAM}90` }}>
            {match.explanation}
          </p>
        </div>
      </div>

      {/* Organization Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(245,240,230,0.04)' }}>
          <p className="text-xs mb-1" style={{ color: `${CREAM}55` }}>Industry</p>
          <p className="font-semibold text-sm" style={{ color: CREAM }}>{match.organization.industry}</p>
        </div>
        <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(245,240,230,0.04)' }}>
          <p className="text-xs mb-1" style={{ color: `${CREAM}55` }}>Open Positions</p>
          <p className="font-semibold text-sm" style={{ color: CREAM }}>{match.organization.positions_available}</p>
        </div>
      </div>

      {/* Required Skills */}
      <div className="mb-4">
        <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: `${CREAM}70` }}>
          <Award size={13} />
          Required Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {match.organization.required_skills &&
            match.organization.required_skills.split(',').slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs border"
                style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: GOLD, borderColor: 'rgba(212,175,55,0.3)' }}
              >
                {skill.trim()}
              </span>
            ))
          }
          {match.organization.required_skills &&
            match.organization.required_skills.split(',').length > 3 && (
              <span className="text-xs self-center" style={{ color: `${CREAM}50` }}>
                +{match.organization.required_skills.split(',').length - 3} more
              </span>
            )
          }
        </div>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold transition"
        style={{ color: `${CREAM}70` }}
        onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
        onMouseLeave={(e) => e.currentTarget.style.color = `${CREAM}70`}
      >
        {expanded ? 'Hide Details' : 'View Details'}
        <ChevronDown size={15} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid rgba(245,240,230,0.1)' }}>
          {match.organization.description && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: `${CREAM}55` }}>About Organisation</p>
              <p className="text-sm leading-relaxed" style={{ color: `${CREAM}85` }}>{match.organization.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: `${CREAM}55` }}>Contact Email</p>
              <a href={`mailto:${match.organization.contact_email}`} className="text-sm break-all transition" style={{ color: GOLD }}>
                {match.organization.contact_email}
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: `${CREAM}55` }}>Contact Person</p>
              <p className="text-sm" style={{ color: CREAM }}>{match.organization.contact_person}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(245,240,230,0.1)' }}>
        {isConfirmed ? (
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: GOLD, borderColor: 'rgba(212,175,55,0.4)' }}
          >
            ✓ Confirmed Placement
          </span>
        ) : applicantIsMatched ? (
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ backgroundColor: 'rgba(245,240,230,0.05)', color: `${CREAM}50`, borderColor: 'rgba(245,240,230,0.15)' }}
          >
            Not Selected
          </span>
        ) : (
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: GOLD, borderColor: 'rgba(212,175,55,0.3)' }}
          >
            Pending Review
          </span>
        )}
      </div>
    </div>
  );
}
