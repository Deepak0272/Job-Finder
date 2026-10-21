import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  MapPin,
  Briefcase,
  Shield,
  Server,
  Network,
  Cpu,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORY_ITEMS = [
  { name: 'Software Developer', icon: Cpu, count: '1,200+ jobs', color: 'bg-blue-50 text-blue-600' },
  { name: 'IT Support', icon: Server, count: '850+ jobs', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Network Engineer', icon: Network, count: '540+ jobs', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Cyber Security', icon: Shield, count: '620+ jobs', color: 'bg-rose-50 text-rose-600' },
  { name: 'Data Analyst', icon: BarChart3, count: '710+ jobs', color: 'bg-amber-50 text-amber-600' },
];

const LandingPage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await jobService.getJobs({ limit: 6 });
        if (data.success) {
          setFeaturedJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Failed to load featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm) query.set('search', searchTerm);
    if (locationTerm) query.set('location', locationTerm);
    navigate(`/jobs?${query.toString()}`);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>AI-Driven Career Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Find Your Ideal Tech Job with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-indigo-200">
              AI Skill Matching
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed mb-8 max-w-2xl font-normal">
            Discover verified career opportunities tailored specifically to your certifications, skills, and background. Upload your resume to calculate your instant job compatibility score.
          </p>

          {/* Search Box Card */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-3 shadow-2xl flex flex-col md:flex-row gap-2 border border-white/20 text-slate-800"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills (e.g. CCNA, React, Linux)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
              <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location (e.g. Remote, Dallas, New York)..."
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center gap-2 mt-5 text-xs text-blue-200">
            <span className="font-semibold text-blue-100">Popular Searches:</span>
            {['CCNA', 'Linux Support', 'React Developer', 'Cyber Security', 'Data Analyst'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/jobs?search=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition font-medium text-white"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Explore By Category */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Explore Job Categories</h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse thousands of open roles across high-demand technology sectors
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(`/jobs?category=${encodeURIComponent(item.name)}`)}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group flex flex-col justify-between"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition mb-1">
                    {item.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{item.count}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 rounded-3xl p-8 sm:p-10 border border-blue-100">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Assistant</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Smart Matching That Works for You
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No more guessing if your skills fit. Our system evaluates job descriptions against your resume in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base mb-4">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Instant Resume Parsing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your PDF resume to automatically extract verified skills, education, and credentials without manual entry.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base mb-4">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">0% - 100% Compatibility</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive a breakdown of exact matching skills and missing prerequisites for every job listing before you apply.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-4">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Targeted Certification Roadmaps</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get personalized suggestions for certifications (CCNA, CompTIA Security+, AWS) to boost your hiring potential.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to={isAuthenticated ? '/ai-recommendations' : '/login'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition"
          >
            <span>Try AI Job Matching</span>
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Job Openings</h2>
            <p className="text-sm text-slate-500 mt-1">Hand-picked, verified career opportunities ready for application</p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <JobCard key={job._id || job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
