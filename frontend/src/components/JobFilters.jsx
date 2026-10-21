import React from 'react';
import { Filter, RotateCcw, MapPin, DollarSign, Layers } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Software Developer',
  'IT Support',
  'Network Engineer',
  'Cyber Security',
  'Data Analyst',
  'Cloud / DevOps',
];

const REMOTE_TYPES = ['All', 'Remote', 'Hybrid', 'On-site'];
const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const EXP_LEVELS = ['All', 'Entry Level', 'Mid Level', 'Senior Level', 'Lead / Manager'];

const JobFilters = ({ filters, onFilterChange, onResetFilters }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Jobs</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Job Category
        </label>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange('category', cat)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                (filters.category || 'All') === cat
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              {(filters.category || 'All') === cat && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Remote Type */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Workplace Model
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {REMOTE_TYPES.map((rt) => (
            <button
              key={rt}
              onClick={() => onFilterChange('remoteType', rt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-center transition ${
                (filters.remoteType || 'All') === rt
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {rt}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Experience Level
        </label>
        <select
          value={filters.experienceLevel || 'All'}
          onChange={(e) => onFilterChange('experienceLevel', e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {EXP_LEVELS.map((exp) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>
      </div>

      {/* Job Type */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Job Type
        </label>
        <select
          value={filters.jobType || 'All'}
          onChange={(e) => onFilterChange('jobType', e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {JOB_TYPES.map((jt) => (
            <option key={jt} value={jt}>
              {jt}
            </option>
          ))}
        </select>
      </div>

      {/* Salary Filter */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Minimum Salary ($ / yr)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="e.g. 60000"
            value={filters.minSalary || ''}
            onChange={(e) => onFilterChange('minSalary', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
