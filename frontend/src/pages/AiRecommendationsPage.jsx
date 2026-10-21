import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
  UploadCloud,
  Plus,
  X,
  ExternalLink,
  Bookmark,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { savedJobService } from '../services/savedJobService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ApplicationModal from '../components/ApplicationModal';

const CATEGORY_TABS = [
  'All',
  'IT Support',
  'Network Engineer',
  'Cyber Security',
  'Software Developer',
  'Data Analyst',
];

const AiRecommendationsPage = () => {
  const { user, updateProfile } = useAuth();
  const { openResumeModal } = useOutletContext();
  const toast = useToast();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [newSkillInput, setNewSkillInput] = useState('');
  const [trackingJob, setTrackingJob] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  // Fetch AI Match Results
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiService.matchJobs({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      if (res.success) {
        setMatches(res.matches || []);
      }

      // Also get career certifications roadmap
      const roadRes = await aiService.getSkillRecommendations({
        targetCategory: selectedCategory !== 'All' ? selectedCategory : 'IT Support',
      });
      if (roadRes.success) {
        setRoadmap(roadRes.roadmap);
      }
    } catch (err) {
      toast.error('Failed to compute AI matches.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, toast]);

  // Load user saved jobs
  const loadSavedJobs = useCallback(async () => {
    try {
      const res = await savedJobService.getSavedJobs();
      if (res.success) {
        setSavedJobIds(new Set(res.savedJobs.map((item) => String(item.job?._id || item.job?.id))));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    loadSavedJobs();
  }, [fetchMatches, loadSavedJobs]);

  // Handle adding a skill to profile
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const currentSkills = user?.profile?.skills || [];
    if (currentSkills.map((s) => s.toLowerCase()).includes(newSkillInput.trim().toLowerCase())) {
      toast.info('Skill already exists in your profile.');
      setNewSkillInput('');
      return;
    }
    const updated = [...currentSkills, newSkillInput.trim()];
    const res = await updateProfile({ skills: updated });
    if (res?.success) {
      setNewSkillInput('');
      fetchMatches();
    }
  };

  // Handle removing a skill from profile
  const handleRemoveSkill = async (skillToRemove) => {
    const currentSkills = user?.profile?.skills || [];
    const updated = currentSkills.filter((s) => s !== skillToRemove);
    const res = await updateProfile({ skills: updated });
    if (res?.success) {
      fetchMatches();
    }
  };

  // Toggle Save Job
  const handleToggleSave = async (jobId) => {
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
      toast.error('Failed to toggle save.');
    }
  };

  const userSkills = user?.profile?.skills || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner: Profile Skills Summary & Resume Upload */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Recommendation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Job Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Matching your profile against active jobs with verified compatibility scores
            </p>
          </div>

          <button
            onClick={openResumeModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 self-start md:self-center"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Resume (PDF)</span>
          </button>
        </div>

        {/* User Skills Pills Editor */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Your Current Profile Skills ({userSkills.length})
            </span>
            <span className="text-xs text-slate-400">
              Click <X className="w-3 h-3 inline" /> to remove, or add new skills below
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {userSkills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                No skills added yet. Type a skill or upload your PDF resume to extract them automatically!
              </span>
            ) : (
              userSkills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Add Skill Input */}
          <form onSubmit={handleAddSkill} className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="Add skill (e.g. CCNA, Python, Active Directory)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
          Filter:
        </span>
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Matched Jobs Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner text="Computing neural skill compatibility..." size="lg" />
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No recommendations found"
          description="Try adding skills to your profile or selecting another category filter."
          actionLabel="Add Skills"
          onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {matches.map((item) => {
            const { job, compatibilityScore, matchingSkills, missingSkills, recommendations } = item;
            const isSaved = savedJobIds.has(String(job._id || job.id));

            return (
              <div
                key={job._id || job.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Score Badge & Save Button */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-sm ${
                          compatibilityScore >= 75
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : compatibilityScore >= 50
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {compatibilityScore}%
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {compatibilityScore >= 75
                            ? 'High Compatibility Match'
                            : compatibilityScore >= 50
                            ? 'Moderate Match'
                            : 'Foundational Match'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {matchingSkills.length} skills matched • {missingSkills.length} missing
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSave(job._id || job.id)}
                      className={`p-2 rounded-xl transition ${
                        isSaved ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save job'}
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Company */}
                  <div className="mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {job.company}
                    </span>
                    <Link
                      to={`/jobs/${job._id || job.id}`}
                      className="text-lg font-extrabold text-slate-900 hover:text-blue-600 transition"
                    >
                      {job.title}
                    </Link>
                  </div>

                  {/* Details bar */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-4">
                    <span className="font-semibold text-slate-700">{job.location}</span>
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

                  {/* Matching Skills */}
                  {matchingSkills.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Matching Skills You Have ({matchingSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {matchingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {missingSkills.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Skills to Strengthen ({missingSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {missingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200/80"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => setTrackingJob(job)}
                    className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Track Application
                  </button>

                  <a
                    href={job.applicationUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition hover:shadow"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Career Certifications & Skill Gap Roadmap Card */}
      {roadmap && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold">
              Career Growth & Certification Roadmap ({roadmap.targetCategory})
            </h3>
          </div>
          <p className="text-xs text-slate-300 mb-6 max-w-2xl">
            Acquiring industry certifications validates your hands-on competencies with hiring managers and increases compatibility scores across high-paying listings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-2">
                Recommended Certifications to Target
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {roadmap.certificationsToTarget?.map((cert, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-2">
                Recommended Action Steps
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {roadmap.nextSteps?.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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

export default AiRecommendationsPage;
