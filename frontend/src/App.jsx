import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MillionDollarVersion from './pages/MillionDollarVersion';
import ApplicationForm from './pages/ApplicationForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ApplicantResults from './pages/ApplicantResults';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MillionDollarVersion />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/results" element={<ApplicantResults />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
      
      </Routes>
    </Router>
  );
}