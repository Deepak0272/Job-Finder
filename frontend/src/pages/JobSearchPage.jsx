import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { savedJobService } from '../services/savedJobService';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ApplicationModal from '../components/ApplicationModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  // Filters state initialized from query params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || 'All',
    remoteType: searchParams.get('remoteType') || 'All',
    jobType: searchParams.get('jobType') || 'All',
    experienceLevel: searchParams.get('experienceLevel') || 'All',
    minSalary: searchParams.get('minSalary') || '',
    includeExternal: searchParams.get('includeExternal') === 'true',
    sort: searchParams.get('sort') || '-createdAt',
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [trackingJob, setTrackingJob] = useState(null);

  const { isAuthenticated } = useAuth();
  const toast = useToast();

  // Load saved jobs for user to show active bookmark states
  const loadSavedJobIds = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await savedJobService.getSavedJobs();
      if (res.success) {
        const ids = new Set(res.savedJobs.map((item) => String(item.job?._id || item.job?.id)));
        setSavedJobIds(ids);
      }
    } catch (err) {
      console.warn('Could not fetch saved jobs:', err.message);
    }
  }, [isAuthenticated]);

  // Fetch jobs according to current filters & page
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort: filters.sort,
      };

      if (filters.search) params.search = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.remoteType && filters.remoteType !== 'All') params.remoteType = filters.remoteType;
      if (filters.jobType && filters.jobType !== 'All') params.jobType = filters.jobType;
      if (filters.experienceLevel && filters.experienceLevel !== 'All') params.experienceLevel = filters.experienceLevel;
      if (filters.minSalary) params.minSalary = filters.minSalary;
      if (filters.includeExternal) params.includeExternal = 'true';

      const data = await jobService.getJobs(params);
      if (data.success) {
        setJobs(data.jobs || []);
        setTotalJobs(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load jobs list.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, toast]);

  useEffect(() => {
    fetchJobs();
    loadSavedJobIds();
  }, [fetchJobs, loadSavedJobIds]);

  // Update query params in URL when filters change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      const q = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        if (v && v !== 'All' && v !== false) q.set(k, v);
      });
      q.set('page', '1');
      setSearchParams(q);
      return updated;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      search: '',
      location: '',
      category: 'All',
      remoteType: 'All',
      jobType: 'All',
      experienceLevel: 'All',
      minSalary: '',
      includeExternal: false,
      sort: '-createdAt',
    };
    setFilters(defaultFilters);
    setSearchParams({});
    setCurrentPage(1);
  };

  // Toggle Save Job
  const handleToggleSave = async (jobId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to save jobs to your favorites.');
      return;
    }

    try {
      if (savedJobIds.has(String(jobId))) {
        await savedJobService.removeSavedJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(String(jobId));
          return next;
        });
        toast.info('Removed from saved jobs.');
      } else {
        await savedJobService.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(String(jobId)));
        toast.success('Job saved to your bookmarks!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchJobs();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl w-full">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by job title, skills (e.g. CCNA, React, Linux)..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex-1 sm:max-w-xs flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl w-full">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Location (city or Remote)..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm transition"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl flex items-center justify-center gap-1.5 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </form>
      </div>

      {/* Main Grid: Sidebar Filters + Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />

          {/* External Jobs Provider Toggle */}
          <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Include Live Remote APIs</span>
            </div>
            <input
              type="checkbox"
              checked={filters.includeExternal}
              onChange={(e) => handleFilterChange('includeExternal', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Mobile Filter Modal / Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden flex justify-end">
            <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-base text-slate-900">Filters</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
              <JobFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Results Summary & Sorting Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{jobs.length}</span> of{' '}
              <span className="font-bold text-slate-900">{totalJobs}</span> available opportunities
              {filters.category !== 'All' && (
                <span className="ml-1 text-blue-600 font-semibold">in {filters.category}</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="-createdAt">Newest First</option>
                <option value="-salaryMax">Highest Salary</option>
                <option value="title">Job Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Jobs Listing Grid */}
          {loading ? (
            <div className="py-12">
              <LoadingSpinner text="Searching jobs database..." />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No jobs matched your criteria"
              description="Try relaxing your salary threshold, removing specific keywords, or clearing your category filters."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job._id || job.id}
                  job={job}
                  isSaved={savedJobIds.has(String(job._id || job.id))}
                  onToggleSave={handleToggleSave}
                  onOpenTracker={(j) => setTrackingJob(j)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-xs font-semibold text-slate-600 px-3">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Application Tracker Modal */}
      <ApplicationModal
        isOpen={Boolean(trackingJob)}
        onClose={() => setTrackingJob(null)}
        job={trackingJob}
        onSuccess={() => toast.success('Application added to your tracker!')}
      />
    </div>
  );
};

export default JobSearchPage;
