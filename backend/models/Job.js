import mongoose from 'mongoose';
import { createModelBridge } from './dataBridge.js';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    remoteType: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'On-site',
    },
    category: {
      type: String,
      required: [true, 'Job category is required'],
      enum: [
        'Software Developer',
        'IT Support',
        'Network Engineer',
        'Cyber Security',
        'Data Analyst',
        'Cloud / DevOps',
        'Other',
      ],
      default: 'Software Developer',
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Manager'],
      default: 'Entry Level',
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    salaryCurrency: {
      type: String,
      default: 'USD',
    },
    salaryPeriod: {
      type: String,
      enum: ['yearly', 'monthly', 'hourly'],
      default: 'yearly',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skillsRequired: {
      type: [String],
      required: true,
      default: [],
    },
    applicationUrl: {
      type: String,
      required: [true, 'Application link is required'],
    },
    source: {
      type: String,
      default: 'Platform Direct',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    externalId: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  skillsRequired: 'text',
});

const MongooseJob = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default createModelBridge('jobs', MongooseJob);
