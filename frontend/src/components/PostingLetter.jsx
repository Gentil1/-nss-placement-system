import React from 'react';
import { Printer, X, GraduationCap } from 'lucide-react';

export default function PostingLetter({ applicant, organization, onClose }) {
  if (!applicant || !organization) return null;

  const referenceNumber = `NSS/PL/${new Date().getFullYear()}/${String(applicant.id).padStart(5, '0')}`;
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-8 px-4 print:bg-white print:p-0">

      {/* Toolbar — hidden when printing */}
      <div className="fixed top-4 right-4 flex gap-3 print:hidden z-10">
        <button
          onClick={handlePrint}
          className="px-5 py-3 bg-[#D4AF37] hover:bg-[#e5c04f] text-[#0B1739] font-bold rounded-lg flex items-center gap-2 shadow-lg transition"
        >
          <Printer size={18} /> Print / Save as PDF
        </button>
        <button
          onClick={onClose}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 backdrop-blur-sm transition"
        >
          <X size={18} /> Close
        </button>
      </div>

      {/* The Letter — this is what prints */}
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-lg shadow-2xl print:shadow-none print:rounded-none p-12 print:p-8 my-4 print:my-0">

        {/* Letterhead */}
        <div className="flex items-center justify-between border-b-4 border-[#D4AF37] pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0B1739' }}>
            <img src="/nsa-logo.png" alt="National Service Authority" className="w-28 h-auto object-contain" />
          </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0B1739]" style={{ fontFamily: 'Georgia, serif' }}>National Service Authority</h1>
              <p className="text-slate-500 text-sm">Republic of Ghana</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Ref: {referenceNumber}</p>
            <p>Date: {issueDate}</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-[#0B1739] uppercase tracking-wide mb-8" style={{ fontFamily: 'Georgia, serif' }}>
          Letter of Posting
        </h2>

        {/* Recipient */}
        <div className="mb-6">
          <p className="font-semibold text-slate-800">{applicant.first_name} {applicant.last_name}</p>
          <p className="text-slate-600 text-sm">{applicant.email}</p>
          <p className="text-slate-600 text-sm">{applicant.location}</p>
        </div>

        {/* Body */}
        <div className="space-y-4 text-slate-700 leading-relaxed text-[15px]">
          <p>Dear {applicant.first_name},</p>

         <p>
            We are pleased to inform you that, following the completion of your registration and
            placement review, you have been posted to serve your mandatory National Service
            at the organization detailed below.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 my-6">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-semibold text-slate-500 w-1/3">Organization</td>
                  <td className="py-2 text-slate-800 font-semibold">{organization.name}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-semibold text-slate-500">Industry</td>
                  <td className="py-2 text-slate-800">{organization.industry}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-semibold text-slate-500">Region / District</td>
                  <td className="py-2 text-slate-800">{organization.region || organization.location}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-semibold text-slate-500">Location</td>
                  <td className="py-2 text-slate-800">{organization.location}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-semibold text-slate-500">Programme</td>
                  <td className="py-2 text-slate-800">{applicant.programme}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-slate-500">Contact Person</td>
                  <td className="py-2 text-slate-800">{organization.contact_person || 'HR Department'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="font-semibold text-slate-800">Reporting Instructions:</p>
          <p>
            Kindly report to the above-named organization within fourteen (14) working days of the
            date of this letter, along with a copy of this posting letter, your Ghana Card, and any
            other credentials requested by the organization. The organization will verify your posting
            and confirm your resumption of service.
          </p>

          <p>
            Please note that failure to report within the stipulated period without valid justification
            may result in a review of your posting. Should you have any concerns regarding this posting,
            you may apply for reconsideration through the appropriate channels.
          </p>

          <p>We wish you a productive and fulfilling service year.</p>
        </div>

        {/* Signature */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end">
          <div>
            <p className="text-slate-800 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>National Service Authority</p>
            <p className="text-slate-500 text-xs">Placement Division</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>This is a system-generated document.</p>
            <p>Reference: {referenceNumber}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0.5cm; }
        }
      `}</style>
    </div>
  );
}
