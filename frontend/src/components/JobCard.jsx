import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Bookmark,
  ExternalLink,
  Sparkles,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';

const JobCard = ({
  job,
  isSaved = false,
  onToggleSave,
  onOpenTracker,
  compatibilityScore = null,
  matchingSkills = [],
  missingSkills = [],
}) => {
  const formatSalary = (min, max, currency = 'USD', period = 'yearly') => {
    if (!min && !max) return 'Salary not disclosed';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)} / ${period === 'yearly' ? 'yr' : period}`;
    }
    return `${formatter.format(min || max)} / ${period === 'yearly' ? 'yr' : period}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header: Logo, Company, Title, and Save Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3.5">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0 bg-slate-50"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-lg items-center justify-center flex-shrink-0 ${
                job.companyLogo ? 'hidden' : 'flex'
              }`}
            >
              {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {job.company}
              </span>
              <Link
                to={`/jobs/${job._id || job.id}`}
                className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1"
              >
                {job.title}
              </Link>
            </div>
          </div>

          {/* Bookmark Button */}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(job._id || job.id)}
              className={`p-2 rounded-xl transition ${
                isSaved
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* AI Score Badge if provided */}
        {compatibilityScore !== null && (
          <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-medium">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Match Compatibility</span>
            </div>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                compatibilityScore >= 75
                  ? 'bg-emerald-100 text-emerald-800'
                  : compatibilityScore >= 50
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {compatibilityScore}%
            </span>
          </div>
        )}

        {/* Key Job Attributes */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-600 mb-3.5">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              {job.jobType || 'Full-time'}
            </span>
          </div>
          {job.remoteType && (
            <>
              <span className="text-slate-300">•</span>
              <span
                className={`px-2 py-0.5 rounded-md font-medium ${
                  job.remoteType === 'Remote'
                    ? 'bg-emerald-50 text-emerald-700'
                    : job.remoteType === 'Hybrid'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {job.remoteType}
              </span>
            </>
          )}
        </div>

        {/* Salary */}
        <div className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
          </span>
        </div>

        {/* Skills Required Chips */}
        {Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skillsRequired.slice(0, 4).map((skill, i) => {
              const isMatched = matchingSkills.some((m) => m.toLowerCase() === skill.toLowerCase());
              return (
                <span
                  key={i}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {job.skillsRequired.length > 4 && (
              <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 text-slate-400 font-medium border border-slate-100">
                +{job.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Date and Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(job.createdAt)}
        </span>

        <div className="flex items-center gap-2">
          {onOpenTracker && (
            <button
              onClick={() => onOpenTracker(job)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              Track
            </button>
          )}

          <a
            href={job.applicationUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition hover:shadow"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
