import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Bookmark,
  ExternalLink,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { savedJobService } from '../services/savedJobService';
import { aiService } from '../services/aiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ApplicationModal from '../components/ApplicationModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobDetailsPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadJobDetails = async () => {
      setLoading(true);
      try {
        const data = await jobService.getJobById(id);
        if (data.success) {
          setJob(data.job);

          // Check if saved
          if (isAuthenticated) {
            try {
              const saved = await savedJobService.getSavedJobs();
              if (saved.success) {
                const found = saved.savedJobs.some(
                  (item) => String(item.job?._id || item.job?.id) === String(id)
                );
                setIsSaved(found);
              }
            } catch (e) {
              console.warn(e);
            }

            // Calculate AI match score for this job
            if (user?.profile?.skills?.length) {
              try {
                const matchRes = await aiService.matchJobs();
                if (matchRes.success) {
                  const currentMatch = matchRes.matches.find(
                    (m) => String(m.job._id || m.job.id) === String(id)
                  );
                  if (currentMatch) setMatchDetails(currentMatch);
                }
              } catch (e) {
                console.warn(e);
              }
            }
          }
        }
      } catch (err) {
        toast.error('Job details not found.');
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [id, isAuthenticated, user, toast]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save jobs.');
      return;
    }
    try {
      if (isSaved) {
        await savedJobService.removeSavedJob(id);
        setIsSaved(false);
        toast.info('Removed from saved jobs.');
      } else {
        await savedJobService.saveJob(id);
        setIsSaved(true);
        toast.success('Job saved to favorites!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)} / year`;
    return `${formatter.format(min || max)} / year`;
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner text="Loading job information..." size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Job listing not found</h2>
        <p className="text-sm text-slate-500 mb-6">This job may have expired or been removed.</p>
        <Link
          to="/jobs"
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center flex-shrink-0">
                {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {job.company}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                  {job.jobType || 'Full-time'}
                </span>
                {job.remoteType && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                      {job.remoteType}
                    </span>
                  </>
                )}
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                  {job.category}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
            <a
              href={job.applicationUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleToggleSave}
                className={`flex-1 sm:flex-none p-2.5 rounded-xl border transition flex items-center justify-center gap-1.5 text-xs font-semibold ${
                  isSaved
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => setIsTrackerOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
              >
                Track
              </button>
            </div>
          </div>
        </div>

        {/* Salary & Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block mb-1">Offered Compensation</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block mb-1">Experience Level</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-blue-600" />
              {job.experienceLevel || 'Entry Level'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block mb-1">Source / Verification</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              {job.source || 'Platform Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Match Overview Box (If user has skills) */}
      {matchDetails && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Compatibility Score for Your Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated against your profile skills & credentials
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-blue-700">
                {matchDetails.compatibilityScore}%
              </span>
            </div>
          </div>

          {/* Matching Skills */}
          {matchDetails.matchingSkills?.length > 0 && (
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Matching Skills You Possess ({matchDetails.matchingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchDetails.matchingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {matchDetails.missingSkills?.length > 0 && (
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Skills Desired for this Role ({matchDetails.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchDetails.missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-semibold border border-amber-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Required Skills Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Required Skills & Tools</h3>
        <div className="flex flex-wrap gap-2">
          {job.skillsRequired?.map((skill, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200/80"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Description & Responsibilities */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">Job Overview</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Key Responsibilities</h3>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(job.requirements) && job.requirements.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Qualifications & Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom Apply CTA */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Ready to take the next step?</span>
            <span className="text-sm font-bold text-slate-800">
              Apply directly on {job.company}'s official application portal
            </span>
          </div>

          <a
            href={job.applicationUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Apply on Company Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Tracker Modal */}
      <ApplicationModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        job={job}
        onSuccess={() => toast.success('Application recorded in your tracker!')}
      />
    </div>
  );
};

export default JobDetailsPage;
