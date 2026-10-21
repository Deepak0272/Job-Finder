import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import ApplicationModal from '../components/ApplicationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const COLUMNS = [
  { status: 'Interested', label: 'Interested', color: 'border-slate-300 bg-slate-50 text-slate-700' },
  { status: 'Applied', label: 'Applied', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { status: 'Interview', label: 'Interview', color: 'border-purple-300 bg-purple-50 text-purple-700' },
  { status: 'Offer', label: 'Offer', color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  { status: 'Rejected', label: 'Rejected', color: 'border-rose-300 bg-rose-50 text-rose-700' },
];

const ApplicationTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const toast = useToast();

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getApplications();
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      toast.error('Failed to load tracked applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await applicationService.updateApplication(appId, { status: newStatus });
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? res.application : app))
        );
        toast.success(`Application updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to remove this application from your tracker?')) {
      return;
    }
    try {
      await applicationService.deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      toast.info('Application removed.');
    } catch (err) {
      toast.error('Failed to delete application.');
    }
  };

  const handleEdit = (app) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedApp(null);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Application Tracker ({applications.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize your job search pipeline, schedule interviews, and log milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Loading your application tracker..." />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No applications tracked yet"
          description="Start tracking your job search by clicking 'Add Application' or using the 'Track' button on any job card."
          actionLabel="Add Your First Application"
          onAction={handleAddNew}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{col.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white font-bold text-slate-600 shadow-2xs">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Column Items */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colApps.map((app) => (
                    <div
                      key={app._id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow transition space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {app.companyName}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {app.jobTitle}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEdit(app)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {app.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{app.location}</span>
                        </div>
                      )}

                      {app.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                          {app.notes}
                        </p>
                      )}

                      {app.salaryOffered && (
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Offer: ${app.salaryOffered.toLocaleString()} / yr</span>
                        </div>
                      )}

                      {/* Card Footer: Date & Move Status */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(app.applicationDate)}
                        </span>

                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 text-slate-700 font-semibold focus:outline-none"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.status} value={c.status}>
                              Move: {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400 italic">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{app.jobTitle}</td>
                  <td className="py-3 px-4 text-slate-600">{app.companyName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        app.status === 'Offer'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : app.status === 'Interview'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'Applied'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(app.applicationDate)}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{app.notes || '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(app)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
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
      )}

      {/* Add / Edit Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingApplication={selectedApp}
        onSuccess={() => loadApplications()}
      />
    </div>
  );
};

export default ApplicationTrackerPage;
