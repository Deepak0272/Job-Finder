import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { useToast } from '../context/ToastContext';

const STATUSES = ['Interested', 'Applied', 'Interview', 'Rejected', 'Offer'];

const ApplicationModal = ({ isOpen, onClose, job, existingApplication, onSuccess }) => {
  const [status, setStatus] = useState('Interested');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [salaryOffered, setSalaryOffered] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (existingApplication) {
      setStatus(existingApplication.status || 'Interested');
      setJobTitle(existingApplication.jobTitle || '');
      setCompanyName(existingApplication.companyName || '');
      setLocation(existingApplication.location || '');
      setNotes(existingApplication.notes || '');
      setApplicationDate(
        existingApplication.applicationDate
          ? new Date(existingApplication.applicationDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setSalaryOffered(existingApplication.salaryOffered || '');
    } else if (job) {
      setStatus('Applied');
      setJobTitle(job.title || '');
      setCompanyName(job.company || '');
      setLocation(job.location || '');
      setNotes('');
      setApplicationDate(new Date().toISOString().split('T')[0]);
      setSalaryOffered('');
    }
  }, [job, existingApplication, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existingApplication) {
        // Update
        const res = await applicationService.updateApplication(existingApplication._id, {
          status,
          notes,
          applicationDate,
          salaryOffered: salaryOffered ? Number(salaryOffered) : null,
        });
        if (res.success) {
          toast.success('Application updated successfully!');
          onSuccess && onSuccess(res.application);
          onClose();
        }
      } else {
        // Create new
        const res = await applicationService.createApplication({
          jobId: job?._id || job?.id || null,
          jobTitle,
          companyName,
          location,
          applicationUrl: job?.applicationUrl || '',
          status,
          notes,
          applicationDate,
          salaryOffered: salaryOffered ? Number(salaryOffered) : null,
        });
        if (res.success) {
          toast.success('Application added to your tracker!');
          onSuccess && onSuccess(res.application);
          onClose();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {existingApplication ? 'Update Application' : 'Track Job Application'}
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Record your progress, notes, and milestones for this opportunity.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Title & Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status selector pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Application Status
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {STATUSES.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl text-center transition border ${
                    status === st
                      ? st === 'Offer'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : st === 'Rejected'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                        : st === 'Interview'
                        ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                        : 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Application Date & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Date
              </label>
              <input
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Remote or Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Salary Offered if status is Offer */}
          {status === 'Offer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salary Offered ($ / yr)
              </label>
              <input
                type="number"
                placeholder="e.g. 95000"
                value={salaryOffered}
                onChange={(e) => setSalaryOffered(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Notes & Follow-up Details
            </label>
            <textarea
              rows={3}
              placeholder="e.g., Interview with Hiring Manager scheduled for Thursday; prepared network diagram notes."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : existingApplication ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;
