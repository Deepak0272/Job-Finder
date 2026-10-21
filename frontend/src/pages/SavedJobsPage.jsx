import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, Trash2, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { savedJobService } from '../services/savedJobService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ApplicationModal from '../components/ApplicationModal';
import { useToast } from '../context/ToastContext';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingJob, setTrackingJob] = useState(null);
  const toast = useToast();

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await savedJobService.getSavedJobs();
      if (res.success) {
        setSavedJobs(res.savedJobs || []);
      }
    } catch (err) {
      toast.error('Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await savedJobService.removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => String(item.job?._id || item.job?.id) !== String(jobId)));
      toast.info('Job removed from saved list.');
    } catch (err) {
      toast.error('Failed to remove job.');
    }
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Salary not disclosed';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)} / yr`;
    return `${formatter.format(min || max)} / yr`;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Jobs ({savedJobs.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bookmarked opportunities saved to your account for future reference and application
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16">
          <LoadingSpinner text="Loading your bookmarked jobs..." />
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Browse available job listings and click the bookmark icon to save roles here."
          actionLabel="Discover Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((item) => {
            const job = item.job;
            if (!job) return null;
            const jobId = job._id || job.id;

            return (
              <div
                key={item._id || jobId}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.company}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center flex-shrink-0">
                          {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                        </div>
                      )}

                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                          {job.company}
                        </span>
                        <Link
                          to={`/jobs/${jobId}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition"
                        >
                          {job.title}
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(jobId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Attributes */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {job.category}
                    </span>
                    {job.remoteType && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                          {job.remoteType}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-slate-800 mb-4 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <button
                    onClick={() => setTrackingJob(job)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Track Application
                  </button>

                  <a
                    href={job.applicationUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition hover:shadow"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Tracker Modal */}
      <ApplicationModal
        isOpen={Boolean(trackingJob)}
        onClose={() => setTrackingJob(null)}
        job={trackingJob}
        onSuccess={() => toast.success('Application recorded in your tracker!')}
      />
    </div>
  );
};

export default SavedJobsPage;
