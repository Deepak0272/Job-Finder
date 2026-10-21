import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

// Comprehensive dictionary of tech skills and synonyms across domains
const SKILL_DATABASE = [
  // IT Support & Systems
  'Desktop Support', 'IT Support', 'Active Directory', 'Office 365', 'Windows Server',
  'Hardware Troubleshooting', 'Help Desk', 'Ticket Systems', 'ServiceNow', 'Jira',
  'System Administration', 'Remote Desktop', 'Printer Troubleshooting', 'OS Deployment',

  // Networking
  'Computer Networking', 'Networking', 'CCNA', 'CCNP', 'Cisco', 'TCP/IP', 'DNS', 'DHCP',
  'VPN', 'Routing & Switching', 'BGP', 'OSPF', 'Firewalls', 'VLAN', 'Subnetting',
  'Wireshark', 'Network Security', 'LAN/WAN', 'Network Troubleshooting',

  // Cyber Security
  'Cyber Security', 'Penetration Testing', 'SIEM', 'SOC', 'Incident Response',
  'CompTIA Security+', 'CEH', 'CISSP', 'Vulnerability Assessment', 'Cryptography',
  'Identity & Access Management', 'Zero Trust', 'Endpoint Security',

  // Software Development
  'JavaScript', 'TypeScript', 'React', 'React.js', 'Node.js', 'Express', 'Express.js',
  'Python', 'Java', 'C++', 'C#', '.NET', 'HTML', 'CSS', 'Tailwind CSS', 'Redux',
  'REST APIs', 'GraphQL', 'Git', 'GitHub', 'Next.js', 'Vue.js', 'Angular',

  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform',
  'Linux', 'Bash', 'Shell Scripting', 'Ansible', 'Jenkins',

  // Data & Analytics
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Data Analysis', 'Tableau', 'Power BI',
  'Pandas', 'NumPy', 'Machine Learning', 'Excel', 'R', 'Data Visualization'
];

const CERTIFICATION_MAP = {
  'IT Support': ['CompTIA A+', 'CompTIA Network+', 'Google IT Support Professional', 'Microsoft 365 Certified'],
  'Network Engineer': ['Cisco CCNA (200-301)', 'CompTIA Network+', 'Cisco CCNP Enterprise', 'Juniper JNCIA-Junos'],
  'Cyber Security': ['CompTIA Security+', 'CEH (Certified Ethical Hacker)', 'CompTIA CySA+', 'CISSP'],
  'Software Developer': ['AWS Certified Developer', 'Meta Front-End Developer', 'CKAD (Kubernetes Developer)', 'Oracle Java SE Certification'],
  'Data Analyst': ['Google Data Analytics Certificate', 'Microsoft Power BI Data Analyst (PL-300)', 'IBM Data Science Professional'],
  'Cloud / DevOps': ['AWS Certified Solutions Architect', 'HashiCorp Certified Terraform Associate', 'CKA (Kubernetes Administrator)', 'Azure Administrator (AZ-104)']
};

// Initialize OpenAI client if key is configured
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Extract plain text from PDF Buffer
 */
export const extractTextFromPdf = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text || '';
  } catch (err) {
    console.error('[AI Service] PDF parse error:', err.message);
    throw new Error('Failed to parse PDF resume: ' + err.message);
  }
};

/**
 * Intelligent Heuristic Skill Extractor
 */
export const extractSkillsHeuristic = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const detected = new Set();

  for (const skill of SKILL_DATABASE) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text) || lowerText.includes(skill.toLowerCase())) {
      detected.add(skill);
    }
  }

  return Array.from(detected);
};

/**
 * Analyze Resume via OpenAI or Fallback
 */
export const analyzeResume = async (resumeText) => {
  // If OpenAI key is provided, use GPT model
  if (process.env.OPENAI_API_KEY && openai) {
    try {
      const prompt = `You are an expert career counselor and technical resume parser.
Analyze the following resume text and return a pure valid JSON response (no markdown, no backticks):
{
  "summary": "2-3 sentence executive profile summary",
  "headline": "Professional title (e.g., Network & Systems Administrator)",
  "skills": ["Extracted skill 1", "Extracted skill 2", ...],
  "experienceLevel": "Entry Level" | "Mid Level" | "Senior Level",
  "suggestedCategories": ["Software Developer" | "IT Support" | "Network Engineer" | "Cyber Security" | "Data Analyst" | "Cloud / DevOps"],
  "educationSummary": "Brief education summary",
  "strengths": ["Strength 1", "Strength 2"],
  "recommendedCertifications": ["Cert 1", "Cert 2"]
}

Resume Text:
${resumeText.slice(0, 4000)}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content?.trim();
      const cleaned = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn('[AI Service] OpenAI API error, using intelligent fallback:', err.message);
    }
  }

  // Heuristic Fallback Analysis
  const skills = extractSkillsHeuristic(resumeText);

  // Determine top category based on matched skills
  const itSupportSkills = ['Desktop Support', 'IT Support', 'Active Directory', 'Help Desk', 'Office 365', 'ServiceNow'];
  const networkSkills = ['Computer Networking', 'CCNA', 'CCNP', 'Cisco', 'TCP/IP', 'Routing & Switching', 'VPN', 'Firewalls', 'LAN/WAN'];
  const cyberSkills = ['Cyber Security', 'Penetration Testing', 'SIEM', 'SOC', 'Security+', 'CEH'];
  const devSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'HTML', 'CSS', 'Tailwind CSS', 'TypeScript'];
  const dataSkills = ['SQL', 'Data Analysis', 'Tableau', 'Power BI', 'Pandas', 'Excel'];

  const scoreCategory = (catSkills) =>
    catSkills.reduce((acc, skill) => acc + (skills.includes(skill) ? 1 : 0), 0);

  const scores = [
    { cat: 'Network Engineer', score: scoreCategory(networkSkills) },
    { cat: 'IT Support', score: scoreCategory(itSupportSkills) },
    { cat: 'Cyber Security', score: scoreCategory(cyberSkills) },
    { cat: 'Software Developer', score: scoreCategory(devSkills) },
    { cat: 'Data Analyst', score: scoreCategory(dataSkills) },
  ].sort((a, b) => b.score - a.score);

  const topCategory = scores[0].score > 0 ? scores[0].cat : 'IT Support';
  const suggestedCategories = scores.filter(s => s.score > 0).map(s => s.cat);
  if (!suggestedCategories.length) suggestedCategories.push('IT Support', 'Software Developer');

  let experienceLevel = 'Entry Level';
  if (/senior|lead|architect|5\+|6\+|7\+|8\+|10\+/i.test(resumeText)) {
    experienceLevel = 'Senior Level';
  } else if (/mid-level|3\+|4\+/i.test(resumeText)) {
    experienceLevel = 'Mid Level';
  }

  return {
    summary: `Motivated professional with hands-on capabilities in ${skills.slice(0, 4).join(', ') || 'information technology and software engineering'}. Passionate about continuous learning and contributing to high-performing teams.`,
    headline: `${topCategory} Specialist`,
    skills: skills.length ? skills : ['Computer Networking', 'Linux', 'Troubleshooting', 'Communication'],
    experienceLevel,
    suggestedCategories,
    educationSummary: resumeText.match(/(bachelor|master|diploma|associate|b\.s|m\.s|degree)[^\n.]*/i)?.[0] || 'Technical / Degree Background',
    strengths: [
      `Solid foundation in ${skills.slice(0, 2).join(' & ') || 'technical fundamentals'}`,
      'Strong diagnostic and troubleshooting mindset',
      'Adaptability to rapidly evolving technical environments'
    ],
    recommendedCertifications: CERTIFICATION_MAP[topCategory] || ['CompTIA Network+', 'AWS Certified Cloud Practitioner']
  };
};

/**
 * Calculate compatibility between user profile and a specific job
 */
export const calculateJobMatch = (userSkills = [], userProfile = {}, job = {}) => {
  const normUserSkills = (userSkills || []).map((s) => s.trim().toLowerCase());
  const jobRequired = (job.skillsRequired || []).map((s) => s.trim());
  const jobText = `${job.title} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();

  const matchingSkills = [];
  const missingSkills = [];

  // Match explicitly listed job skills
  jobRequired.forEach((reqSkill) => {
    const isMatched = normUserSkills.some(
      (userSkill) =>
        userSkill === reqSkill.toLowerCase() ||
        reqSkill.toLowerCase().includes(userSkill) ||
        userSkill.includes(reqSkill.toLowerCase())
    );

    if (isMatched) {
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Check additional skills from user that appear in job description
  normUserSkills.forEach((userSkill) => {
    if (jobText.includes(userSkill) && !matchingSkills.some(m => m.toLowerCase() === userSkill)) {
      const originalCase = userSkills.find(s => s.toLowerCase() === userSkill) || userSkill;
      matchingSkills.push(originalCase);
    }
  });

  // Calculate percentage score (0% to 100%)
  const totalFactors = Math.max(jobRequired.length, 1);
  let baseScore = Math.round((matchingSkills.length / (matchingSkills.length + missingSkills.length || 1)) * 100);

  // Bonus for Category / Title alignment
  const userHeadline = (userProfile.headline || '').toLowerCase();
  const userCategory = (userProfile.preferredCategory || '').toLowerCase();
  const jobCat = (job.category || '').toLowerCase();
  const jobTitle = (job.title || '').toLowerCase();

  if (userHeadline && jobTitle.split(' ').some(w => w.length > 3 && userHeadline.includes(w))) {
    baseScore += 10;
  }
  if (userCategory && jobCat.includes(userCategory)) {
    baseScore += 10;
  }

  // Location match bonus
  if (
    userProfile.preferredLocation &&
    (job.location?.toLowerCase().includes(userProfile.preferredLocation.toLowerCase()) ||
      job.remoteType === 'Remote')
  ) {
    baseScore += 5;
  }

  // Clamp 0 to 100
  const compatibilityScore = Math.min(Math.max(baseScore, 0), 100);

  // Generate tailored recommendations
  const categoryCerts = CERTIFICATION_MAP[job.category] || ['Industry Standard Certification'];
  const recommendations = missingSkills.slice(0, 3).map(
    (skill) => `Build practical experience with ${skill} to strengthen your candidacy.`
  );

  return {
    jobId: job._id || job.id,
    compatibilityScore,
    matchingSkills,
    missingSkills,
    recommendedCertifications: categoryCerts,
    recommendations,
  };
};

/**
 * Generate career recommendations and skill gap roadmap
 */
export const getSkillGapRecommendations = async (userSkills = [], targetCategory = 'IT Support') => {
  const availableCerts = CERTIFICATION_MAP[targetCategory] || ['CompTIA Network+', 'CompTIA Security+'];
  const normUser = userSkills.map(s => s.toLowerCase());

  // Detect key category skills not present
  const standardCategorySkills = {
    'IT Support': ['Desktop Support', 'Active Directory', 'Windows Server', 'Office 365', 'Troubleshooting', 'ITIL'],
    'Network Engineer': ['CCNA', 'Cisco', 'Routing & Switching', 'Firewalls', 'TCP/IP', 'BGP', 'Wireshark'],
    'Cyber Security': ['CompTIA Security+', 'SIEM', 'Penetration Testing', 'Incident Response', 'Vulnerability Assessment'],
    'Software Developer': ['JavaScript', 'React', 'Node.js', 'REST APIs', 'SQL', 'Docker', 'Git'],
    'Data Analyst': ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel', 'Data Visualization']
  };

  const domainSkills = standardCategorySkills[targetCategory] || standardCategorySkills['IT Support'];
  const missingCritical = domainSkills.filter(s => !normUser.some(u => u.includes(s.toLowerCase())));

  return {
    targetCategory,
    currentSkillCount: userSkills.length,
    missingKeySkills: missingCritical,
    certificationsToTarget: availableCerts,
    nextSteps: [
      `Review online labs or tutorials for ${missingCritical[0] || 'advanced troubleshooting'}.`,
      `Consider preparing for ${availableCerts[0]} to validate your qualifications with employers.`,
      `Build and document a hands-on lab project demonstrating ${missingCritical.slice(0, 2).join(' and ') || 'network configuration'}.`
    ]
  };
};
