import mongoose from 'mongoose';
import { createModelBridge } from './dataBridge.js';

const savedJobSchema = new mongoose.Schema(
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
      required: true,
    },
  },
  { timestamps: true }
);

savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

const MongooseSavedJob = mongoose.models.SavedJob || mongoose.model('SavedJob', savedJobSchema);
export default createModelBridge('savedjobs', MongooseSavedJob);
