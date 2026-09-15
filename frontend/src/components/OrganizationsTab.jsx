import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Building2, Loader, MapPin, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '../config';

const GOLD = '#D4AF37';
const CREAM = '#F5F0E6';
const NAVY = '#0B1739';

const emptyForm = {
  name: '', industry: '', location: '', region: '', description: '',
  required_skills: '', preferred_qualification: '', positions_available: 1,
  contact_email: '', contact_person: ''
};

export default function OrganizationsTab() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/organizations`);
      const data = await response.json();
      if (data.success) setOrganizations(data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (org) => {
    setEditingId(org.id);
    const skillsValue = Array.isArray(org.required_skills) ? org.required_skills.join(', ') : (org.required_skills || '');
    setFormData({
      name: org.name || '', industry: org.industry || '', location: org.location || '', region: org.region || '',
      description: org.description || '', required_skills: skillsValue,
      preferred_qualification: org.preferred_qualification || '', positions_available: org.positions_available || 1,
      contact_email: org.contact_email || '', contact_person: org.contact_person || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.industry || !formData.location) {
      setError('Name, industry, and location are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = editingId ? `${API_BASE_URL}/organizations/${editingId}` : `${API_BASE_URL}/organizations`;
      const method = editingId ? 'PUT' : 'POST';
      const token = localStorage.getItem('adminToken');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        fetchOrganizations();
      } else {
        setError(data.message || 'Failed to save organization');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) fetchOrganizations();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>Organizations</h3>
          <p style={{ color: 'rgba(245,240,230,0.5)' }}>Manage placement organizations available for AI matching</p>
        </div>
        <button onClick={openAddModal} className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition shadow-lg"
          style={{ backgroundColor: GOLD, color: NAVY, boxShadow: '0 8px 20px rgba(212,175,55,0.25)' }}>
          <Plus size={18} /> Add Organization
        </button>
      </div>

      <div className="backdrop-blur-lg border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'rgba(245,240,230,0.04)', borderColor: 'rgba(245,240,230,0.1)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader size={32} className="animate-spin" style={{ color: GOLD }} /></div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={40} className="mx-auto mb-3" style={{ color: 'rgba(245,240,230,0.2)' }} />
            <p style={{ color: 'rgba(245,240,230,0.4)' }} className="mb-4">No organizations yet — add one to start matching applicants</p>
            <button onClick={openAddModal} className="px-5 py-2.5 rounded-lg font-semibold text-sm transition"
              style={{ backgroundColor: GOLD, color: NAVY }}>
              + Add Your First Organization
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <div key={org.id} className="rounded-xl p-5 transition hover:-translate-y-1"
                style={{ backgroundColor: 'rgba(245,240,230,0.03)', border: '1px solid rgba(245,240,230,0.08)' }}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg" style={{ color: CREAM }}>{org.name}</h4>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(org)} className="p-1.5 rounded hover:bg-white/10 transition" style={{ color: GOLD }}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(org.id, org.name)} className="p-1.5 rounded hover:bg-red-500/10 transition text-red-400">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm mb-3" style={{ color: 'rgba(245,240,230,0.5)' }}>
                  <p className="flex items-center gap-2"><Briefcase size={13} /> {org.industry}</p>
                  <p className="flex items-center gap-2"><MapPin size={13} /> {org.location}</p>
                </div>
                {org.required_skills && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(Array.isArray(org.required_skills) ? org.required_skills : org.required_skills.split(',')).slice(0, 3).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: GOLD }}>{typeof s === 'string' ? s.trim() : s}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t text-xs" style={{ borderColor: 'rgba(245,240,230,0.08)', color: 'rgba(245,240,230,0.3)' }}>
                  <span>{org.positions_remaining ?? org.positions_available} of {org.positions_available} remaining</span>
                  <span>{org.contact_email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(6,13,36,0.85)' }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: CREAM, fontFamily: 'Georgia, serif' }}>
                {editingId ? 'Edit Organization' : 'Add Organization'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(245,240,230,0.4)' }}><X size={20} /></button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Organization Name *"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
              <div className="grid grid-cols-2 gap-3">
                <input name="industry" value={formData.industry} onChange={handleChange} placeholder="Industry *"
                  className="px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Location *"
                  className="px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
              </div>
              <select name="region" value={formData.region} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }}>
                <option value="" className="bg-[#0B1739]">Select region</option>
                {['Greater Accra', 'Ashanti', 'Eastern', 'Western', 'Central', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 'Bono East', 'Ahafo', 'Western North', 'Oti', 'North East', 'Savannah'].map(r => (
                  <option key={r} value={r} className="bg-[#0B1739]">{r}</option>
                ))}
              </select>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows="2"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none resize-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
              <input name="required_skills" value={formData.required_skills} onChange={handleChange} placeholder="Required Skills (comma-separated)"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
              <input name="preferred_qualification" value={formData.preferred_qualification} onChange={handleChange} placeholder="Preferred Qualification"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1" name="positions_available" value={formData.positions_available} onChange={handleChange} placeholder="Positions"
                  className="px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
                <input name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="Contact Person"
                  className="px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
              </div>
              <input name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="Contact Email"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: 'rgba(245,240,230,0.05)', border: '1px solid rgba(245,240,230,0.15)', color: CREAM }} />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-lg font-semibold text-sm transition"
                style={{ border: '1px solid rgba(245,240,230,0.2)', color: 'rgba(245,240,230,0.6)' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-lg font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: GOLD, color: NAVY }}>
                {saving ? <><Loader size={16} className="animate-spin" /> Saving...</> : editingId ? 'Update' : 'Add Organization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
