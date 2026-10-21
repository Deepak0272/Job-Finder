import Job from '../models/Job.js';
import { fetchExternalJobs } from '../services/jobApiService.js';

// @desc    Get all jobs with filters and pagination
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      remoteType,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      source,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Build MongoDB filter query
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (remoteType && remoteType !== 'All') {
      filter.remoteType = remoteType;
    }

    if (jobType && jobType !== 'All') {
      filter.jobType = jobType;
    }

    if (experienceLevel && experienceLevel !== 'All') {
      filter.experienceLevel = experienceLevel;
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (minSalary) {
      filter.salaryMax = { $gte: Number(minSalary) };
    }

    if (maxSalary) {
      filter.salaryMin = { $lte: Number(maxSalary) };
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillsRequired: { $regex: search, $options: 'i' } },
      ];
    }

    // Query database
    const [dbJobs, totalDbJobs] = await Promise.all([
      Job.find(filter).sort(sort).skip(skip).limit(limitNum),
      Job.countDocuments(filter),
    ]);

    // Optionally include external jobs if on page 1 and requested
    let combinedJobs = [...dbJobs];
    let totalCount = totalDbJobs;

    if (pageNum === 1 && req.query.includeExternal === 'true') {
      const extJobs = await fetchExternalJobs({
        search,
        category: category !== 'All' ? category : '',
        limit: 6,
      });
      combinedJobs = [...combinedJobs, ...extJobs];
      totalCount += extJobs.length;
    }

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: combinedJobs.length,
      total: totalCount,
      totalPages,
      currentPage: pageNum,
      jobs: combinedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if it's an external synthetic ID
    if (id.startsWith('ext_')) {
      const extJobs = await fetchExternalJobs({ limit: 50 });
      const found = extJobs.find((j) => j.id === id || j._id === id);
      if (found) {
        return res.status(200).json({ success: true, job: found });
      }
      return res.status(404).json({ success: false, message: 'External job not found or expired.' });
    }

    const job = await Job.findById(id).populate('createdBy', 'name email');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job listing (Admin only)
// @route   POST /api/jobs
// @access  Private/Admin
export const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.user.id,
    };

    // Ensure skillsRequired is an array
    if (typeof jobData.skillsRequired === 'string') {
      jobData.skillsRequired = jobData.skillsRequired
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job listing created successfully!',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job listing (Admin only)
// @route   PUT /api/jobs/:id
// @access  Private/Admin
export const updateJob = async (req, res, next) => {
  try {
    const jobData = { ...req.body };

    if (typeof jobData.skillsRequired === 'string') {
      jobData.skillsRequired = jobData.skillsRequired
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const job = await Job.findByIdAndUpdate(req.params.id, jobData, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job listing updated successfully!',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job listing (Admin only)
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job listing removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job categories with counts
// @route   GET /api/jobs/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      'Software Developer',
      'IT Support',
      'Network Engineer',
      'Cyber Security',
      'Data Analyst',
      'Cloud / DevOps',
    ];

    const counts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Job.countDocuments({ category: cat });
        return { category: cat, count };
      })
    );

    res.status(200).json({
      success: true,
      categories: counts,
    });
  } catch (error) {
    next(error);
  }
};
