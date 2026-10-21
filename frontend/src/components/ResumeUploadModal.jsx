import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ResumeUploadModal = ({ isOpen, onClose, onParsed }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { uploadAndParseResume } = useAuth();
  const toast = useToast();

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF format document.');
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const res = await uploadAndParseResume(file);
    setLoading(false);

    if (res?.success) {
      setResult(res.analysis);
      if (onParsed) onParsed(res.analysis);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            AI Resume Analyzer & Parser
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Upload your resume in PDF format. Our AI will extract your technical competencies, determine job compatibility, and recommend certifications.
        </p>

        {!result ? (
          <div>
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50'
                  : file
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 max-w-xs truncate mb-1">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-500 mb-3">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-xs text-rose-600 hover:underline font-medium"
                  >
                    Choose another file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    Drag and drop your PDF resume here
                  </p>
                  <p className="text-xs text-slate-400 mb-4">Supports PDF files up to 10MB</p>
                  <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition hover:shadow">
                    Browse Computer
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || loading}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? 'Analyzing with AI...' : 'Analyze & Extract Skills'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Analysis Results View */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Analysis Complete
                </h4>
                <p className="text-xs text-emerald-700">
                  Extracted {result.skills?.length || 0} skills. Your profile has been updated.
                </p>
              </div>
            </div>

            {result.headline && (
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Suggested Professional Headline
                </span>
                <p className="text-sm font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {result.headline}
                </p>
              </div>
            )}

            {result.summary && (
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Executive Summary
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {result.summary}
                </p>
              </div>
            )}

            {/* Extracted Skills */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Extracted Skills ({result.skills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {result.skills?.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Certifications */}
            {Array.isArray(result.recommendedCertifications) && result.recommendedCertifications.length > 0 && (
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-purple-900 block mb-1">
                  Recommended Certifications for Career Growth:
                </span>
                <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
                  {result.recommendedCertifications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadModal;
