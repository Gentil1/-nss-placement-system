import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Award, Loader, AlertCircle } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import PostingLetter from '../components/PostingLetter';
import { API_BASE_URL } from '../config';


export default function ApplicantResults() {
  const [applicantId, setApplicantId] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLetter, setShowLetter] = useState(false);

  useEffect(() => {
    // Get applicant ID from URL or prompt
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
      
      // Fetch applicant details
      const appResponse = await fetch(`${API_BASE_URL}/applicants/${id}`);
      const appData = await appResponse.json();
      
      if (!appData.success) {
        setError('Applicant not found');
        setLoading(false);
        return;
      }
      
      setApplicant(appData.data);
      
      // Fetch matches
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/20 border border-red-500/50 rounded-2xl p-6 text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/80 border-b border-slate-700/30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-semibold">Back to Home</span>
          </button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Your Placement Matches
          </h1>
          <p className="text-slate-400">Based on a review of your profile and qualifications</p>
        </div>
      </header>

      {/* Applicant Info Card */}
      {applicant && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {applicant.first_name} {applicant.last_name}
                </h2>
                <p className="text-slate-400 flex items-center gap-2">
                  <Mail size={16} />
                  {applicant.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-1">Programme</p>
                <p className="text-white font-semibold text-lg">{applicant.programme}</p>
              </div>
            </div>

            {applicant.status === 'Matched' && (
              <div className="mt-6 pt-6 border-t border-slate-700/30">
                <button
                  onClick={() => setShowLetter(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition shadow-lg flex items-center gap-2"
                >
                  📄 Download Your Posting Letter
                </button>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 text-xs font-semibold mb-2">University</p>
                <p className="text-white font-semibold">{applicant.university}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold mb-2">Qualification</p>
                <p className="text-white font-semibold">{applicant.qualification}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold mb-2">Available Matches</p>
                <p className="text-blue-400 font-bold text-lg">{matches.length}</p>
              </div>
            </div>

            {/* Skills */}
            {(() => {
              const skillsArr = Array.isArray(applicant.skills)
                ? applicant.skills
                : (applicant.skills ? applicant.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
              return skillsArr.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700/30">
                  <p className="text-slate-400 text-xs font-semibold mb-3 flex items-center gap-2">
                    <Award size={14} />
                    Your Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillsArr.map((skill, idx) => (
                      <span key={idx} className="bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-full text-sm border border-cyan-400/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Matches Section */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {matches.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-12 text-center">
            <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Matches Yet</h3>
            <p className="text-slate-400">
              Matches will appear here once the AI matching algorithm completes analysis.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                We Found {matches.length} Perfect Match{matches.length !== 1 ? 'es' : ''} For You
              </h3>
              <p className="text-slate-400">
                Below are organizations ranked by compatibility with your profile, along with an explanation of why each is a good fit for you.
              </p>
            </div>

            {/* Match Cards Grid */}
            <div className="space-y-6">
              {matches.map((match, idx) => (
                <MatchCard key={match.id} match={match} rank={idx + 1} />
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Next Steps</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Review your matches above and reach out to the contact person at your preferred organizations. Good luck with your NSS placement!
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
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
    </div>
  );
}
