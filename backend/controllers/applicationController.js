import Application from '../models/Application.js';
import Job from '../models/Job.js';

// @desc    Get all job applications for user
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user.id };

    if (status && status !== 'All') {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('job')
      .sort('-applicationDate');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track a new job application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req, res, next) => {
  try {
    const {
      jobId,
      jobTitle,
      companyName,
      location,
      applicationUrl,
      status = 'Interested',
      notes = '',
      applicationDate = new Date(),
      salaryOffered = null,
    } = req.body;

    let finalTitle = jobTitle;
    let finalCompany = companyName;
    let finalLocation = location;
    let finalUrl = applicationUrl;

    // If linked to an existing platform job, fill details automatically
    if (jobId && !jobId.startsWith('ext_')) {
      const job = await Job.findById(jobId);
      if (job) {
        finalTitle = finalTitle || job.title;
        finalCompany = finalCompany || job.company;
        finalLocation = finalLocation || job.location;
        finalUrl = finalUrl || job.applicationUrl;
      }
    }

    if (!finalTitle || !finalCompany) {
      return res.status(400).json({
        success: false,
        message: 'Job title and Company name are required to track an application.',
      });
    }

    const application = await Application.create({
      user: req.user.id,
      job: jobId && !jobId.startsWith('ext_') ? jobId : null,
      jobTitle: finalTitle,
      companyName: finalCompany,
      location: finalLocation || '',
      applicationUrl: finalUrl || '',
      status,
      notes,
      applicationDate,
      salaryOffered,
      timeline: [
        {
          status,
          date: new Date(),
          note: notes || `Application marked as ${status}`,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Job application tracked successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status, notes, or date
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const { status, notes, applicationDate, salaryOffered } = req.body;

    if (status && status !== application.status) {
      application.timeline.push({
        status,
        date: new Date(),
        note: notes || `Status updated to ${status}`,
      });
      application.status = status;
    }

    if (notes !== undefined) application.notes = notes;
    if (applicationDate) application.applicationDate = applicationDate;
    if (salaryOffered !== undefined) application.salaryOffered = salaryOffered;

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application details updated.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tracked application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application removed from tracker.',
    });
  } catch (error) {
    next(error);
  }
};
