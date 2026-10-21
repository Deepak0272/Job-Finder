import {
  extractTextFromPdf,
  analyzeResume,
  calculateJobMatch,
  getSkillGapRecommendations,
} from '../services/aiService.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

// @desc    Upload and analyze resume (PDF or text)
// @route   POST /api/ai/analyze-resume
// @access  Private
export const handleResumeAnalysis = async (req, res, next) => {
  try {
    let resumeText = '';
    let fileName = '';

    if (req.file) {
      fileName = req.file.originalname;
      resumeText = await extractTextFromPdf(req.file.buffer);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
      fileName = 'pasted_resume.txt';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a PDF resume file or resume text.',
      });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract readable text from the provided resume.',
      });
    }

    // Run AI analysis
    const analysis = await analyzeResume(resumeText);

    // Save extracted profile attributes if user is logged in
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        // Merge extracted skills with existing user skills, avoiding duplicates
        const existingSkills = new Set(user.profile.skills || []);
        (analysis.skills || []).forEach((s) => existingSkills.add(s));

        user.profile.skills = Array.from(existingSkills);
        if (analysis.headline && !user.profile.headline) {
          user.profile.headline = analysis.headline;
        }
        if (analysis.summary && !user.profile.bio) {
          user.profile.bio = analysis.summary;
        }
        user.profile.resumeFileName = fileName;
        user.profile.resumeParsedData = analysis;

        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully!',
      analysis,
      extractedSkillsCount: analysis.skills?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Match user profile skills against jobs
// @route   POST /api/ai/match-jobs
// @access  Private
export const matchJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Custom skills can be passed in request body, otherwise fallback to user profile skills
    const userSkills = req.body.skills || user.profile.skills || [];
    const targetCategory = req.body.category || null;

    const query = {};
    if (targetCategory && targetCategory !== 'All') {
      query.category = targetCategory;
    }

    const jobs = await Job.find(query).limit(50);

    const scoredJobs = jobs.map((job) => {
      const matchDetails = calculateJobMatch(userSkills, user.profile, job);
      return {
        job: job.toObject(),
        ...matchDetails,
      };
    });

    // Sort by compatibility score descending
    scoredJobs.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({
      success: true,
      totalMatches: scoredJobs.length,
      userSkills,
      matches: scoredJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill recommendations and gap roadmap
// @route   POST /api/ai/skill-recommendations
// @access  Private
export const getSkillRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const skills = req.body.skills || user?.profile?.skills || [];
    const targetCategory = req.body.targetCategory || 'IT Support';

    const roadmap = await getSkillGapRecommendations(skills, targetCategory);

    res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};
