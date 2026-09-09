// CSV Export
export const exportToCSV = (applicants, filename = 'applicants.csv') => {
  if (!applicants || applicants.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = ['ID', 'Name', 'Email', 'Phone', 'University', 'Programme', 'Skills', 'Interests', 'Status', 'Date'];
  
  const csvContent = [
    headers.join(','),
    ...applicants.map(app => [
      app.id,
      `"${app.first_name} ${app.last_name}"`,
      app.email,
      app.phone,
      `"${app.university}"`,
      `"${app.programme}"`,
      `"${Array.isArray(app.skills) ? app.skills.join('; ') : app.skills}"`,
      `"${Array.isArray(app.interests) ? app.interests.join('; ') : app.interests}"`,
      app.status,
      new Date(app.application_date).toLocaleDateString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// PDF Export (basic)
export const exportToPDF = (applicants, filename = 'applicants.pdf') => {
  if (!applicants || applicants.length === 0) {
    alert('No data to export');
    return;
  }

  let pdfContent = 'NSS Placement System - Applicants Report\n';
  pdfContent += `Generated: ${new Date().toLocaleString()}\n`;
  pdfContent += `Total Applicants: ${applicants.length}\n\n`;

  applicants.forEach((app, idx) => {
    pdfContent += `${idx + 1}. ${app.first_name} ${app.last_name}\n`;
    pdfContent += `   Email: ${app.email}\n`;
    pdfContent += `   Phone: ${app.phone}\n`;
    pdfContent += `   Programme: ${app.programme}\n`;
    pdfContent += `   Status: ${app.status}\n`;
    pdfContent += `   Skills: ${Array.isArray(app.skills) ? app.skills.join(', ') : app.skills}\n\n`;
  });

  const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.replace('.pdf', '.txt');
  link.click();
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-500/30 text-amber-300 border border-amber-400/50';
    case 'Under Review':
      return 'bg-blue-500/30 text-blue-300 border border-blue-400/50';
    case 'Matched':
      return 'bg-green-500/30 text-green-300 border border-green-400/50';
    case 'Placed':
      return 'bg-purple-500/30 text-purple-300 border border-purple-400/50';
    default:
      return 'bg-slate-500/30 text-slate-300 border border-slate-400/50';
  }
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Check if admin is logged in
export const isAdminLoggedIn = () => {
  return localStorage.getItem('adminToken') !== null;
};

// Logout admin
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminEmail');
  window.location.href = '/admin/login';
};