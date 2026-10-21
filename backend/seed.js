import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Job from './models/Job.js';
import SavedJob from './models/SavedJob.js';
import Application from './models/Application.js';
import { connectDB } from './config/db.js';

dotenv.config();

export const seedJobsData = [
  // --- IT Support ---
  {
    title: 'Senior Desktop Support Specialist',
    company: 'Apex Global Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
    location: 'New York, NY',
    remoteType: 'Hybrid',
    category: 'IT Support',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    salaryMin: 68000,
    salaryMax: 85000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'We are seeking an experienced Desktop Support Specialist to provide technical assistance, hardware deployment, and OS troubleshooting across our enterprise infrastructure.',
    responsibilities: [
      'Manage enterprise hardware deployment, imaging, and workstation lifecycle',
      'Provide Tier 2 and Tier 3 desktop support for Windows 11, macOS, and Linux systems',
      'Administer Microsoft Active Directory, Azure AD, and Office 365 environments',
      'Diagnose printer, peripheral, and local network connectivity issues',
    ],
    requirements: [
      '3+ years in enterprise desktop or technical support',
      'Proficiency with Windows Server, Active Directory, and Group Policy',
      'Experience with ServiceNow or Jira ticketing tools',
      'CompTIA A+ or Network+ certification preferred',
    ],
    skillsRequired: ['Desktop Support', 'Active Directory', 'Windows Server', 'Office 365', 'Troubleshooting', 'Hardware Troubleshooting'],
    applicationUrl: 'https://careers.google.com/jobs/results/',
    source: 'Verified Platform Direct',
    isFeatured: true,
  },
  {
    title: 'IT Support Specialist (Tier 2)',
    company: 'CareCloud Systems',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80',
    location: 'Austin, TX',
    remoteType: 'On-site',
    category: 'IT Support',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryMin: 55000,
    salaryMax: 68000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Join our frontline customer IT team delivering exceptional technical support, endpoint management, and troubleshooting for enterprise healthcare clients.',
    responsibilities: [
      'Resolve end-user technical inquiries via ticketing, phone, and remote assistance',
      'Install and configure network printers, VoIP phones, and desktop peripherals',
      'Maintain software licenses and equipment inventories',
    ],
    requirements: [
      '1+ years technical support or help desk experience',
      'Demonstrated diagnostic skills in Windows and basic Linux environments',
      'Outstanding customer-facing verbal and written communication',
    ],
    skillsRequired: ['Desktop Support', 'IT Support', 'Help Desk', 'Remote Desktop', 'Linux', 'Troubleshooting'],
    applicationUrl: 'https://www.indeed.com/q-IT-Support-jobs.html',
    source: 'Indeed Verified',
    isFeatured: false,
  },

  // --- Network Engineer ---
  {
    title: 'Network Engineer (CCNA / Routing & Switching)',
    company: 'Cisco Systems Partner Network',
    companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&auto=format&fit=crop&q=80',
    location: 'Dallas, TX',
    remoteType: 'Hybrid',
    category: 'Network Engineer',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    salaryMin: 85000,
    salaryMax: 110000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Looking for a skilled Network Engineer to architect, maintain, and secure complex multi-site enterprise networks utilizing Cisco routers, switches, and firewalls.',
    responsibilities: [
      'Design, configure, and troubleshoot Cisco Catalyst switches, ISR routers, and ASA firewalls',
      'Manage routing protocols including BGP, OSPF, and EIGRP across redundant topologies',
      'Monitor network bandwidth, latency, and packet loss using Wireshark and SolarWinds',
      'Maintain site-to-site IPsec VPN tunnels and client SSL VPN connections',
    ],
    requirements: [
      'Active CCNA certification required (CCNP is a plus)',
      'Hands-on expertise with TCP/IP, VLAN segmentation, and subnetting',
      'Proficiency in Linux network configuration and command line utilities',
    ],
    skillsRequired: ['CCNA', 'Computer Networking', 'Cisco', 'Routing & Switching', 'Linux', 'TCP/IP', 'VPN', 'Firewalls'],
    applicationUrl: 'https://jobs.cisco.com/',
    source: 'Cisco Career Portal',
    isFeatured: true,
  },
  {
    title: 'Junior Network Operations Specialist',
    company: 'Cloudflare Connectivity Group',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
    location: 'San Jose, CA',
    remoteType: 'Remote',
    category: 'Network Engineer',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryMin: 72000,
    salaryMax: 88000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Great opportunity for aspiring networking professionals to join a 24/7 Network Operations Center (NOC) monitoring edge infrastructure and routing anomalies.',
    responsibilities: [
      'Monitor real-time network alerts, packet drops, and carrier link outages',
      'Triage routing issues using traceroute, ping, and DNS query analysis',
      'Coordinate with telecommunications carriers for circuit diagnostics and dispatch',
    ],
    requirements: [
      'Understanding of OSI 7-layer model, TCP/IP, DNS, and DHCP fundamentals',
      'Exposure to Linux environments and terminal networking commands',
      'CCNA study or certification in progress',
    ],
    skillsRequired: ['Computer Networking', 'CCNA', 'DNS', 'DHCP', 'TCP/IP', 'Linux', 'Network Troubleshooting'],
    applicationUrl: 'https://www.cloudflare.com/careers/jobs/',
    source: 'Platform Direct',
    isFeatured: false,
  },

  // --- Cyber Security ---
  {
    title: 'SOC Security Analyst (Tier 1 / Incident Response)',
    company: 'CyberShield Defense Labs',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&auto=format&fit=crop&q=80',
    location: 'Washington, DC',
    remoteType: 'Hybrid',
    category: 'Cyber Security',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryMin: 75000,
    salaryMax: 92000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Join our Security Operations Center to detect, analyze, and mitigate cyber security threats, malware infections, and suspicious network activity.',
    responsibilities: [
      'Monitor SIEM alerts (Splunk / Sentinel) and triage security telemetry',
      'Investigate phishing submissions, malware payloads, and endpoint detections',
      'Perform initial containment actions and write incident escalation reports',
    ],
    requirements: [
      'Familiarity with network protocols, packet inspection, and attack vectors',
      'CompTIA Security+, CySA+, or CEH certification',
      'Understanding of MITRE ATT&CK framework and Linux security logs',
    ],
    skillsRequired: ['Cyber Security', 'SIEM', 'SOC', 'Incident Response', 'CompTIA Security+', 'Linux', 'Computer Networking'],
    applicationUrl: 'https://www.linkedin.com/jobs/cyber-security-jobs/',
    source: 'LinkedIn Talent',
    isFeatured: true,
  },
  {
    title: 'Information Security Engineer',
    company: 'Fortress Security Labs',
    companyLogo: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=128&auto=format&fit=crop&q=80',
    location: 'Boston, MA',
    remoteType: 'Remote',
    category: 'Cyber Security',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    salaryMin: 115000,
    salaryMax: 145000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Lead vulnerability assessments, cloud perimeter defense, and zero-trust policy enforcement across hybrid enterprise networks.',
    responsibilities: [
      'Deploy and tune next-generation firewalls (Palo Alto, Fortinet)',
      'Conduct regular vulnerability scanning and penetration test simulations',
      'Implement Identity & Access Management (IAM) and multi-factor security policies',
    ],
    requirements: [
      '3+ years practical cyber security engineering experience',
      'Solid command of Linux internals, script automation (Python/Bash)',
      'CISSP or CEH credential',
    ],
    skillsRequired: ['Cyber Security', 'Penetration Testing', 'Firewalls', 'Vulnerability Assessment', 'Python', 'Linux', 'AWS'],
    applicationUrl: 'https://careers.microsoft.com/',
    source: 'Direct Partner',
    isFeatured: false,
  },

  // --- Software Developer ---
  {
    title: 'Full-Stack JavaScript / React Engineer',
    company: 'NexGen Web Platforms',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    remoteType: 'Remote',
    category: 'Software Developer',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    salaryMin: 105000,
    salaryMax: 135000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Build modern, responsive, high-scale web applications using React, Node.js, Tailwind CSS, and RESTful microservices.',
    responsibilities: [
      'Develop modular and reusable React components with clean state management',
      'Build scalable backend REST APIs in Node.js and Express',
      'Optimize database queries and ensure high Lighthouse performance benchmarks',
    ],
    requirements: [
      'Strong proficiency in JavaScript (ES6+), React, and Node.js',
      'Experience with modern styling tools such as Tailwind CSS',
      'Familiarity with Git, automated testing, and CI/CD pipelines',
    ],
    skillsRequired: ['JavaScript', 'React', 'Node.js', 'Express', 'Tailwind CSS', 'REST APIs', 'Git', 'MongoDB'],
    applicationUrl: 'https://jobs.github.com/',
    source: 'GitHub Careers',
    isFeatured: true,
  },
  {
    title: 'Junior Frontend Developer (React & UI/UX)',
    company: 'DesignFlow Creative Studio',
    companyLogo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80',
    location: 'Seattle, WA',
    remoteType: 'Hybrid',
    category: 'Software Developer',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryMin: 65000,
    salaryMax: 82000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Exciting entry role for creative developers eager to craft fluid web interfaces and interactive client dashboards.',
    responsibilities: [
      'Translate Figma design mockups into pixel-perfect responsive HTML/CSS/React code',
      'Consume backend REST APIs and implement intuitive form validations',
      'Collaborate with product designers on accessibility (a11y) standards',
    ],
    requirements: [
      'Solid command of HTML5, CSS3, JavaScript, and React',
      'Passion for clean design and mobile-first responsiveness',
      'Portfolio or GitHub repositories demonstrating frontend projects',
    ],
    skillsRequired: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Git', 'REST APIs'],
    applicationUrl: 'https://angel.co/jobs',
    source: 'Wellfound / AngelList',
    isFeatured: false,
  },
  {
    title: 'Backend API Engineer (Python & FastAPI)',
    company: 'DataVessel Labs',
    companyLogo: 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=128&auto=format&fit=crop&q=80',
    location: 'Denver, CO',
    remoteType: 'Remote',
    category: 'Software Developer',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    salaryMin: 98000,
    salaryMax: 125000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Architect resilient data streaming services and high-throughput RESTful endpoints using Python, PostgreSQL, and Docker.',
    responsibilities: [
      'Build asynchronous API microservices with Python and FastAPI',
      'Integrate machine learning inference pipelines and OpenAI models',
      'Implement Redis caching and database indexing optimizations',
    ],
    requirements: [
      '2+ years Python backend development',
      'Knowledge of SQL, Docker, and API security (JWT / OAuth2)',
    ],
    skillsRequired: ['Python', 'SQL', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'Linux'],
    applicationUrl: 'https://remotive.com/',
    source: 'Remotive API (Verified)',
    isFeatured: false,
  },

  // --- Data Analyst ---
  {
    title: 'Data Analyst (SQL, Python & Power BI)',
    company: 'MetricPulse Analytics',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=128&auto=format&fit=crop&q=80',
    location: 'Chicago, IL',
    remoteType: 'Hybrid',
    category: 'Data Analyst',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryMin: 68000,
    salaryMax: 86000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Transform complex business datasets into intuitive dashboards, predictive indicators, and executive summaries.',
    responsibilities: [
      'Write complex SQL queries, window functions, and views across relational warehouses',
      'Design interactive Power BI and Tableau dashboards for cross-departmental stakeholders',
      'Perform exploratory data analysis using Python (Pandas, NumPy)',
    ],
    requirements: [
      'Strong command of SQL data aggregation and schema design',
      'Proficiency in data visualization tools (Power BI, Tableau, or Excel Pivot)',
      'Degree in Computer Science, Statistics, Mathematics, or related experience',
    ],
    skillsRequired: ['SQL', 'Data Analysis', 'Power BI', 'Tableau', 'Python', 'Pandas', 'Excel'],
    applicationUrl: 'https://www.kaggle.com/jobs',
    source: 'Verified Platform Direct',
    isFeatured: true,
  },

  // --- Cloud / DevOps ---
  {
    title: 'Cloud Support & Infrastructure Engineer (AWS)',
    company: 'CloudScale Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&auto=format&fit=crop&q=80',
    location: 'Atlanta, GA',
    remoteType: 'Remote',
    category: 'Cloud / DevOps',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    salaryMin: 90000,
    salaryMax: 118000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
    description: 'Provide operational support, infrastructure automation, and container orchestration across Amazon Web Services environments.',
    responsibilities: [
      'Maintain AWS EC2 instances, VPC peering, Route 53, and S3 storage policies',
      'Support Docker container builds and CI/CD pipelines',
      'Diagnose Linux server performance bottlenecks, memory leaks, and disk I/O',
    ],
    requirements: [
      '2+ years supporting cloud workloads on AWS or Azure',
      'Strong Linux shell scripting (Bash/Python)',
      'AWS Certified Solutions Architect or Cloud Practitioner',
    ],
    skillsRequired: ['AWS', 'Linux', 'Docker', 'Computer Networking', 'Bash', 'CI/CD', 'Troubleshooting'],
    applicationUrl: 'https://aws.amazon.com/careers/',
    source: 'AWS Careers',
    isFeatured: false,
  },
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 [Seeder] Beginning database seeding process...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      SavedJob.deleteMany({}),
      Application.deleteMany({}),
    ]);

    // 1. Create Admin User
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@jobfinder.ai',
      password: 'Admin@123456',
      role: 'admin',
      profile: {
        headline: 'Lead Platform Administrator',
        bio: 'Supervising platform health, job curation, and user safety on AI Job Finder.',
        phone: '+1 (555) 019-2831',
        skills: ['System Administration', 'Network Security', 'Active Directory', 'Cloud Management'],
        preferredLocation: 'San Francisco, CA',
      },
    });
    console.log('✅ [Seeder] Admin user created: admin@jobfinder.ai / Admin@123456');

    // 2. Create Demo Job Seeker User (matches the user profile in prompt example)
    const seeker = await User.create({
      name: 'Alex Rivera',
      email: 'seeker@jobfinder.ai',
      password: 'Seeker@123456',
      role: 'user',
      profile: {
        headline: 'IT Support Specialist & Aspiring Network Engineer',
        bio: 'Dedicated IT professional with solid foundations in networking, desktop systems, and troubleshooting. Passionate about maintaining secure and reliable infrastructure.',
        phone: '+1 (555) 342-8901',
        skills: [
          'Computer Networking',
          'CCNA',
          'Linux',
          'Desktop Support',
          'Active Directory',
          'TCP/IP',
          'Windows Server',
          'Troubleshooting',
          'Office 365',
        ],
        preferredLocation: 'Dallas, TX',
        preferredJobTypes: ['Full-time', 'Contract'],
        education: [
          {
            school: 'State Institute of Technology',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Networks & Systems',
            startYear: '2020',
            endYear: '2024',
          },
        ],
        experience: [
          {
            title: 'Junior Desktop Support Technician',
            company: 'TechServe Solutions',
            location: 'Dallas, TX',
            startDate: '2024-01',
            endDate: 'Present',
            current: true,
            description: 'Provide daily Tier 1-2 desktop support, configure workstation images, manage user accounts in Active Directory, and resolve network connectivity issues.',
          },
        ],
      },
    });
    console.log('✅ [Seeder] Demo job seeker created: seeker@jobfinder.ai / Seeker@123456');

    // 3. Insert Jobs with admin reference
    const jobsWithAdmin = seedJobsData.map((j) => ({
      ...j,
      createdBy: admin._id,
    }));
    const createdJobs = await Job.insertMany(jobsWithAdmin);
    console.log(`✅ [Seeder] Seeded ${createdJobs.length} realistic jobs across all categories.`);

    // 4. Create initial saved job for seeker
    const networkJob = createdJobs.find((j) => j.category === 'Network Engineer');
    const itJob = createdJobs.find((j) => j.category === 'IT Support');

    if (networkJob) {
      await SavedJob.create({
        user: seeker._id,
        job: networkJob._id,
      });
      console.log('✅ [Seeder] Created demo saved job bookmark for seeker.');
    }

    // 5. Create demo tracked application
    if (itJob) {
      await Application.create({
        user: seeker._id,
        job: itJob._id,
        jobTitle: itJob.title,
        companyName: itJob.company,
        location: itJob.location,
        applicationUrl: itJob.applicationUrl,
        status: 'Applied',
        notes: 'Submitted resume highlighting CCNA coursework and desktop support experience.',
        applicationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        timeline: [
          {
            status: 'Interested',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            note: 'Discovered opening on AI Job Finder platform.',
          },
          {
            status: 'Applied',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            note: 'Submitted application on company portal.',
          },
        ],
      });
      console.log('✅ [Seeder] Created demo application tracking item.');
    }

    console.log('✨ [Seeder] Database seeding finished successfully.');
  } catch (error) {
    console.error('❌ [Seeder Error]:', error);
  }
};

/**
 * Checks if jobs table is empty and seeds initial data automatically
 */
export const seedDatabaseIfEmpty = async () => {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      console.log('ℹ️ [Seeder] No jobs found in database. Automatically running initial seed...');
      await seedDatabase();
    } else {
      console.log(`ℹ️ [Database] Database currently has ${jobCount} active job listings.`);
    }
  } catch (err) {
    console.error('⚠️ [Seeder check failed]:', err.message);
  }
};

// If run directly: `node seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await mongoose.disconnect();
    process.exit(0);
  })();
}
