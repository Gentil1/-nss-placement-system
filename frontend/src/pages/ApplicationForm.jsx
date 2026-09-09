import React, { useState } from 'react';
import { Upload, Check, AlertCircle, ChevronRight, Loader, GraduationCap } from 'lucide-react';
import EligibilityGate from '../components/EligibilityGate';
import { API_BASE_URL } from '../config';


const NODES = [
  { x: 10, y: 14, icon: 'cap' }, { x: 26, y: 6, icon: 'book' }, { x: 44, y: 16, icon: 'quill' },
  { x: 62, y: 6, icon: 'cap' }, { x: 80, y: 16, icon: 'book' }, { x: 90, y: 38, icon: 'quill' },
  { x: 74, y: 54, icon: 'cap' }, { x: 54, y: 60, icon: 'book' }, { x: 32, y: 66, icon: 'quill' },
  { x: 14, y: 50, icon: 'cap' }, { x: 6, y: 70, icon: 'book' },
];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,0],[2,7],[9,10]];

function NodeIcon({ type }) {
  if (type === 'cap') return (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 3L1 8l11 5 9-4.09V17h2V8L12 3z"/><path d="M5 10.5V15c0 1.66 3.13 3 7 3s7-1.34 7-3v-4.5l-7 3.18-7-3.18z" opacity="0.7"/></svg>);
  if (type === 'book') return (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z" opacity="0.85"/></svg>);
  return (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M20 2 4 14l3 3L20 2z" opacity="0.85"/><path d="M7 17 4 20l1.5.5L7 22l1-3-1-2z"/></svg>);
}

export default function ApplicationForm() {
  console.log('APPLICATION FORM LOADED - REGION TEST');
  const [verifiedGraduate, setVerifiedGraduate] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', location: '',
    university: '', programme: '', qualification: '', preferredRegion: '',
    selectedSkills: [], interests: [], careerGoal: '', certificate: null,
  });

  // Pre-fill once verified against the university's eligible graduate list
  React.useEffect(() => {
    if (verifiedGraduate) {
      const nameParts = verifiedGraduate.full_name.trim().split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        university: verifiedGraduate.university_name || '',
        programme: verifiedGraduate.programme || '',
      }));
    }
  }, [verifiedGraduate]);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const skills = ['Python', 'JavaScript', 'Data Analysis', 'Finance', 'Accounting', 'Leadership', 'Communication', 'Project Management', 'Networking', 'Database Management', 'Teamwork', 'Problem Solving'];
  const interests = ['Technology', 'Finance', 'Healthcare', 'Education', 'NGO/Development', 'Manufacturing', 'Retail', 'Government', 'Telecommunications'];
  const qualifications = ['Diploma', 'Bachelor', 'Master'];
  const regions = ['Greater Accra', 'Ashanti', 'Eastern', 'Western', 'Central', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 'Bono East', 'Ahafo', 'Western North', 'Oti', 'North East', 'Savannah'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill) ? prev.selectedSkills.filter(s => s !== skill) : [...prev.selectedSkills, skill]
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }
      setUploadedFile(file.name);
      setFormData(prev => ({ ...prev, certificate: file }));
      setError('');
    }
  };

  const validateStep = () => {
    if (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.location)) {
      setError('Please fill in all personal information fields'); return false;
    }
    if (currentStep === 2 && (!formData.university || !formData.programme || !formData.qualification)) {
      setError('Please fill in all academic information fields'); return false;
    }
    if (currentStep === 3 && formData.selectedSkills.length === 0) {
      setError('Please select at least one skill'); return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('location', formData.location);
      submitData.append('university', formData.university);
      submitData.append('programme', formData.programme);
      submitData.append('qualification', formData.qualification);
      submitData.append('careerGoal', formData.careerGoal);
      submitData.append('preferredRegion', formData.preferredRegion);
      formData.selectedSkills.forEach(skill => submitData.append('skills', skill));
      formData.interests.forEach(interest => submitData.append('interests', interest));
      if (formData.certificate) submitData.append('certificate', formData.certificate);

      const response = await fetch(`${API_BASE_URL}/applicants`, { method: 'POST', body: submitData });
      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Application submitted! ID: ${data.applicant_id}`);
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit application');
      }
    } catch (err) {
      setError(`Error: ${err.message}. Please try again in a moment.`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => { if (validateStep()) setCurrentStep(currentStep + 1); };
  const prevStep = () => { setCurrentStep(currentStep - 1); setError(''); };

  // Gate: must verify eligibility before accessing the application form
  if (!verifiedGraduate) {
    return <EligibilityGate onVerified={(grad) => setVerifiedGraduate(grad)} />;
  }

  const Background = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 30%, #14245C 0%, #0B1739 55%, #060D24 100%)' }}></div>
      <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="none">
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
            stroke="#D4AF37" strokeWidth="0.12" className="apply-constellation-line" style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
      </svg>
      {NODES.map((node, i) => (
        <div key={i} className="absolute apply-constellation-node" style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${i * 0.5}s` }}>
          <div className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37] drop-shadow-[0_0_6px_rgba(212,175,55,0.6)] opacity-60">
            <NodeIcon type={node.icon} />
          </div>
        </div>
      ))}
      {[...Array(10)].map((_, i) => (
        <div key={`dust-${i}`} className="absolute w-1 h-1 rounded-full bg-[#F5F0E6] apply-dust"
          style={{ left: `${(i * 9.5) % 100}%`, top: `${(i * 13) % 100}%`, animationDelay: `${i * 0.8}s`, animationDuration: `${9 + (i % 5)}s`, opacity: 0.15 }}>
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1739]/30 via-transparent to-[#0B1739]/70"></div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ backgroundColor: '#0B1739' }}>
        <Background />
        <div className="relative z-10 max-w-md w-full backdrop-blur-xl bg-[#0B1739]/60 border border-[#D4AF37]/30 rounded-3xl shadow-2xl p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#D4AF37] to-[#b8933f] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
              <Check size={48} className="text-[#0B1739]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Submitted!</h1>
          <p className="text-[#F5F0E6]/80 mb-8 text-lg">Your application has been received and is now being reviewed for placement with a suitable organization.</p>
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6 mb-8">
            <p className="text-sm text-[#F5F0E6]/70"><strong className="text-[#D4AF37]">Application ID:</strong><br />NSS-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
          <p className="text-[#F5F0E6]/50 text-sm mb-8">{successMessage}</p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-[#D4AF37] hover:bg-[#e5c04f] text-[#0B1739] font-bold py-3 px-6 rounded-xl transition shadow-lg">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-12 px-4" style={{ backgroundColor: '#0B1739' }}>
      <Background />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full backdrop-blur-sm">
            <span className="text-[#D4AF37] text-sm font-semibold flex items-center gap-2">
              <GraduationCap size={16} />
              National Service Placement System
            </span>
          </div>
          <h1 className="text-6xl font-bold mb-4 text-[#F5F0E6]" style={{ fontFamily: 'Georgia, serif' }}>Your Journey Starts Here</h1>
          <p className="text-[#F5F0E6]/60 text-xl">Complete your profile and get matched with perfect organizations</p>
        </div>

        <div className="mb-12">
          <div className="flex justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step <= currentStep ? 'bg-[#D4AF37] text-[#0B1739] shadow-lg shadow-[#D4AF37]/40 scale-110' : 'bg-[#F5F0E6]/10 text-[#F5F0E6]/40'
                }`}>
                  {step < currentStep ? <Check size={24} /> : step}
                </div>
                <p className={`text-xs mt-3 font-semibold ${step <= currentStep ? 'text-[#D4AF37]' : 'text-[#F5F0E6]/30'}`}>
                  {['Personal', 'Academic', 'Skills', 'Interests'][step - 1]}
                </p>
              </div>
            ))}
          </div>
          <div className="h-1 bg-[#F5F0E6]/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4AF37] transition-all duration-500 shadow-lg shadow-[#D4AF37]/50" style={{ width: `${(currentStep / 4) * 100}%` }} />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-400/40 backdrop-blur-sm rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
        )}

        <div className="backdrop-blur-xl bg-[#0B1739]/50 border border-[#F5F0E6]/10 rounded-3xl p-10 md:p-16 shadow-2xl">

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-[#F5F0E6] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Let's start with your details</h2>
                <p className="text-[#F5F0E6]/50">We'll use this to match you perfectly</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name"
                  className="px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" />
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name"
                  className="px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email"
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone"
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" />
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location"
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#F5F0E6]" style={{ fontFamily: 'Georgia, serif' }}>Academic Background</h2>
              <input type="text" name="university" value={formData.university} onChange={handleInputChange} placeholder="University"
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" />
              <input type="text" name="programme" value={formData.programme} onChange={handleInputChange} placeholder="Programme"
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" />
              <select name="qualification" value={formData.qualification} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition">
                <option value="" className="bg-[#0B1739]">Select qualification...</option>
                {qualifications.map(q => <option key={q} value={q} className="bg-[#0B1739]">{q}</option>)}
              </select>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#F5F0E6]" style={{ fontFamily: 'Georgia, serif' }}>Select Your Skills</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map(skill => (
                  <button key={skill} onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-lg border-2 font-semibold transition ${
                      formData.selectedSkills.includes(skill) ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-[#F5F0E6]/15 bg-[#F5F0E6]/5 text-[#F5F0E6]/50'
                    }`}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#F5F0E6]" style={{ fontFamily: 'Georgia, serif' }}>Career Interests</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interests.map(interest => (
                  <button key={interest} onClick={() => handleInterestToggle(interest)}
                    className={`p-3 rounded-lg border-2 font-semibold transition ${
                      formData.interests.includes(interest) ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-[#F5F0E6]/15 bg-[#F5F0E6]/5 text-[#F5F0E6]/50'
                    }`}>
                    {interest}
                  </button>
                ))}
              </div>
              <textarea name="careerGoal" value={formData.careerGoal} onChange={handleInputChange} rows="4" placeholder="Your career goals..."
                className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition resize-none" />

              <div>
                <label className="block text-sm font-bold text-[#F5F0E6]/70 mb-3">Preferred Region</label>
                <select name="preferredRegion" value={formData.preferredRegion} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#F5F0E6]/5 border border-[#F5F0E6]/20 rounded-lg text-[#F5F0E6] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition">
                  <option value="" className="bg-[#0B1739]">Select preferred region...</option>
                  {regions.map(r => <option key={r} value={r} className="bg-[#0B1739]">{r}</option>)}
                </select>
                <p className="text-[#F5F0E6]/30 text-xs mt-2">This is a preference, not a guarantee — placement depends on available vacancies.</p>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-12">
            {currentStep > 1 && (
              <button onClick={prevStep} className="px-6 py-3 border border-[#F5F0E6]/20 text-[#F5F0E6]/70 rounded-lg font-semibold hover:bg-[#F5F0E6]/5 transition">
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button onClick={nextStep} className="ml-auto px-6 py-3 bg-[#D4AF37] hover:bg-[#e5c04f] text-[#0B1739] rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-[#D4AF37]/20">
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="ml-auto px-8 py-3 bg-[#D4AF37] hover:bg-[#e5c04f] text-[#0B1739] rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition shadow-lg shadow-[#D4AF37]/20">
                {loading ? <><Loader size={20} className="animate-spin" /> Submitting...</> : <><Check size={20} /> Submit</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .apply-constellation-line {
          stroke-dasharray: 4;
          stroke-dashoffset: 4;
          animation: applyDrawLine 3s ease-out forwards, applyGlowLine 6s ease-in-out infinite 3s;
        }
        @keyframes applyDrawLine { to { stroke-dashoffset: 0; } }
        @keyframes applyGlowLine { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.7; } }

        .apply-constellation-node {
          opacity: 0;
          animation: applyNodeFadeIn 1s ease-out forwards, applyNodeFloat 6s ease-in-out infinite 1s;
        }
        @keyframes applyNodeFadeIn { to { opacity: 1; } }
        @keyframes applyNodeFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .apply-dust { animation: applyDustDrift linear infinite; }
        @keyframes applyDustDrift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.25; }
          85% { opacity: 0.25; }
          100% { transform: translateY(-100px) translateX(15px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
