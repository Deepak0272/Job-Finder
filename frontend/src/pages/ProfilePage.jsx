import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Phone,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { openResumeModal } = useOutletContext();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    phone: '',
    preferredLocation: '',
    expectedSalary: '',
    skills: [],
    education: [],
    experience: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        headline: user.profile?.headline || '',
        bio: user.profile?.bio || '',
        phone: user.profile?.phone || '',
        preferredLocation: user.profile?.preferredLocation || '',
        expectedSalary: user.profile?.expectedSalary || '',
        skills: user.profile?.skills || [],
        education: user.profile?.education || [],
        experience: user.profile?.experience || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (formData.skills.map((s) => s.toLowerCase()).includes(skillInput.trim().toLowerCase())) {
      toast.info('Skill is already listed.');
      setSkillInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));
    setSkillInput('');
  };

  const handleRemoveSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Add empty education row
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' },
      ],
    }));
  };

  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, education: updated }));
  };

  // Add empty experience row
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    }));
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, experience: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({
      name: formData.name,
      headline: formData.headline,
      bio: formData.bio,
      phone: formData.phone,
      preferredLocation: formData.preferredLocation,
      expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : 0,
      skills: formData.skills,
      education: formData.education,
      experience: formData.experience,
    });
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep your skills, background, and career preferences updated for accurate AI matching
          </p>
        </div>

        <button
          type="button"
          onClick={openResumeModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Upload PDF Resume</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Personal Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                placeholder="e.g. IT Support / Junior Network Engineer"
                value={formData.headline}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Job Location
              </label>
              <input
                type="text"
                name="preferredLocation"
                placeholder="e.g. Dallas, TX or Remote"
                value={formData.preferredLocation}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Biography / Summary
            </label>
            <textarea
              name="bio"
              rows={3}
              placeholder="Brief summary of your background, experience, and career goals..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            ></textarea>
          </div>
        </div>

        {/* Technical Skills Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Skills & Competencies ({formData.skills.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Used by AI matching algorithm</span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-xl"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="hover:text-rose-600 transition"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Add Skill Bar */}
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="Add skill (e.g. CCNA, Linux, React)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Resume Status Card */}
        {user?.profile?.resumeFileName && (
          <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Active Resume: {user.profile.resumeFileName}
                </span>
                <span className="text-xs text-emerald-700">
                  Parsed skills synchronized with your profile
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openResumeModal}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Replace PDF
            </button>
          </div>
        )}

        {/* Work Experience */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Work Experience</span>
            </h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.experience.map((exp, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 relative space-y-3"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(index)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Help Desk Specialist"
                      value={exp.title}
                      onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cisco Systems"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dallas, TX"
                      value={exp.location}
                      onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jan 2023"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Present"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Key Achievements / Responsibilities
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe your daily duties, impact, tools used..."
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            ))}

            {formData.experience.length === 0 && (
              <p className="text-xs text-slate-400 italic">No work experience listed yet.</p>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Education</span>
            </h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.education.map((edu, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 relative space-y-3"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      School / University
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. State University"
                      value={edu.school}
                      onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Degree
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bachelor of Science"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Networking"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Start Year
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2020"
                      value={edu.startYear}
                      onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2024"
                      value={edu.endYear}
                      onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.education.length === 0 && (
              <p className="text-xs text-slate-400 italic">No education listed yet.</p>
            )}
          </div>
        </div>

        {/* Save button sticky footer */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
