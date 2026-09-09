import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Book, Briefcase, Award, Calendar, Download, Trash2, Save } from 'lucide-react';
import { formatDate, getStatusColor } from '../utils/utilities';

export default function ApplicantDetail({ applicant, onClose, onUpdate }) {
  const [status, setStatus] = useState(applicant.status);
  const [saving, setSaving] = useState(false);

  const handleStatusUpdate = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      onUpdate({ ...applicant, status });
      setSaving(false);
      alert('Status updated successfully!');
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Applicant Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Personal Info */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Briefcase size={20} />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Full Name</p>
                <p className="text-white font-semibold">{applicant.first_name} {applicant.last_name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p className="text-blue-400 flex items-center gap-2">
                  <Mail size={16} />
                  {applicant.email}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Phone</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  <Phone size={16} />
                  {applicant.phone}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Location</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  <MapPin size={16} />
                  {applicant.location}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Book size={20} />
              Academic Background
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-slate-400 text-sm">University</p>
                <p className="text-white font-semibold">{applicant.university}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Programme</p>
                <p className="text-white font-semibold">{applicant.programme}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Qualification</p>
                <p className="text-white font-semibold">{applicant.qualification}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award size={20} />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {applicant.skills && Array.isArray(applicant.skills) && applicant.skills.length > 0 ? (
                applicant.skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm border border-blue-400/50">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-400">No skills listed</p>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Career Interests</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.interests && Array.isArray(applicant.interests) && applicant.interests.length > 0 ? (
                applicant.interests.map((interest, idx) => (
                  <span key={idx} className="bg-cyan-500/30 text-cyan-300 px-4 py-2 rounded-lg text-sm border border-cyan-400/50">
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-slate-400">No interests listed</p>
              )}
            </div>
          </div>

          {/* Career Goal */}
          {applicant.career_goal && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Career Goals</h3>
              <p className="text-slate-300">{applicant.career_goal}</p>
            </div>
          )}

          {/* Status Management */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Application Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-3">Current Status</p>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Matched">Matched</option>
                  <option value="Placed">Placed</option>
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={saving || status === applicant.status}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Calendar size={16} />
              <span>Applied on {formatDate(applicant.application_date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}