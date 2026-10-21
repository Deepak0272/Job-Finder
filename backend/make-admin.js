import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storePath = path.join(__dirname, 'data', 'store.json');

async function makeAdmin() {
  const raw = fs.readFileSync(storePath, 'utf-8');
  const store = JSON.parse(raw);

  // 1. Promote seeker to admin as well
  const seeker = store.users.find((u) => u.email === 'seeker@jobfinder.ai');
  if (seeker) {
    seeker.role = 'admin';
    console.log('✅ seeker@jobfinder.ai promoted to admin!');
  }

  // 2. Create Deepak Sahani Admin account if not existing
  let deepak = store.users.find((u) => u.email === 'deepak@jobfinder.ai');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Admin@123456', salt);

  if (!deepak) {
    deepak = {
      _id: 'deepak_admin_' + Date.now().toString(36),
      id: 'deepak_admin_' + Date.now().toString(36),
      name: 'Deepak Sahani',
      email: 'deepak@jobfinder.ai',
      password: hashedPassword,
      role: 'admin',
      profile: {
        headline: 'Lead System Administrator & Engineer',
        bio: 'Platform owner and administrator for AI Job Finder.',
        phone: '+1 (555) 890-1234',
        skills: [
          'Computer Networking',
          'CCNA',
          'Linux',
          'Cyber Security',
          'System Administration',
          'Software Development',
          'Docker',
          'Cloud / DevOps'
        ],
        preferredLocation: 'Remote',
        preferredJobTypes: ['Full-time'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.users.unshift(deepak);
    console.log('✅ Deepak Sahani created as Super Admin (deepak@jobfinder.ai / Admin@123456)');
  } else {
    deepak.role = 'admin';
    deepak.password = hashedPassword;
    console.log('✅ Deepak Sahani updated to admin!');
  }

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
  console.log('✨ store.json updated successfully!');
}

makeAdmin();
