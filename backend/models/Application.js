import mongoose from 'mongoose';
import { createModelBridge } from './dataBridge.js';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
    },
    location: {
      type: String,
      default: '',
    },
    applicationUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Interested', 'Applied', 'Interview', 'Rejected', 'Offer'],
      default: 'Interested',
    },
    notes: {
      type: String,
      default: '',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    salaryOffered: {
      type: Number,
      default: null,
    },
    timeline: [
      {
        status: {
          type: String,
          enum: ['Interested', 'Applied', 'Interview', 'Rejected', 'Offer'],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
  },
  { timestamps: true }
);

const MongooseApplication = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export default createModelBridge('applications', MongooseApplication);
