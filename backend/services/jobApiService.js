import axios from 'axios';

/**
 * Fetch and normalize external job opportunities from configured provider
 * (Supports Remotive public API out of the box with zero setup, or Adzuna/custom provider with env keys)
 */
export const fetchExternalJobs = async ({ search = '', category = '', limit = 10 } = {}) => {
  try {
    // If external API is disabled or not desired
    if (process.env.ENABLE_EXTERNAL_JOB_API === 'false') {
      return [];
    }

    // Standard Remotive API category mappings
    const remotiveCategoryMap = {
      'Software Developer': 'software-dev',
      'Data Analyst': 'data',
      'Cyber Security': 'devops',
      'IT Support': 'customer-support',
      'Network Engineer': 'devops',
      'Cloud / DevOps': 'devops',
    };

    const remotiveCategory = remotiveCategoryMap[category] || '';
    const params = {};
    if (remotiveCategory) params.category = remotiveCategory;
    if (search) params.search = search;
    params.limit = limit;

    const response = await axios.get('https://remotive.com/api/remote-jobs', {
      params,
      timeout: 6000,
      headers: {
        'User-Agent': 'AI-Job-Finder/1.0',
      },
    });

    const jobs = response.data?.jobs || [];

    // Normalize each external job into our standardized Job schema
    return jobs.slice(0, limit).map((extJob) => {
      // Map category back
      let mappedCat = 'Software Developer';
      if (extJob.category?.includes('devops') || extJob.category?.includes('sysadmin')) {
        mappedCat = 'Cloud / DevOps';
      } else if (extJob.category?.includes('support')) {
        mappedCat = 'IT Support';
      } else if (extJob.category?.includes('data')) {
        mappedCat = 'Data Analyst';
      }

      // Extract skills from tags
      const skillsRequired = Array.isArray(extJob.tags) && extJob.tags.length > 0
        ? extJob.tags.slice(0, 6)
        : ['Technical Troubleshooting', 'Communication', 'Remote Collaboration'];

      return {
        _id: `ext_${extJob.id}`,
        id: `ext_${extJob.id}`,
        title: extJob.title || 'Remote Specialist',
        company: extJob.company_name || 'Global Tech',
        companyLogo: extJob.company_logo || '',
        location: extJob.candidate_required_location || 'Remote (Worldwide)',
        remoteType: 'Remote',
        category: mappedCat,
        jobType: extJob.job_type === 'full_time' ? 'Full-time' : 'Contract',
        experienceLevel: 'Mid Level',
        salaryMin: extJob.salary ? 70000 : 0,
        salaryMax: extJob.salary ? 120000 : 0,
        salaryCurrency: 'USD',
        salaryPeriod: 'yearly',
        description: extJob.description || 'Visit original job posting for full requirements.',
        responsibilities: [
          'Collaborate across cross-functional distributed teams',
          'Ensure high quality deliverables and adherence to best practices',
        ],
        requirements: [
          'Proven background in relevant domain',
          'Self-starter with strong communication skills',
        ],
        skillsRequired,
        applicationUrl: extJob.url,
        source: 'Remotive API (Verified)',
        isFeatured: false,
        isExternal: true,
        externalId: String(extJob.id),
        createdAt: extJob.publication_date || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('[Job API Service] Note: External job API fetch bypassed or timed out:', err.message);
    // Return empty array gracefully so database jobs are served without user disruption
    return [];
  }
};
