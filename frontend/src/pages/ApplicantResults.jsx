import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Award, Loader, AlertCircle } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import PostingLetter from '../components/PostingLetter';
import NsaLogoBadge from '../components/NsaLogoBadge';
import { API_BASE_URL } from '../config';

const NAVY = '#0B1739';
const GOLD = '#D4AF37';
const CREAM = '#F5F0E6';

function PageBackdrop({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: NAVY }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 20%, #14245C 0%, #0B1739 55%, #060D24 100%)'
        }}></div>
        <div className="absolute top-[-15%] left-[-10%] w-[30rem] h-[30rem] bg-[#D4AF37] rounded-full mix-blend-screen filter blur-[130px] opacity-[0.06] animate-loginGlow1"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[28rem] h-[28rem] bg-[#3B5FE0] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.08] animate-loginGlow2"></div>
      </div>
      <div className="relative z-10">{children}</div>
      <style>{`
        @keyframes loginGlow1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,40px) scale(1.1); } }
        @keyframes loginGlow2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,-30px) scale(1.1); } }
        .animate-loginGlow1 { animation: loginGlow1 12s ease-in-out infinite; }
        .animate-loginGlow2 { animation: loginGlow2 14s ease-in-out infinite; }
        @keyframes riseIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .rise-in { animation: riseIn 0.6s ease-out both; }
      `}</style>
    </div>
  );
}

export default function ApplicantResults() {
  const [applicantId, setApplicantId] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLetter, setShowLetter] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      setApplicantId(parseInt(id));
      fetchApplicantAndMatches(parseInt(id));
    } else {
      setLoading(false);
      setError('No applicant ID provided. Please use: /results?id=1');
    }
  }, []);

  const fetchApplicantAndMatches = async (id) => {
    try {
      setLoading(true);

      const appResponse = await fetch(`${API_BASE_URL}/applicants/${id}`);
      const appData = await appResponse.json();

      if (!appData.success) {
        setError('Applicant not found');
        setLoading(false);
        return;
      }

      setApplicant(appData.data);

      const matchResponse = await fetch(`${API_BASE_URL}/matches/applicant/${id}`);
      const matchData = await matchResponse.json();

      if (matchData.success) {
        setMatches(matchData.data);
      }

      setLoading(false);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader size={40} className="animate-spin mx-auto mb-4" style={{ color: GOLD }} />
            <p style={{ color: `${CREAM}99` }}>Loading your results...</p>
          </div>
        </div>
      </PageBackdrop>
    );
  }

  if (error) {
    return (
      <PageBackdrop>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full backdrop-blur-xl bg-[#0B1739]/60 border border-red-400/30 rounded-3xl p-8 text-center">
            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>
              Something's not right
            </h2>
            <p className="text-red-300 mb-6 text-sm">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 font-bold rounded-lg transition"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </PageBackdrop>
    );
  }

  const skillsArr = applicant && (Array.isArray(applicant.skills)
    ? applicant.skills
    : (applicant.skills ? applicant.skills.split(',').map(s => s.trim()).filter(Boolean) : []));

  return (
    <PageBackdrop>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#0B1739]/80 border-b border-[#F5F0E6]/10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 mb-5 transition"
            style={{ color: `${CREAM}80` }}
            onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
            onMouseLeave={(e) => e.currentTarget.style.color = `${CREAM}80`}
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-semibold">Back to Home</span>
          </button>

          <div className="flex items-center gap-4">
            <NsaLogoBadge size="sm" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>
                Your Placement Results
              </h1>
              <p style={{ color: `${CREAM}70` }}>Based on a review of your profile and qualifications</p>
            </div>
          </div>
        </div>
      </header>

      {/* Applicant Info Card */}
      {applicant && (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="backdrop-blur-xl bg-[#0B1739]/60 border border-[#F5F0E6]/10 rounded-3xl p-8 mb-8 rise-in">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>
                  {applicant.first_name} {applicant.last_name}
                </h2>
                <p className="flex items-center gap-2 text-sm" style={{ color: `${CREAM}70` }}>
                  <Mail size={15} />
                  {applicant.email}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-semibold mb-1" style={{ color: `${CREAM}60` }}>Programme</p>
                <p className="font-semibold text-lg" style={{ color: CREAM }}>{applicant.programme}</p>
              </div>
            </div>

            {applicant.status === 'Matched' && (
              <div className="mb-6 pb-6 border-b border-[#F5F0E6]/10">
                <button
                  onClick={() => setShowLetter(true)}
                  className="px-6 py-3 font-bold rounded-lg transition shadow-lg flex items-center gap-2"
                  style={{ backgroundColor: GOLD, color: NAVY, boxShadow: '0 10px 25px -5px rgba(212,175,55,0.3)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5c04f'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = GOLD}
                >
                  Download Your Posting Letter
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: `${CREAM}60` }}>University</p>
                <p className="font-semibold" style={{ color: CREAM }}>{applicant.university}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: `${CREAM}60` }}>Qualification</p>
                <p className="font-semibold" style={{ color: CREAM }}>{applicant.qualification}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: `${CREAM}60` }}>Available Matches</p>
                <p className="font-bold text-lg" style={{ color: GOLD }}>{matches.length}</p>
              </div>
            </div>

            {skillsArr && skillsArr.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#F5F0E6]/10">
                <p className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: `${CREAM}60` }}>
                  <Award size={14} />
                  Your Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillsArr.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-full text-sm border"
                      style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: GOLD, borderColor: 'rgba(212,175,55,0.35)' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Matches Section */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {matches.length === 0 ? (
          <div className="backdrop-blur-xl bg-[#0B1739]/60 border border-[#F5F0E6]/10 rounded-3xl p-12 text-center rise-in">
            <AlertCircle size={40} className="mx-auto mb-4" style={{ color: `${CREAM}50` }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>No Matches Yet</h3>
            <p style={{ color: `${CREAM}70` }}>
              Matches will appear here once the matching process completes.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 rise-in">
              <h3 className="text-2xl font-bold mb-2" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>
                We Found {matches.length} Match{matches.length !== 1 ? 'es' : ''} For You
              </h3>
              <p style={{ color: `${CREAM}70` }}>
                Organisations ranked by compatibility with your profile, with an explanation of why each is a fit.
              </p>
            </div>

            <div className="space-y-6">
              {matches.map((match, idx) => (
                <div key={match.id} className="rise-in" style={{ animationDelay: `${idx * 120}ms` }}>
                  <MatchCard match={match} rank={idx + 1} />
                </div>
              ))}
            </div>

            <div
              className="mt-12 rounded-3xl p-8 text-center rise-in"
              style={{ backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              <h3 className="text-2xl font-bold mb-3" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Next Steps</h3>
              <p className="mb-6 max-w-2xl mx-auto" style={{ color: `${CREAM}80` }}>
                Review your matches above and reach out to the contact person at your preferred organisations. Good luck with your NSS placement!
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 font-bold rounded-lg transition"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>

      {showLetter && (() => {
        const matchedOrg = matches.find(m => m.organization_id === applicant.matched_organization_id)?.organization;
        return (
          <PostingLetter
            applicant={applicant}
            organization={matchedOrg}
            onClose={() => setShowLetter(false)}
          />
        );
      })()}
    </PageBackdrop>
  );
}
