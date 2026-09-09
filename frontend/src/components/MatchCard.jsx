import React, { useState } from 'react';
import { Zap, Award, TrendingUp, ChevronDown } from 'lucide-react';

export default function MatchCard({ match, rank }) {
  const [expanded, setExpanded] = useState(false);
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    if (score >= 40) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Moderate Match';
    return 'Fair Match';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Rank Badge */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center font-bold text-lg">
            #{rank}
          </div>
          
          {/* Organization Info */}
          <div>
            <h3 className="text-xl font-bold text-white">{match.organization.name}</h3>
            <p className="text-slate-400 text-sm">
              {match.organization.industry} • {match.organization.location}
            </p>
          </div>
        </div>

        {/* Score Circle */}
        <div className="flex-shrink-0 text-right">
          <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getScoreColor(match.match_score)} flex items-center justify-center shadow-lg`}>
            <div className="absolute inset-1 bg-slate-900 rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{match.match_score}%</p>
                <p className="text-xs text-slate-300">Match</p>
              </div>
            </div>
          </div>
          <p className={`text-xs font-semibold mt-2 ${
            match.match_score >= 80 ? 'text-green-400' :
            match.match_score >= 60 ? 'text-blue-400' :
            match.match_score >= 40 ? 'text-amber-400' :
            'text-red-400'
          }`}>
            {getScoreLabel(match.match_score)}
          </p>
        </div>
      </div>

      {/* Why This Match */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-2">
          <Zap size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-300 text-sm leading-relaxed">
            {match.explanation}
          </p>
        </div>
      </div>

      {/* Organization Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Industry</p>
          <p className="text-white font-semibold text-sm">{match.organization.industry}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Open Positions</p>
          <p className="text-white font-semibold text-sm">{match.organization.positions_available}</p>
        </div>
      </div>

      {/* Required Skills */}
      <div className="mb-4">
        <p className="text-slate-300 text-xs font-semibold mb-2 flex items-center gap-1">
          <Award size={14} />
          Required Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {match.organization.required_skills && 
            match.organization.required_skills.split(',').slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-400/50">
                {skill.trim()}
              </span>
            ))
          }
          {match.organization.required_skills && 
            match.organization.required_skills.split(',').length > 3 && (
              <span className="text-slate-400 text-xs">+{match.organization.required_skills.split(',').length - 3} more</span>
            )
          }
        </div>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-blue-400 hover:text-blue-300 transition flex items-center justify-center gap-2 py-2 text-sm font-semibold"
      >
        {expanded ? 'Hide Details' : 'View Details'}
        <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-3">
          {match.organization.description && (
            <div>
              <p className="text-slate-400 text-xs font-semibold mb-2">About Organization</p>
              <p className="text-slate-300 text-sm leading-relaxed">{match.organization.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-slate-400 text-xs font-semibold mb-1">Contact Email</p>
              <a href={`mailto:${match.organization.contact_email}`} className="text-blue-400 hover:text-blue-300 text-sm break-all">
                {match.organization.contact_email}
              </a>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold mb-1">Contact Person</p>
              <p className="text-white text-sm">{match.organization.contact_person}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-4 pt-4 border-t border-slate-700/30">
        <span className="inline-block bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold border border-green-400/50">
          ✓ {match.status}
        </span>
      </div>
    </div>
  );
}