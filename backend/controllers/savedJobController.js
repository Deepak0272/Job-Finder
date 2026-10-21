import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';

// @desc    Get all saved jobs for current user
// @route   GET /api/saved-jobs
// @access  Private
export const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate('job')
      .sort('-createdAt');

    // Filter out any entries where job might have been deleted
    const validSavedJobs = savedJobs.filter((item) => item.job !== null);

    res.status(200).json({
      success: true,
      count: validSavedJobs.length,
      savedJobs: validSavedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a job to user favorites (preventing duplicates)
// @route   POST /api/saved-jobs/:jobId
// @access  Private
export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Verify job exists
    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Check if already saved
    const alreadySaved = await SavedJob.findOne({
      user: req.user.id,
      job: jobId,
    });

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Job is already in your saved list.',
      });
    }

    const savedJob = await SavedJob.create({
      user: req.user.id,
      job: jobId,
    });

    await savedJob.populate('job');

    res.status(201).json({
      success: true,
      message: 'Job successfully saved to favorites!',
      savedJob,
    });
  } catch (error) {
    // Catch MongoDB duplicate key error gracefully
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Job is already in your saved list.',
      });
    }
    next(error);
  }
};

// @desc    Remove job from user favorites
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private
export const removeSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const result = await SavedJob.findOneAndDelete({
      user: req.user.id,
      job: jobId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Job was not found in your saved list.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job removed from saved list.',
      jobId,
    });
  } catch (error) {
    next(error);
  }
};
