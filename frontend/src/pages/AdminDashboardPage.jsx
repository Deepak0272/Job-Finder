import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Briefcase,
  CheckSquare,
  Bookmark,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Layers,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { jobService } from '../services/jobService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'Software Developer',
  'IT Support',
  'Network Engineer',
  'Cyber Security',
  'Data Analyst',
  'Cloud / DevOps',
];

const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'users' | 'categories'

  // Job edit / create modal state
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: '',
    location: 'Remote',
    remoteType: 'Remote',
    category: 'Software Developer',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryMin: 60000,
    salaryMax: 85000,
    description: '',
    skillsRequired: '',
    applicationUrl: 'https://careers.google.com/',
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(),
        jobService.getJobs({ limit: 50 }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (jobsRes.success) setJobsList(jobsRes.jobs || []);
    } catch (err) {
      toast.error('Failed to load admin telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 mb-4">
          You must have administrator privileges to view this portal.
        </p>
        <p className="text-xs text-slate-400">
          Tip: You can log in using the pre-seeded admin account: <strong>admin@jobfinder.ai</strong>
        </p>
      </div>
    );
  }

  // Handle open job modal for create
  const handleOpenCreateJob = () => {
    setEditingJob(null);
    setJobFormData({
      title: '',
      company: '',
      location: 'Remote',
      remoteType: 'Remote',
      category: 'Software Developer',
      jobType: 'Full-time',
      experienceLevel: 'Entry Level',
      salaryMin: 70000,
      salaryMax: 95000,
      description: '',
      skillsRequired: '',
      applicationUrl: 'https://careers.google.com/',
    });
    setJobModalOpen(true);
  };

  // Handle open job modal for edit
  const handleOpenEditJob = (job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      remoteType: job.remoteType || 'Remote',
      category: job.category || 'Software Developer',
      jobType: job.jobType || 'Full-time',
      experienceLevel: job.experienceLevel || 'Entry Level',
      salaryMin: job.salaryMin || 0,
      salaryMax: job.salaryMax || 0,
      description: job.description || '',
      skillsRequired: Array.isArray(job.skillsRequired)
        ? job.skillsRequired.join(', ')
        : job.skillsRequired || '',
      applicationUrl: job.applicationUrl || '',
    });
    setJobModalOpen(true);
  };

  // Handle submit job
  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        const res = await jobService.updateJob(editingJob._id || editingJob.id, jobFormData);
        if (res.success) {
          toast.success('Job listing updated!');
          setJobModalOpen(false);
          loadAdminData();
        }
      } else {
        const res = await jobService.createJob(jobFormData);
        if (res.success) {
          toast.success('New job listing created!');
          setJobModalOpen(false);
          loadAdminData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    }
  };

  // Handle delete job
  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await jobService.deleteJob(id);
      setJobsList((prev) => prev.filter((j) => (j._id || j.id) !== id));
      toast.info('Job listing removed.');
    } catch (err) {
      toast.error('Failed to remove job.');
    }
  };

  // Handle update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(`Role updated to ${newRole}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u._id !== userId));
        toast.info('User removed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System health, job inventory management, and user administration
          </p>
        </div>

        <button
          onClick={handleOpenCreateJob}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                Total Users
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.totalUsers}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                Active Jobs
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.totalJobs}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                Applications
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.totalApplications}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                Saved Bookmarks
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.totalSavedJobs}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manage Jobs ({jobsList.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Registered Users ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Categories Overview
        </button>
      </div>

      {loading ? (
        <div className="py-16">
          <LoadingSpinner text="Loading dashboard data..." />
        </div>
      ) : activeTab === 'jobs' ? (
        /* Jobs Management Table */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Title & Company</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Salary Range</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobsList.map((j) => (
                  <tr key={j._id || j.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{j.title}</span>
                      <span className="text-[11px] text-slate-400">{j.company}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                        {j.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{j.location}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {j.jobType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      ${j.salaryMin?.toLocaleString()} - ${j.salaryMax?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditJob(j)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(j._id || j.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* Users Management Table */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Skills Listed</th>
                  <th className="py-3 px-4">Change Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[11px] text-slate-400">{u.profile?.headline || 'No title set'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.profile?.skills?.length || 0} skills
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === user?.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-none disabled:opacity-40"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u._id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Categories Overview */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const count = jobsList.filter((j) => j.category === cat).length;
            return (
              <div
                key={cat}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{cat}</h4>
                  <span className="text-xs text-slate-500">{count} active job listings</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Job Modal */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setJobModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingJob ? 'Edit Job Listing' : 'Post New Job Listing'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in the job requirements, category, and external application URL.
            </p>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.company}
                    onChange={(e) => setJobFormData({ ...jobFormData, company: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={jobFormData.category}
                    onChange={(e) => setJobFormData({ ...jobFormData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remote Model</label>
                  <select
                    value={jobFormData.remoteType}
                    onChange={(e) => setJobFormData({ ...jobFormData, remoteType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
                  <select
                    value={jobFormData.jobType}
                    onChange={(e) => setJobFormData({ ...jobFormData, jobType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Min ($)</label>
                  <input
                    type="number"
                    value={jobFormData.salaryMin}
                    onChange={(e) => setJobFormData({ ...jobFormData, salaryMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Max ($)</label>
                  <input
                    type="number"
                    value={jobFormData.salaryMax}
                    onChange={(e) => setJobFormData({ ...jobFormData, salaryMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCNA, Linux, Desktop Support, Active Directory"
                  value={jobFormData.skillsRequired}
                  onChange={(e) => setJobFormData({ ...jobFormData, skillsRequired: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Link (External URL) *
                </label>
                <input
                  type="url"
                  required
                  value={jobFormData.applicationUrl}
                  onChange={(e) => setJobFormData({ ...jobFormData, applicationUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {editingJob ? 'Update Job' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
