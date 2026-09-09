import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Download, LogOut, Users, FileText, Zap, TrendingUp, Eye, Settings, RefreshCw, Loader, GraduationCap } from 'lucide-react';
import ApplicantDetail from '../components/ApplicantDetail';
import OrganizationsTab from '../components/OrganizationsTab';
import EligibleGraduatesTab from '../components/EligibleGraduatesTab';
import PostingLetter from '../components/PostingLetter';
import { exportToCSV, formatDate, getStatusColor, logoutAdmin, isAdminLoggedIn } from '../utils/utilities';
import NsaLogoBadge from '../components/NsaLogoBadge';
import { API_BASE_URL } from '../config';

const GOLD = '#D4AF37';
const CREAM = '#F5F0E6';
const NAVY = '#0B1739';

export default function AdminDashboard() {
  useEffect(() => {
    const handleClickOutside = () => setShowGlobalResults(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      window.location.href = '/admin/login';
    }
  }, []);

  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [view, setView] = useState('overview');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [postingLetterApplicant, setPostingLetterApplicant] = useState(null);
  const [generatingMatches, setGeneratingMatches] = useState(false);
  const [eligibleGraduates, setEligibleGraduates] = useState([]);
  const [expandedApplicants, setExpandedApplicants] = useState({});
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [showGlobalResults, setShowGlobalResults] = useState(false);
  const [organizationsForSearch, setOrganizationsForSearch] = useState([]);

  useEffect(() => {
    fetchApplicants();
    fetchEligibleGraduatesForActivity();
    fetchOrganizationsForSearch();
  }, []);

  const fetchOrganizationsForSearch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`);
      const data = await response.json();
      if (data.success) setOrganizationsForSearch(data.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const globalResults = (() => {
    if (!globalSearchTerm.trim()) return { applicants: [], organizations: [], graduates: [] };
    const term = globalSearchTerm.toLowerCase();
    return {
      applicants: applicants.filter(a =>
        `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(term)
      ).slice(0, 5),
      organizations: organizationsForSearch.filter(o =>
        `${o.name} ${o.industry}`.toLowerCase().includes(term)
      ).slice(0, 5),
      graduates: eligibleGraduates.filter(g =>
        `${g.full_name} ${g.index_number}`.toLowerCase().includes(term)
      ).slice(0, 5),
    };
  })();

  const fetchEligibleGraduatesForActivity = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/eligible-graduates`);
      const data = await response.json();
      if (data.success) setEligibleGraduates(data.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleGenerateMatches = async () => {
    setGeneratingMatches(true);
    try {
      const response = await fetch(`${API_BASE_URL}/matches/generate`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchApplicants();
      } else {
        alert(data.message || 'Failed to generate matches');
      }
    } catch (err) {
      alert('Error generating matches: ' + err.message);
    } finally {
      setGeneratingMatches(false);
    }
  };
  const toggleExpanded = (applicantId) => {
    setExpandedApplicants(prev => ({ ...prev, [applicantId]: !prev[applicantId] }));
  };
  useEffect(() => {
    let filtered = [...applicants];
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.application_date) - new Date(a.application_date));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.first_name.localeCompare(b.first_name));
    }
    setFilteredApplicants(filtered);
  }, [applicants, searchTerm, selectedStatus, sortBy]);

  const fetchApplicants = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE_URL}/applicants`);
      const data = await response.json();
      if (data.success) setApplicants(data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewDetail = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailModal(true);
  };

const handleUpdateApplicant = (updatedApplicant) => {
    setApplicants(applicants.map(app => app.id === updatedApplicant.id ? updatedApplicant : app));
  };

  const markAsMatched = async (applicant, organizationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applicants/${applicant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Matched', matched_organization_id: organizationId })
      });
      const data = await response.json();
      if (data.success) {
        handleUpdateApplicant({ ...applicant, status: 'Matched', matched_organization_id: organizationId });
      } else {
        alert(data.message || 'Could not mark as matched');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };


  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'Pending').length,
    review: applicants.filter(a => a.status === 'Under Review').length,
    matched: applicants.filter(a => a.status === 'Matched').length,
  };

  const skillsData = {};
  applicants.forEach(app => {
    if (app.skills && Array.isArray(app.skills)) {
      app.skills.forEach(skill => { skillsData[skill] = (skillsData[skill] || 0) + 1; });
    }
  });
  const topSkills = Object.entries(skillsData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const statusData = [
    { name: 'Pending', value: stats.pending, fill: '#D4AF37' },
    { name: 'Under Review', value: stats.review, fill: '#3B82F6' },
    { name: 'Matched', value: stats.matched, fill: '#10B981' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: NAVY, color: CREAM }}>

      {/* Calm navy/gold background — data-friendly, no heavy motion */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 20%, #14245C 0%, #0B1739 55%, #060D24 100%)' }}></div>
        <div className="absolute top-[-15%] left-[-10%] w-[34rem] h-[34rem] bg-[#D4AF37] rounded-full mix-blend-screen filter blur-[130px] opacity-[0.05] animate-dashGlow1"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[30rem] h-[30rem] bg-[#3B5FE0] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.06] animate-dashGlow2"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }}></div>

        {/* A few quiet floating knowledge icons for depth */}
        {[
          { x: 6, y: 12, icon: 'cap' }, { x: 92, y: 18, icon: 'book' },
          { x: 88, y: 70, icon: 'quill' }, { x: 4, y: 75, icon: 'cap' },
        ].map((node, i) => (
          <div key={i} className="absolute dash-node" style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${i * 0.7}s` }}>
            <div className="w-6 h-6 opacity-[0.08]" style={{ color: GOLD }}>
              {node.icon === 'cap' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 8l11 5 9-4.09V17h2V8L12 3z"/><path d="M5 10.5V15c0 1.66 3.13 3 7 3s7-1.34 7-3v-4.5l-7 3.18-7-3.18z" opacity="0.7"/></svg>)}
              {node.icon === 'book' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z" opacity="0.85"/></svg>)}
              {node.icon === 'quill' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2 4 14l3 3L20 2z" opacity="0.85"/><path d="M7 17 4 20l1.5.5L7 22l1-3-1-2z"/></svg>)}
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b relative" style={{ backgroundColor: 'rgba(11,23,57,0.75)', borderColor: 'rgba(245,240,230,0.1)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent animate-scanSweep"></div>
        </div>
        <div className="max-w-[1600px] mx-auto px-8 py-6 flex justify-between items-center relative">
          <div className="flex items-center gap-4">
            <NsaLogoBadge size="sm" />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Admin Hub</h1>
              <p className="text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>Placement Management System</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-6 relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'rgba(245,240,230,0.3)' }} />
            <input
              type="text"
              placeholder="Search applicants, organizations, graduates..."
              value={globalSearchTerm}
              onChange={(e) => { setGlobalSearchTerm(e.target.value); setShowGlobalResults(true); }}
              onFocus={() => setShowGlobalResults(true)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition"
              style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }}
            />
            {showGlobalResults && globalSearchTerm.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto"
                style={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.3)', zIndex: 9999 }}>

                {globalResults.applicants.length === 0 && globalResults.organizations.length === 0 && globalResults.graduates.length === 0 && (
                  <p className="p-4 text-sm text-center" style={{ color: 'rgba(245,240,230,0.4)' }}>No results found</p>
                )}

                {globalResults.applicants.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-semibold uppercase tracking-wide px-2 py-1" style={{ color: GOLD }}>Applicants</p>
                    {globalResults.applicants.map(a => (
                      <button key={a.id} onClick={() => { handleViewDetail(a); setShowGlobalResults(false); setGlobalSearchTerm(''); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex items-center gap-2">
                        <Users size={14} style={{ color: 'rgba(245,240,230,0.4)' }} />
                        <div>
                          <p className="text-sm" style={{ color: CREAM }}>{a.first_name} {a.last_name}</p>
                          <p className="text-xs" style={{ color: 'rgba(245,240,230,0.4)' }}>{a.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {globalResults.organizations.length > 0 && (
                  <div className="p-2 border-t" style={{ borderColor: 'rgba(245,240,230,0.08)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide px-2 py-1" style={{ color: GOLD }}>Organizations</p>
                    {globalResults.organizations.map(o => (
                      <button key={o.id} onClick={() => { setView('organizations'); setShowGlobalResults(false); setGlobalSearchTerm(''); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex items-center gap-2">
                        <FileText size={14} style={{ color: 'rgba(245,240,230,0.4)' }} />
                        <div>
                          <p className="text-sm" style={{ color: CREAM }}>{o.name}</p>
                          <p className="text-xs" style={{ color: 'rgba(245,240,230,0.4)' }}>{o.industry} · {o.positions_remaining ?? o.positions_available} remaining</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {globalResults.graduates.length > 0 && (
                  <div className="p-2 border-t" style={{ borderColor: 'rgba(245,240,230,0.08)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide px-2 py-1" style={{ color: GOLD }}>Eligible Graduates</p>
                    {globalResults.graduates.map(g => (
                      <button key={g.id} onClick={() => { setView('eligibility'); setShowGlobalResults(false); setGlobalSearchTerm(''); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex items-center gap-2">
                        <GraduationCap size={14} style={{ color: 'rgba(245,240,230,0.4)' }} />
                        <div>
                          <p className="text-sm" style={{ color: CREAM }}>{g.full_name}</p>
                          <p className="text-xs" style={{ color: 'rgba(245,240,230,0.4)' }}>{g.index_number}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => { setRefreshing(true); fetchApplicants(); }} disabled={refreshing} className="p-2 hover:bg-white/5 rounded-lg transition">
              <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : ''}`} style={{ color: GOLD }} />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition">
              <Settings size={20} style={{ color: GOLD }} />
            </button>
            <button onClick={() => logoutAdmin()} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 rounded-lg transition text-red-300">
              <LogOut size={18} />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-[1600px] mx-auto px-8 py-6 border-b relative z-10" style={{ borderColor: 'rgba(245,240,230,0.1)' }}>
        <div className="flex gap-4 overflow-x-auto">
          {['overview', 'applicants', 'matches', 'organizations', 'eligibility', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className="px-6 py-2 rounded-xl font-semibold transition whitespace-nowrap"
              style={view === tab
                ? { backgroundColor: GOLD, color: NAVY, boxShadow: '0 8px 20px rgba(212,175,55,0.25)' }
                : { color: 'rgba(245,240,230,0.5)' }
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-10 relative z-10">

        {/* OVERVIEW */}
        {view === 'overview' && (
          <div className="space-y-8">

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerateMatches}
                disabled={generatingMatches}
                className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition shadow-lg disabled:opacity-50"
                style={{ backgroundColor: GOLD, color: NAVY, boxShadow: '0 8px 20px rgba(212,175,55,0.25)' }}
              >
                {generatingMatches ? <Loader size={18} className="animate-spin" /> : <Zap size={18} />}
                {generatingMatches ? 'Generating...' : 'Generate Matches'}
              </button>
              <button
                onClick={() => setView('organizations')}
                className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
                style={{ border: '1px solid rgba(212,175,55,0.4)', color: GOLD }}
              >
                + Add Organization
              </button>
              <button
                onClick={() => setView('eligibility')}
                className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
                style={{ border: '1px solid rgba(212,175,55,0.4)', color: GOLD }}
              >
                + Add Eligible Graduate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Applicants', value: stats.total, icon: Users, accent: '#D4AF37', glow: 'rgba(212,175,55,0.25)' },
                { label: 'Pending', value: stats.pending, icon: FileText, accent: '#F59E0B', glow: 'rgba(245,158,11,0.25)' },
                { label: 'Under Review', value: stats.review, icon: Zap, accent: '#3B82F6', glow: 'rgba(59,130,246,0.25)' },
                { label: 'Matched', value: stats.matched, icon: TrendingUp, accent: '#10B981', glow: 'rgba(16,185,129,0.25)' },
              ].map((stat, idx) => (
                <div key={idx} className="group relative overflow-hidden backdrop-blur-lg border rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 shadow-xl"
                  style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)', boxShadow: `0 8px 30px ${stat.glow}` }}>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"></div>
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: stat.accent }}></div>
                  <div className="relative flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(245,240,230,0.5)' }}>{stat.label}</p>
                      <h3 className="text-5xl font-bold tabular-nums tracking-tight" style={{ color: stat.accent }}>{stat.value}</h3>
                    </div>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300" style={{ backgroundColor: `${stat.accent}22` }}>
                      <stat.icon size={28} style={{ color: stat.accent }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="backdrop-blur-lg border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
                <h3 className="text-lg font-bold mb-6" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Top Skills</h3>
                {topSkills.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSkills}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,230,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(245,240,230,0.5)" />
                      <YAxis stroke="rgba(245,240,230,0.5)" />
                      <Tooltip contentStyle={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: CREAM }} />
                      <Bar dataKey="value" fill="url(#goldGradient)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#8a6f24" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16">
                    <TrendingUp size={32} className="mx-auto mb-3" style={{ color: 'rgba(245,240,230,0.15)' }} />
                    <p style={{ color: 'rgba(245,240,230,0.3)' }}>No skills data yet</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(245,240,230,0.2)' }}>Charts will populate once applicants start applying</p>
                  </div>
                )}
              </div>

              <div className="backdrop-blur-lg border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
                <h3 className="text-lg font-bold mb-6" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Status Distribution</h3>
                {statusData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusData.filter(d => d.value > 0)} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={100} dataKey="value">
                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: CREAM }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16">
                    <TrendingUp size={32} className="mx-auto mb-3" style={{ color: 'rgba(245,240,230,0.15)' }} />
                    <p style={{ color: 'rgba(245,240,230,0.3)' }}>No status data yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="backdrop-blur-lg border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
              <h3 className="text-lg font-bold mb-6" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Recent Applications</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgba(245,240,230,0.1)' }}>
                      {['Name', 'Email', 'Programme', 'Status', 'Date', 'Action'].map(h => (
                        <th key={h} className="text-left py-4 px-4 font-semibold text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.slice(0, 8).map((app) => (
                      <tr key={app.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: 'rgba(245,240,230,0.05)' }}>
                        <td className="py-4 px-4 font-semibold text-sm" style={{ color: CREAM }}>{app.first_name} {app.last_name}</td>
                        <td className="py-4 px-4 text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{app.email}</td>
                        <td className="py-4 px-4 text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{app.programme}</td>
                        <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>{app.status}</span></td>
                        <td className="py-4 px-4 text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{formatDate(app.application_date)}</td>
                        <td className="py-4 px-4">
                          <button onClick={() => handleViewDetail(app)} className="transition text-sm font-semibold flex items-center gap-1" style={{ color: GOLD }}>
                            <Eye size={16} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="backdrop-blur-lg border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
              <h3 className="text-lg font-bold mb-6" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Recent Activity</h3>
              <div className="space-y-3">
                {(() => {
                  const activities = [
                    ...applicants.map(a => ({
                      type: 'application',
                      date: a.application_date,
                      text: `${a.first_name} ${a.last_name} submitted an application`,
                      icon: FileText,
                      color: '#3B82F6',
                    })),
                    ...eligibleGraduates.map(g => ({
                      type: 'eligibility',
                      date: g.created_at,
                      text: `${g.full_name} added to eligible graduate list (${g.university_name})`,
                      icon: Users,
                      color: GOLD,
                    })),
                  ]
                    .filter(a => a.date)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 8);

                  return activities.length > 0 ? activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor: 'rgba(245,240,230,0.05)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activity.color}22` }}>
                        <activity.icon size={14} style={{ color: activity.color }} />
                      </div>
                      <p className="text-sm flex-1" style={{ color: 'rgba(245,240,230,0.7)' }}>{activity.text}</p>
                      <p className="text-xs flex-shrink-0" style={{ color: 'rgba(245,240,230,0.3)' }}>{formatDate(activity.date)}</p>
                    </div>
                  )) : <p className="text-center py-8" style={{ color: 'rgba(245,240,230,0.3)' }}>No recent activity yet</p>;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* APPLICANTS */}
        {view === 'applicants' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'rgba(245,240,230,0.3)' }} />
                <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl pl-12 pr-4 py-3 focus:outline-none transition"
                  style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
              </div>
              <div className="flex gap-3">
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: NAVY, border: '1px solid rgba(245,240,230,0.15)', color: CREAM }}>
                  <option>All</option><option>Pending</option><option>Under Review</option><option>Matched</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: NAVY, border: '1px solid rgba(245,240,230,0.15)', color: CREAM }}>
                  <option value="recent">Most Recent</option><option value="name">By Name</option>
                </select>
                <button onClick={() => exportToCSV(filteredApplicants)} className="px-4 py-3 rounded-xl transition text-sm font-semibold flex items-center gap-2"
                  style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                  <Download size={18} /> CSV
                </button>
              </div>
            </div>

            <div className="backdrop-blur-lg border rounded-2xl p-6 overflow-x-auto shadow-xl" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader size={28} className="animate-spin" style={{ color: GOLD }} />
                  <p className="text-sm" style={{ color: 'rgba(245,240,230,0.4)' }}>Loading applicants...</p>
                </div>
              ) : filteredApplicants.length === 0 ? (
                <div className="text-center py-16">
                  <Users size={36} className="mx-auto mb-3" style={{ color: 'rgba(245,240,230,0.15)' }} />
                  <p style={{ color: 'rgba(245,240,230,0.4)' }}>
                    {searchTerm || selectedStatus !== 'All' ? 'No applicants match your filters' : 'No applicants yet'}
                  </p>
                  {(searchTerm || selectedStatus !== 'All') && (
                    <button onClick={() => { setSearchTerm(''); setSelectedStatus('All'); }} className="text-sm mt-2 underline" style={{ color: GOLD }}>
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgba(245,240,230,0.1)' }}>
                      {['Name', 'Email', 'Programme', 'Skills', 'Status', 'Date', 'Action'].map(h => (
                        <th key={h} className="text-left py-4 px-4 font-semibold text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: 'rgba(245,240,230,0.05)' }}>
                        <td className="py-4 px-4 font-semibold text-sm" style={{ color: CREAM }}>{app.first_name} {app.last_name}</td>
                        <td className="py-4 px-4 text-sm" style={{ color: GOLD }}>{app.email}</td>
                        <td className="py-4 px-4 text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{app.programme}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 flex-wrap max-w-xs">
                            {app.skills && app.skills.length > 0 ? app.skills.slice(0, 2).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: GOLD }}>{skill}</span>
                            )) : <span className="text-xs" style={{ color: 'rgba(245,240,230,0.3)' }}>—</span>}
                            {app.skills && app.skills.length > 2 && <span className="text-xs" style={{ color: 'rgba(245,240,230,0.3)' }}>+{app.skills.length - 2}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>{app.status}</span></td>
                        <td className="py-4 px-4 text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{formatDate(app.application_date)}</td>
                        <td className="py-4 px-4">
                          <button onClick={() => handleViewDetail(app)} className="transition text-sm font-semibold flex items-center gap-1" style={{ color: GOLD }}>
                            <Eye size={16} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="text-sm mt-6" style={{ color: 'rgba(245,240,230,0.3)' }}>Showing {filteredApplicants.length} of {applicants.length} applicants</p>
            </div>
          </div>
        )}

        {/* MATCHES */}
        {view === 'matches' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>AI Match Recommendations</h3>
              <p style={{ color: 'rgba(245,240,230,0.5)' }}>AI-powered matches for all applicants</p>
            </div>
            <div className="backdrop-blur-lg border rounded-2xl p-6 overflow-x-auto shadow-xl" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader size={28} className="animate-spin" style={{ color: GOLD }} />
                  <p className="text-sm" style={{ color: 'rgba(245,240,230,0.4)' }}>Loading matches...</p>
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-16">
                  <Zap size={36} className="mx-auto mb-3" style={{ color: 'rgba(245,240,230,0.15)' }} />
                  <p style={{ color: 'rgba(245,240,230,0.4)' }}>No applicants to match yet</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(245,240,230,0.25)' }}>Once applicants register, use Generate Matches on Overview</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {applicants.map((applicant) => {
                    const isExpanded = expandedApplicants[applicant.id];
                    return (
                    <div key={applicant.id} className="rounded-xl p-6" style={{ backgroundColor: 'rgba(245,240,230,0.03)', border: '1px solid rgba(245,240,230,0.08)' }}>
                      <div
                        onClick={() => toggleExpanded(applicant.id)}
                        className="mb-0 pb-4 flex justify-between items-start cursor-pointer select-none"
                        style={{ borderBottom: isExpanded ? '1px solid rgba(245,240,230,0.1)' : 'none', marginBottom: isExpanded ? '1rem' : 0 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'rgba(245,240,230,0.4)' }}>{isExpanded ? '▼' : '▶'}</span>
                          <div>
                            <h4 className="text-lg font-bold mb-1" style={{ color: CREAM }}>{applicant.first_name} {applicant.last_name}</h4>
                            <p className="text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{applicant.programme} • {applicant.email}
                              {' • '}<span style={{ color: applicant.matches?.length > 0 ? '#6ee7b7' : 'rgba(245,240,230,0.4)' }}>
                                {applicant.matches?.length || 0} match{applicant.matches?.length !== 1 ? 'es' : ''}
                              </span>
                            </p>
                          </div>
                        </div>
                        {applicant.status == 'Matched' && applicant.matches && applicant.matches.length > 0 && (
                          <button onClick={() => markAsMatched(applicant, applicant.matches[0].organization_id)} className="px-4 py-2 rounded-lg text-sm font-semibold transition flex-shrink-0"
                            style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                            Mark as Matched (Top Pick)
                          </button>
                        )}
                        {applicant.status === 'Matched' && (
                          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
                              ✓ Matched
                            </span>
                            <button
                              onClick={() => setPostingLetterApplicant(applicant)}
                              className="px-4 py-2 rounded-lg text-sm font-semibold transition"
                              style={{ backgroundColor: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}
                            >
                              View Letter
                            </button>
                          </div>
                        )}
                      </div>
                      {isExpanded && (
                      <div className="space-y-3">
                        {applicant.matches && applicant.matches.length > 0 ? applicant.matches.map((match, idx) => (
                          <div key={match.id} className="rounded-lg p-4 transition" style={{ backgroundColor: 'rgba(245,240,230,0.03)', border: '1px solid rgba(245,240,230,0.08)' }}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: GOLD, color: NAVY }}>#{idx + 1}</span>
                                  <h5 className="font-semibold" style={{ color: CREAM }}>{match.organization.name}</h5>
                                </div>
                                <p className="text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{match.organization.industry} • {match.organization.location}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold mb-1" style={{ color: GOLD }}>{match.match_score}%</div>
                                <span className="text-xs font-semibold px-2 py-1 rounded"
                                  style={match.match_score >= 80 ? { backgroundColor: 'rgba(16,185,129,0.15)', color: '#6ee7b7' } : match.match_score >= 60 ? { backgroundColor: 'rgba(59,130,246,0.15)', color: '#93c5fd' } : { backgroundColor: 'rgba(212,175,55,0.15)', color: GOLD }}>
                                  {match.match_score >= 80 ? 'Excellent' : match.match_score >= 60 ? 'Good' : 'Moderate'}
                                </span>
                              </div>
                            </div>
                            <div className="rounded p-3 mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                              <p className="text-sm flex items-start gap-2" style={{ color: 'rgba(245,240,230,0.7)' }}><Zap size={14} style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" /><span>{match.explanation}</span></p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="rounded p-2" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}><p className="text-xs" style={{ color: 'rgba(245,240,230,0.3)' }}>Positions</p><p className="font-semibold" style={{ color: CREAM }}>{match.organization.positions_available}</p></div>
                              <div className="rounded p-2" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}><p className="text-xs" style={{ color: 'rgba(245,240,230,0.3)' }}>Status</p><p className="font-semibold capitalize" style={{ color: CREAM }}>{match.status}</p></div>
                            </div>
                            <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'rgba(245,240,230,0.08)', color: 'rgba(245,240,230,0.3)' }}><p>📧 {match.organization.contact_email}</p></div>
                          </div>
                        )) : <p className="text-sm text-center py-4" style={{ color: 'rgba(245,240,230,0.3)' }}>No matches generated yet</p>}
                      </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORGANIZATIONS */}
        {view === 'organizations' && <OrganizationsTab />}

        {/* ELIGIBLE GRADUATES */}
        {view === 'eligibility' && <EligibleGraduatesTab />}

        {/* ANALYTICS */}
        {view === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Analytics</h3>
              <p style={{ color: 'rgba(245,240,230,0.5)' }}>Deeper insights into applicants and matching performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(() => {
                const allMatches = applicants.flatMap(a => a.matches || []);
                const avgScore = allMatches.length > 0 ? (allMatches.reduce((sum, m) => sum + m.match_score, 0) / allMatches.length).toFixed(1) : '0';
                const matchedCount = applicants.filter(a => a.matches && a.matches.length > 0).length;
                const matchRate = applicants.length > 0 ? ((matchedCount / applicants.length) * 100).toFixed(0) : '0';
                return (
                  <>
                    <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(245,240,230,0.04)', border: '1px solid rgba(245,240,230,0.1)' }}>
                      <p className="text-sm mb-2" style={{ color: 'rgba(245,240,230,0.5)' }}>Average Match Score</p>
                      <h3 className="text-4xl font-bold" style={{ color: GOLD }}>{avgScore}%</h3>
                    </div>
                    <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(245,240,230,0.04)', border: '1px solid rgba(245,240,230,0.1)' }}>
                      <p className="text-sm mb-2" style={{ color: 'rgba(245,240,230,0.5)' }}>Applicants Matched</p>
                      <h3 className="text-4xl font-bold" style={{ color: '#3B82F6' }}>{matchRate}%</h3>
                    </div>
                    <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(245,240,230,0.04)', border: '1px solid rgba(245,240,230,0.1)' }}>
                      <p className="text-sm mb-2" style={{ color: 'rgba(245,240,230,0.5)' }}>Total Matches Generated</p>
                      <h3 className="text-4xl font-bold" style={{ color: '#10B981' }}>{allMatches.length}</h3>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="backdrop-blur-lg border rounded-2xl p-6" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
                <h3 className="text-lg font-bold mb-6" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Top Organizations by Matches</h3>
                {(() => {
                  const orgCounts = {};
                  applicants.forEach(a => (a.matches || []).forEach(m => {
                    const name = m.organization.name;
                    orgCounts[name] = (orgCounts[name] || 0) + 1;
                  }));
                  const orgData = Object.entries(orgCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
                  return orgData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={orgData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,230,0.1)" />
                        <XAxis type="number" stroke="rgba(245,240,230,0.5)" />
                        <YAxis type="category" dataKey="name" stroke="rgba(245,240,230,0.5)" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: CREAM }} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center py-12" style={{ color: 'rgba(245,240,230,0.3)' }}>No match data yet</p>;
                })()}
              </div>

              <div className="backdrop-blur-lg border rounded-2xl p-6" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
                <h3 className="text-lg font-bold mb-6" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Qualification Breakdown</h3>
                {(() => {
                  const qualCounts = {};
                  applicants.forEach(a => { qualCounts[a.qualification] = (qualCounts[a.qualification] || 0) + 1; });
                  const qualData = Object.entries(qualCounts).map(([name, value], i) => ({ name, value, fill: ['#D4AF37', '#3B82F6', '#10B981'][i % 3] }));
                  return qualData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={qualData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={90} dataKey="value">
                          {qualData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: CREAM }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center py-12" style={{ color: 'rgba(245,240,230,0.3)' }}>No data yet</p>;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {showDetailModal && selectedApplicant && (
        <ApplicantDetail applicant={selectedApplicant} onClose={() => setShowDetailModal(false)} onUpdate={handleUpdateApplicant} />
      )}

      {postingLetterApplicant && (() => {
        const matchedOrg = postingLetterApplicant.matches?.find(
          m => m.organization_id === postingLetterApplicant.matched_organization_id
        )?.organization;
        return (
          <PostingLetter
            applicant={postingLetterApplicant}
            organization={matchedOrg}
            onClose={() => setPostingLetterApplicant(null)}
          />
        );
      })()}

      <style>{`
        @keyframes dashGlow1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.1); }
        }
        @keyframes dashGlow2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -30px) scale(1.1); }
        }
        .animate-dashGlow1 { animation: dashGlow1 14s ease-in-out infinite; }
        .animate-dashGlow2 { animation: dashGlow2 16s ease-in-out infinite; }

        @keyframes scanSweep {
          0% { left: -15%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 105%; opacity: 0; }
        }
        .animate-scanSweep { animation: scanSweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s 1 forwards; left: -15%; }

        .dash-node { animation: dashNodeFloat 8s ease-in-out infinite; }
        @keyframes dashNodeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
