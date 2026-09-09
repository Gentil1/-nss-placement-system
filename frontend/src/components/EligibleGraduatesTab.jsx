import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, GraduationCap, Loader, Upload, UserCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

const GOLD = '#D4AF37';
const CREAM = '#F5F0E6';
const NAVY = '#0B1739';

const emptyForm = {
  full_name: '', index_number: '', date_of_birth: '',
  university_name: '', programme: '', gender: '', graduation_status: 'Completed'
};

export default function EligibleGraduatesTab() {
  const [graduates, setGraduates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('single'); // 'single' or 'bulk'
  const [formData, setFormData] = useState(emptyForm);
  const [bulkText, setBulkText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchGraduates();
  }, []);

  const fetchGraduates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/eligible-graduates`);
      const data = await response.json();
      if (data.success) setGraduates(data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setFormData(emptyForm);
    setBulkText('');
    setError('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSingle = async () => {
    if (!formData.full_name || !formData.index_number || !formData.date_of_birth || !formData.university_name || !formData.programme) {
      setError('All fields except gender are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/eligible-graduates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        fetchGraduates();
      } else {
        setError(data.message || 'Failed to add graduate');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Bulk format: one graduate per line, comma-separated:
  // Full Name, Index Number, YYYY-MM-DD, University, Programme, Gender
  const handleSaveBulk = async () => {
    const lines = bulkText.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      setError('Paste at least one graduate row');
      return;
    }

    const graduatesList = [];
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 5) continue;
      graduatesList.push({
        full_name: parts[0],
        index_number: parts[1],
        date_of_birth: parts[2],
        university_name: parts[3],
        programme: parts[4],
        gender: parts[5] || ''
      });
    }

    if (graduatesList.length === 0) {
      setError('Could not parse any valid rows. Check the format.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/eligible-graduates/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graduates: graduatesList })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`Added ${data.added}, skipped ${data.skipped} duplicates`);
        fetchGraduates();
        setBulkText('');
      } else {
        setError(data.message || 'Failed to submit list');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the eligible list?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/eligible-graduates/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) fetchGraduates();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Eligible Graduates</h3>
          <p style={{ color: 'rgba(245,240,230,0.5)' }}>Verified graduate lists submitted by universities — only these students can register</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openModal('bulk')} className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
            style={{ border: '1px solid rgba(212,175,55,0.4)', color: GOLD }}>
            <Upload size={18} /> Bulk Submit
          </button>
          <button onClick={() => openModal('single')} className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition shadow-lg"
            style={{ backgroundColor: GOLD, color: NAVY, boxShadow: '0 8px 20px rgba(212,175,55,0.25)' }}>
            <Plus size={18} /> Add Graduate
          </button>
        </div>
      </div>

      <div className="backdrop-blur-lg border rounded-2xl p-6 shadow-xl overflow-x-auto" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader size={32} className="animate-spin" style={{ color: GOLD }} /></div>
        ) : graduates.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap size={40} className="mx-auto mb-3" style={{ color: 'rgba(245,240,230,0.2)' }} />
            <p style={{ color: 'rgba(245,240,230,0.4)' }} className="mb-4">No eligible graduates submitted yet</p>
            <button onClick={() => openModal('single')} className="px-5 py-2.5 rounded-lg font-semibold text-sm transition"
              style={{ backgroundColor: GOLD, color: NAVY }}>
              + Add First Graduate
            </button>
          </div>
        ) : (
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(245,240,230,0.1)' }}>
                {['Name', 'Index Number', 'University', 'Programme', 'Registered?', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {graduates.map((g) => (
                <tr key={g.id} className="border-b hover:bg-white/5 transition" style={{ borderColor: 'rgba(245,240,230,0.05)' }}>
                  <td className="py-3 px-4 font-semibold text-sm" style={{ color: CREAM }}>{g.full_name}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: GOLD }}>{g.index_number}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{g.university_name}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>{g.programme}</td>
                  <td className="py-3 px-4">
                    {g.is_registered ? (
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#6ee7b7' }}><UserCheck size={14} /> Registered</span>
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(245,240,230,0.3)' }}>Not yet</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(g.id, g.full_name)} className="p-1.5 rounded hover:bg-red-500/10 transition text-red-400">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(6,13,36,0.85)' }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-2xl rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>
                {modalMode === 'single' ? 'Add Eligible Graduate' : 'Bulk Submit Graduate List'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(245,240,230,0.4)' }}><X size={20} /></button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                {successMsg}
              </div>
            )}

            {modalMode === 'single' ? (
              <div className="space-y-4">
                <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name *"
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
                <div className="grid grid-cols-2 gap-3">
                  <input name="index_number" value={formData.index_number} onChange={handleChange} placeholder="Index Number *"
                    className="px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                    className="px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
                </div>
                <input name="university_name" value={formData.university_name} onChange={handleChange} placeholder="University Name *"
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
                <input name="programme" value={formData.programme} onChange={handleChange} placeholder="Programme *"
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }}>
                  <option value="" className="bg-[#0B1739]">Select gender (optional)</option>
                  <option value="Male" className="bg-[#0B1739]">Male</option>
                  <option value="Female" className="bg-[#0B1739]">Female</option>
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'rgba(245,240,230,0.5)' }}>
                  One graduate per line: <span style={{ color: GOLD }}>Full Name, Index Number, YYYY-MM-DD, University, Programme, Gender</span>
                </p>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows="10"
                  placeholder="Kofi Mensah, UG/CS/21/001, 2000-05-14, University of Ghana, Computer Science, Male&#10;Ama Owusu, UG/CS/21/002, 2001-02-03, University of Ghana, Computer Science, Female"
                  className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none resize-none font-mono"
                  style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }}
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-lg font-semibold text-sm transition"
                style={{ border: '1px solid rgba(245,240,230,0.2)', color: 'rgba(245,240,230,0.6)' }}>
                Close
              </button>
              <button onClick={modalMode === 'single' ? handleSaveSingle : handleSaveBulk} disabled={saving}
                className="flex-1 py-3 rounded-lg font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: GOLD, color: NAVY }}>
                {saving ? <><Loader size={16} className="animate-spin" /> Submitting...</> : modalMode === 'single' ? 'Add Graduate' : 'Submit List'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
