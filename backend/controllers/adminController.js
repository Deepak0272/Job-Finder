import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';

// @desc    Get system-wide statistics for Admin
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalSavedJobs,
      usersByRole,
      applicationsByStatus,
      jobsByCategory,
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      SavedJob.countDocuments(),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    // Format status breakdowns
    const statusBreakdown = {
      Interested: 0,
      Applied: 0,
      Interview: 0,
      Rejected: 0,
      Offer: 0,
    };
    applicationsByStatus.forEach((item) => {
      if (item._id && statusBreakdown[item._id] !== undefined) {
        statusBreakdown[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalSavedJobs,
        usersByRole,
        applicationsByStatus: statusBreakdown,
        jobsByCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user's role or status
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin".',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Clean up user's saved jobs and applications
    await Promise.all([
      SavedJob.deleteMany({ user: req.params.id }),
      Application.deleteMany({ user: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'User and associated data removed.',
    });
  } catch (error) {
    next(error);
  }
};
